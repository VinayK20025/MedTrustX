import asyncio
import uuid
import sys
sys.path.append("/root/MedTrustX/Project/services/iam-service")
from src.database import AsyncSessionFactory
from src.services.iam_service import authenticate_user

async def main():
    tenant_id = uuid.uuid5(uuid.NAMESPACE_DNS, "tenant_apollo")
    async with AsyncSessionFactory() as session:
        user = await authenticate_user(session, tenant_id, "demo@chief-executive-officer.local.medtrustx", "Chief_Executive_Officer@1Demo")
        print(f"Authenticated user: {user}")

if __name__ == "__main__":
    asyncio.run(main())
