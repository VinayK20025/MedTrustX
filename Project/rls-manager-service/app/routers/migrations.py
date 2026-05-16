from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict
import asyncio

router = APIRouter(prefix="/api/rls/migrations", tags=["migrations"])

class MigrationRunRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    migration_id: str
    database: str
    dry_run: bool = False

def _check_superadmin(request: Request):
    roles = getattr(request.state, "roles", [])
    if "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Superadmin role required")

@router.post("/run")
async def run_migration(request_body: MigrationRunRequest, request: Request):
    _check_superadmin(request)
    from fastapi.responses import StreamingResponse
    
    async def event_stream():
        import subprocess
        # Alembic command expects an environment variable to target specific database connection string
        cmd = ["alembic", "-n", request_body.database, "upgrade", request_body.migration_id]
        if request_body.dry_run:
            cmd.append("--sql")
            
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )
        
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            yield f"data: {line.decode('utf-8')}\n\n"
            
        await process.wait()
        yield f"data: COMPLETED with code {process.returncode}\n\n"
        
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@router.get("/status")
async def get_migration_status(request: Request):
    _check_superadmin(request)
    return {
        "databases": {
            "clinical": {"current_version": "head", "pending": []},
            "operational": {"current_version": "head", "pending": []},
            "iam": {"current_version": "head", "pending": []},
            "analytics": {"current_version": "head", "pending": []}
        },
        "last_migration_timestamp": "2026-05-15T00:00:00Z"
    }
