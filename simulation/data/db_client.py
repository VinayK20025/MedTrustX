"""PostgreSQL connection and query wrapper using psycopg2."""
import psycopg2
import psycopg2.extras
from typing import Optional, Any
from config import DB_CONFIGS, DB_TIMEOUT
from core.colors import print_warn

_connections: dict = {}

def get_connection(db_key: str):
    """Get or create psycopg2 connection."""
    if db_key not in _connections:
        try:
            cfg = DB_CONFIGS[db_key].copy()
            cfg['connect_timeout'] = DB_TIMEOUT
            conn = psycopg2.connect(**cfg)
            conn.autocommit = True
            _connections[db_key] = conn
        except Exception as e:
            return None
    try:
        _connections[db_key].cursor().execute("SELECT 1")
        return _connections[db_key]
    except Exception:
        _connections.pop(db_key, None)
        return None

def query(db_key: str, sql: str,
          params: tuple = ()) -> Optional[list[dict]]:
    """Execute SQL, return list of dicts or None."""
    conn = get_connection(db_key)
    if not conn:
        return None
    try:
        with conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        ) as cur:
            cur.execute(sql, params)
            if cur.description:
                return [dict(row) for row in cur.fetchall()]
            return []
    except Exception as e:
        print_warn(f"DB query failed [{db_key}]: {e}")
        return None

def query_scalar(db_key: str, sql: str,
                 params: tuple = (),
                 fallback: Any = None) -> Any:
    """Execute SQL, return first column of first row."""
    rows = query(db_key, sql, params)
    if rows and len(rows) > 0:
        first_row = rows[0]
        if first_row:
            return list(first_row.values())[0]
    return fallback

def query_with_rls(db_key: str, tenant_id: str,
                   sql: str,
                   params: tuple = ()) -> Optional[list[dict]]:
    """Execute SQL with RLS tenant context set."""
    rls_sql = (
        f"SET LOCAL app.tenant_id = '{tenant_id}'; {sql}"
    )
    return query(db_key, rls_sql, params)

def scalar_with_rls(db_key: str, tenant_id: str,
                    sql: str, fallback: Any = None) -> Any:
    """Scalar query with RLS context."""
    rows = query_with_rls(db_key, tenant_id, sql)
    if rows and len(rows) > 0:
        first_row = rows[0]
        if first_row:
            return list(first_row.values())[0]
    return fallback

def test_connection(db_key: str) -> bool:
    """Test if database is reachable."""
    result = query_scalar(db_key, "SELECT 1", fallback=None)
    return result is not None

def close_all() -> None:
    """Close all open connections."""
    for conn in _connections.values():
        try:
            conn.close()
        except Exception:
            pass
    _connections.clear()
