import pytest
import asyncio
from unittest.mock import Mock

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def mock_redis():
    mock = Mock()
    mock.get = asyncio.coroutine(lambda k: None)
    mock.setex = asyncio.coroutine(lambda k, t, v: None)
    mock.publish = asyncio.coroutine(lambda k, v: None)
    return mock

@pytest.fixture
def mock_db_session():
    mock = Mock()
    mock.execute = asyncio.coroutine(lambda *args, **kwargs: Mock(scalar=lambda: 0, mappings=lambda: Mock(first=lambda: None, all=lambda: [])))
    mock.commit = asyncio.coroutine(lambda: None)
    return mock
