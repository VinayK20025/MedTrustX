"""
PQC + RS256 Hybrid JWT Validation.
"""
from typing import Any, Dict

from jose import jwt, JWTError
from fastapi import HTTPException

from app.auth.keycloak import get_jwks
from app.config import settings

def _get_rsa_key(kid: str, jwks: Dict[str, Any]) -> Dict[str, Any]:
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    raise HTTPException(status_code=401, detail="Public key not found in JWKS")

async def validate_pqc_jwt(token: str, pqc_session_key: str | None = None) -> Dict[str, Any]:
    """
    Validate the JWT using RS256 from Keycloak.
    PQC validation checks for the existence of the PQC session key header.
    """
    if settings.pqc_enabled and not pqc_session_key:
        raise HTTPException(status_code=401, detail=f"Missing {settings.pqc_session_header} header")
        
    try:
        # Fetch JWKS
        jwks = await get_jwks()
        
        # Decode header to find kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="JWT missing kid")
            
        rsa_key = _get_rsa_key(kid, jwks)
        
        # Verify RS256
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT: {str(e)}")
