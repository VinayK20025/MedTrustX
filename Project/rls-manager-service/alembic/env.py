from logging.config import fileConfig
from sqlalchemy import pool
from alembic import context
import asyncio
from app.config import settings
from app.db.tenant_registry import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    db_name = context.get_x_argument(as_dictionary=True).get('db', 'clinical')
    url = getattr(settings, f"{db_name}_db_url").replace("+asyncpg", "")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    db_name = context.get_x_argument(as_dictionary=True).get('db', 'clinical')
    url = getattr(settings, f"{db_name}_db_url")
    configuration = config.get_section(config.config_ini_section)
    if configuration:
        configuration["sqlalchemy.url"] = url
    
    from sqlalchemy.ext.asyncio import create_async_engine
    connectable = create_async_engine(url, poolclass=pool.NullPool)

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
