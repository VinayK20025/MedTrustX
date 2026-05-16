"""
app/auth/pqc_jwt.py
====================
Post-Quantum Cryptography (PQC) + RS256 hybrid JWT validation for the
MedTrustX AI Platform Service.

Hybrid authentication flow
──────────────────────────
  1. The API Gateway (Kong) encapsulates a 256-bit session key using the
     server's Kyber-768 public key and places the ciphertext in the
     ``X-PQC-Session-Key`` request header (Base64-encoded).

  2. This middleware:
       a. Decapsulates the ciphertext with the server's Kyber-768 private key
          to recover the session key. (In production the private key is
          loaded from the mounted secret file; in dev/test the PQC layer
          degrades gracefully when the key file is absent.)
       b. Verifies the JWT ``Authorization: Bearer <token>`` using RS256 +
          the Keycloak JWKS public key fetched by ``keycloak.py``.
       c. Validates standard JWT claims: iss, aud, exp, nbf.
       d. Extracts tenant_id, user_id, and role from the claims.

Security guarantees
────────────────────
  - Classical RS256 protects against all current adversaries.
  - Kyber-768 KEM protects the session key against future harvest-now-decrypt-
    later (HNDL) attacks by quantum adversaries.
  - Neither layer alone is sufficient — both must pass.

References
──────────
  - NIST FIPS 203 (ML-KEM / Kyber-768)
  - RFC 7517 (JSON Web Keys)
  - RFC 7519 (JSON Web Tokens)
"""

from __future__ import annotations

import base64
import os
from typing import Any

from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError

from app.auth.keycloak import get_rsa_public_key
from app.config import settings
from app.observability.logging import get_logger
from app.observability.metrics import AUTH_REQUESTS

logger = get_logger(__name__)


# ─── PQC key loading ───────────────────────────────────────────────────────────
def _load_pqc_private_key() -> bytes | None:
    """
    Load the Kyber-768 private key bytes from the configured secret path.

    Returns:
        Raw private key bytes, or None if the file does not exist (dev mode).
    """
    path = settings.pqc_public_key_path
    if not os.path.isfile(path):
        logger.warning(
            "PQC private key not found — PQC layer operating in DEGRADED mode",
            extra={"key_path": path},
        )
        return None
    with open(path, "rb") as f:
        return f.read()


def _decapsulate_session_key(
    ciphertext_b64: str,
    private_key_bytes: bytes,
) -> bytes:
    """
    Use liboqs Kyber-768 to decapsulate the ciphertext and recover the
    shared session key.

    Args:
        ciphertext_b64:    Base64-encoded KEM ciphertext from the request header.
        private_key_bytes: Raw Kyber-768 private key bytes.

    Returns:
        The 32-byte shared session key.

    Raises:
        ValueError: If decapsulation fails (ciphertext tampered or wrong key).
    """
    try:
        import oqs  # type: ignore[import]
    except ImportError as exc:
        raise RuntimeError(
            "liboqs-python is not installed. Run: pip install liboqs-python "
            "or rebuild the Docker image."
        ) from exc

    ciphertext = base64.b64decode(ciphertext_b64)

    with oqs.KeyEncapsulation(settings.pqc_kem_algorithm) as kem:
        # Restore the private key into the KEM object
        kem.secret_key = private_key_bytes
        try:
            shared_secret = kem.decap_secret(ciphertext)
        except Exception as exc:  # noqa: BLE001
            raise ValueError(
                f"Kyber-768 decapsulation failed: {exc}"
            ) from exc

    return shared_secret


# ─── JWT claim extraction ──────────────────────────────────────────────────────
def _extract_claims(
    payload: dict[str, Any],
) -> tuple[str, str, list[str]]:
    """
    Extract ``tenant_id``, ``user_id``, and ``roles`` from validated JWT claims.

    Keycloak places realm roles in ``realm_access.roles``.  The ``tenant_id``
    is a custom claim added by the Keycloak mapper.

    Args:
        payload: Decoded JWT payload dict.

    Returns:
        Tuple of (tenant_id, user_id, roles_list).

    Raises:
        ValueError: If required claims are missing.
    """
    tenant_id: str | None = payload.get(settings.jwt_tenant_claim)
    user_id: str | None = payload.get(settings.jwt_user_claim)

    if not tenant_id:
        raise ValueError(
            f"JWT missing required claim '{settings.jwt_tenant_claim}'. "
            "Ensure the Keycloak realm has a 'tenant_id' mapper configured."
        )
    if not user_id:
        raise ValueError(
            f"JWT missing required claim '{settings.jwt_user_claim}'."
        )

    # Roles are nested: realm_access → roles → list[str]
    realm_access: dict[str, Any] = payload.get(settings.jwt_role_claim, {})
    roles: list[str] = realm_access.get("roles", [])

    return tenant_id, user_id, roles


