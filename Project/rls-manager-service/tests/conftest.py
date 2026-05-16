import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

@pytest_asyncio.fixture(scope="session")
async def clinical_engine():
    engine = create_async_engine(settings.clinical_db_url)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture(scope="session")
async def operational_engine():
    engine = create_async_engine(settings.operational_db_url)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture
async def clinical_session(clinical_engine):
    async_session = async_sessionmaker(clinical_engine, expire_on_commit=False)
    async with async_session() as session:
        yield session

@pytest_asyncio.fixture
async def operational_session(operational_engine):
    async_session = async_sessionmaker(operational_engine, expire_on_commit=False)
    async with async_session() as session:
        yield session

@pytest.fixture
def mock_superadmin_auth(monkeypatch):
    from app.auth.middleware import PQCAuthMiddleware
    
    async def mock_dispatch(self, request, call_next):
        request.state.tenant_id = "e540de79-f14e-51c6-a6fc-fdf5b103e687"
        request.state.user_id = "00000000-0000-0000-0000-000000000001"
        request.state.roles = ["superadmin"]
        return await call_next(request)
        
    monkeypatch.setattr(PQCAuthMiddleware, "dispatch", mock_dispatch)
