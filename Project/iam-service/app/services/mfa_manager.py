"""
MFA Manager Service.
"""
from typing import Dict, Any, Tuple
from uuid import UUID
import json
import base64
import os

import pyotp
from webauthn import generate_registration_options, verify_registration_response
from webauthn import generate_authentication_options, verify_authentication_response
from webauthn.helpers.structs import PublicKeyCredentialCreationOptions, PublicKeyCredentialRequestOptions, PublicKeyCredentialDescriptor
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace

from app.db.repositories.user_repo import UserRepository
from app.config import settings

tracer = trace.get_tracer(__name__)

class MFAManager:
    def __init__(self, session: AsyncSession, redis: Redis):
        self.user_repo = UserRepository(session)
        self.redis = redis

    async def _get_user_metadata(self, user_id: UUID) -> Dict[str, Any]:
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        return user.get("metadata", {})

    async def _update_user_metadata(self, user_id: UUID, metadata: Dict[str, Any]) -> None:
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        await self.user_repo.update_user(user_id, user["status"], metadata)

    async def enroll_totp(self, user_id: UUID, username: str) -> Dict[str, Any]:
        with tracer.start_as_current_span("iam.mfa.totp_enroll"):
            secret = pyotp.random_base32()
            totp = pyotp.TOTP(secret)
            uri = totp.provisioning_uri(name=username, issuer_name="MedTrustX")
            
            backup_codes = [base64.b32encode(os.urandom(5)).decode('utf-8')[:8] for _ in range(10)]
            
            metadata = await self._get_user_metadata(user_id)
            metadata["totp_secret"] = secret
            metadata["backup_codes"] = backup_codes
            if "mfa_enrolled" not in metadata:
                metadata["mfa_enrolled"] = []
            if "totp" not in metadata["mfa_enrolled"]:
                metadata["mfa_enrolled"].append("totp")
                
            await self._update_user_metadata(user_id, metadata)
            
            return {
                "secret": secret,
                "qr_code_url": uri,
                "backup_codes": backup_codes
            }

    async def verify_totp(self, user_id: UUID, code: str) -> bool:
        with tracer.start_as_current_span("iam.mfa.totp_verify"):
            metadata = await self._get_user_metadata(user_id)
            secret = metadata.get("totp_secret")
            if not secret:
                return False
                
            totp = pyotp.TOTP(secret)
            return totp.verify(code, valid_window=1)

    async def fido2_register_begin(self, user_id: UUID, username: str) -> Dict[str, Any]:
        with tracer.start_as_current_span("iam.mfa.fido2_register_begin"):
            options = generate_registration_options(
                rp_id=settings.rp_id,
                rp_name=settings.rp_name,
                user_id=str(user_id).encode(),
                user_name=username,
            )
            
            challenge = options.challenge
            await self.redis.setex(f"medtrust:fido2:challenge:{user_id}", 300, challenge)
            
            return json.loads(options.json())

    async def fido2_register_complete(self, user_id: UUID, credential_data: Dict[str, Any]) -> Dict[str, Any]:
        with tracer.start_as_current_span("iam.mfa.fido2_register_complete"):
            challenge = await self.redis.get(f"medtrust:fido2:challenge:{user_id}")
            if not challenge:
                raise ValueError("Challenge expired or not found")
                
            verification = verify_registration_response(
                credential=credential_data,
                expected_challenge=challenge,
                expected_origin=f"https://{settings.rp_id}",
                expected_rp_id=settings.rp_id
            )
            
            metadata = await self._get_user_metadata(user_id)
            if "fido2_credentials" not in metadata:
                metadata["fido2_credentials"] = []
                
            metadata["fido2_credentials"].append({
                "credential_id": verification.credential_id.hex(),
                "public_key": verification.credential_public_key.hex(),
                "sign_count": verification.sign_count
            })
            
            if "mfa_enrolled" not in metadata:
                metadata["mfa_enrolled"] = []
            if "fido2" not in metadata["mfa_enrolled"]:
                metadata["mfa_enrolled"].append("fido2")
                
            await self._update_user_metadata(user_id, metadata)
            await self.redis.delete(f"medtrust:fido2:challenge:{user_id}")
            
            return {"registered": True, "credential_id": verification.credential_id.hex()}

    async def fido2_auth_begin(self, user_id: UUID) -> Dict[str, Any]:
        metadata = await self._get_user_metadata(user_id)
        creds = metadata.get("fido2_credentials", [])
        allow_credentials = [
            PublicKeyCredentialDescriptor(id=bytes.fromhex(c["credential_id"]))
            for c in creds
        ]
        
        options = generate_authentication_options(
            rp_id=settings.rp_id,
            allow_credentials=allow_credentials
        )
        
        await self.redis.setex(f"medtrust:fido2:auth_challenge:{user_id}", 300, options.challenge)
        return json.loads(options.json())

    async def fido2_auth_complete(self, user_id: UUID, assertion_data: Dict[str, Any]) -> bool:
        challenge = await self.redis.get(f"medtrust:fido2:auth_challenge:{user_id}")
        if not challenge:
            return False
            
        metadata = await self._get_user_metadata(user_id)
        creds = metadata.get("fido2_credentials", [])
        
        cred_id = assertion_data.get("id")
        stored_cred = next((c for c in creds if c["credential_id"] == cred_id), None)
        
        if not stored_cred:
            return False
            
        try:
            verification = verify_authentication_response(
                credential=assertion_data,
                expected_challenge=challenge,
                expected_origin=f"https://{settings.rp_id}",
                expected_rp_id=settings.rp_id,
                credential_public_key=bytes.fromhex(stored_cred["public_key"]),
                credential_current_sign_count=stored_cred["sign_count"]
            )
            
            stored_cred["sign_count"] = verification.new_sign_count
            await self._update_user_metadata(user_id, metadata)
            await self.redis.delete(f"medtrust:fido2:auth_challenge:{user_id}")
            
            return True
        except Exception:
            return False
