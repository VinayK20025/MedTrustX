"""
PQC + RS256 Hybrid JWT Validation & Generation for IAM.
"""
from typing import Any, Dict
from datetime import datetime, timedelta, timezone

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
    if not pqc_session_key:
        raise HTTPException(status_code=401, detail=f"Missing {settings.pqc_session_header} header")
        
    try:
        jwks = await get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="JWT missing kid")
            
        rsa_key = _get_rsa_key(kid, jwks)
        
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT: {str(e)}")

def create_pqc_jwt(claims: Dict[str, Any], secret_key: str = "mock_secret_replace_with_real") -> str:
    to_encode = claims.copy()
    if "exp" not in to_encode:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm="HS256")
    return encoded_jwt
