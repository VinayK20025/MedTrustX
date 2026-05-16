import asyncio
import sys
sys.path.append("/root/MedTrustX/Project/services/iam-service")
from src.database import AsyncSessionFactory, init_db
from src.models.iam import User, Role
from sqlalchemy import select

async def main():
    await init_db()
    async with AsyncSessionFactory() as session:
        users = await session.execute(select(User.username))
        print("Users:", [u[0] for u in users.all()])
        roles = await session.execute(select(Role.name))
        print("Roles:", [r[0] for r in roles.all()])

if __name__ == "__main__":
    asyncio.run(main())
