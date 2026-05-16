import asyncio
import uuid
import sys
sys.path.append("/root/MedTrustX/Project/services/iam-service")
from src.database import AsyncSessionFactory, engine, init_db
from src.models.iam import User, Role, UserRole
from src.services.iam_service import get_password_hash
from sqlalchemy import select, delete

DEMO_USERS = [
    {"username": "dr.smith", "role": "Head of Department", "password": "medtrust2026"},
    {"username": "nurse.joy", "role": "Staff Nurse", "password": "medtrust2026"},
    {"username": "icu.dr.jones", "role": "Specialist Emergency Critical Care", "password": "medtrust2026"},
    {"username": "admin", "role": "Super Administrator", "password": "keycloak_admin_2026"},
]

async def main():
    await init_db()
    tenant_id = uuid.uuid5(uuid.NAMESPACE_DNS, "tenant_apollo")
    async with AsyncSessionFactory() as session:
        for du in DEMO_USERS:
            res = await session.execute(select(Role).where(Role.name == du["role"]).limit(1))
            r_obj = res.scalar_one_or_none()
            if r_obj:
                res = await session.execute(select(User).where(User.username == du["username"]).limit(1))
                u_obj = res.scalar_one_or_none()
                if not u_obj:
                    u_obj = User(
                        tenant_id=tenant_id,
                        username=du["username"],
                        email=f"{du['username']}@medtrustx.in",
                        password_hash=get_password_hash(du["password"]),
                        status="active"
                    )
                    session.add(u_obj)
                    await session.flush()
                else:
                    u_obj.password_hash = get_password_hash(du["password"])
                
                ur_res = await session.execute(select(UserRole).where(UserRole.user_id == u_obj.id).where(UserRole.role_id == r_obj.id).limit(1))
                ur_obj = ur_res.scalar_one_or_none()
                if not ur_obj:
                    ur_obj = UserRole(tenant_id=tenant_id, user_id=u_obj.id, role_id=r_obj.id)
                    session.add(ur_obj)
        await session.commit()
        print("Demo users seeded successfully!")

if __name__ == "__main__":
    asyncio.run(main())