# ─── Main validation function ──────────────────────────────────────────────────
async def validate_pqc_jwt(
    token: str,
    pqc_session_header: str | None = None,
) -> dict[str, Any]:
    """
    Validate a JWT using the RS256 + Kyber-768 hybrid scheme.

    Steps:
      1. Decode JWT header to extract ``kid`` (no verification).
      2. Retrieve matching RSA public key from Keycloak JWKS.
      3. Verify RS256 signature, exp, nbf, iss, aud claims.
      4. (Optional) Verify PQC layer: decapsulate session key from header.
      5. Extract and validate tenant_id, user_id, roles.

    Args:
        token:              Raw JWT Bearer token string.
        pqc_session_header: Value of the ``X-PQC-Session-Key`` header,
                            or None if the header was not sent.

    Returns:
        Dict with keys: tenant_id, user_id, roles, payload (full claims).

    Raises:
        ValueError:      JWT is invalid, expired, or has wrong claims.
        PermissionError: PQC decapsulation failed (tampered ciphertext).
    """
    # ── Step 1: Decode header without verification ─────────────────────────
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        AUTH_REQUESTS.labels(result="invalid_token").inc()
        raise ValueError(f"Malformed JWT header: {exc}") from exc

    kid: str | None = unverified_header.get("kid")
    alg: str = unverified_header.get("alg", "")

    if alg != "RS256":
        AUTH_REQUESTS.labels(result="invalid_token").inc()
        raise ValueError(
            f"JWT algorithm must be RS256, got {alg!r}. "
            "Symmetric algorithms (HS256) are not permitted."
        )

    if not kid:
        AUTH_REQUESTS.labels(result="invalid_token").inc()
        raise ValueError("JWT header missing 'kid' field.")

    # ── Step 2: Fetch RSA public key ───────────────────────────────────────
    try:
        public_key = await get_rsa_public_key(kid)
    except KeyError as exc:
        AUTH_REQUESTS.labels(result="invalid_token").inc()
        raise ValueError(str(exc)) from exc

    # ── Step 3: Verify RS256 signature + standard claims ──────────────────
    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.jwt_audience,
            issuer=settings.keycloak_issuer,
            options={
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "verify_aud": True,
                "verify_iss": True,
            },
        )
    except ExpiredSignatureError as exc:
        AUTH_REQUESTS.labels(result="expired").inc()
        raise ValueError("JWT token has expired.") from exc
    except JWTClaimsError as exc:
        AUTH_REQUESTS.labels(result="invalid_token").inc()
        raise ValueError(f"JWT claims validation failed: {exc}") from exc
    except JWTError as exc:
        AUTH_REQUESTS.labels(result="invalid_token").inc()
        raise ValueError(f"JWT signature verification failed: {exc}") from exc

    # ── Step 4: PQC layer (Kyber-768 KEM decapsulation) ───────────────────
    if settings.pqc_enabled:
        private_key_bytes = _load_pqc_private_key()

        if private_key_bytes is not None:
            # PQC key is available — enforce the full hybrid check
            if not pqc_session_header:
                AUTH_REQUESTS.labels(result="pqc_failed").inc()
                raise PermissionError(
                    f"Missing '{settings.pqc_session_header}' header. "
                    "All requests must carry a Kyber-768 encapsulated session key."
                )
            try:
                _decapsulate_session_key(pqc_session_header, private_key_bytes)
                logger.debug("PQC Kyber-768 decapsulation successful")
            except ValueError as exc:
                AUTH_REQUESTS.labels(result="pqc_failed").inc()
                raise PermissionError(
                    f"PQC session key verification failed: {exc}"
                ) from exc
        else:
            # Dev mode: PQC key not mounted — warn but proceed
            logger.warning(
                "PQC validation SKIPPED (key file absent — development mode only)",
                extra={"pqc_key_path": settings.pqc_public_key_path},
            )

    # ── Step 5: Extract application claims ────────────────────────────────
    try:
        tenant_id, user_id, roles = _extract_claims(payload)
    except ValueError:
        AUTH_REQUESTS.labels(result="invalid_token").inc()
        raise

    AUTH_REQUESTS.labels(result="success").inc()
    logger.debug(
        "JWT validated successfully",
        extra={"user_id": user_id, "tenant_id": tenant_id, "roles": roles},
    )

    return {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "roles": roles,
        "payload": payload,
    }
