"""
Background Scheduler for APScheduler tasks.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.observability.logging import get_logger

logger = get_logger(__name__)

scheduler = AsyncIOScheduler()

async def automated_gap_analysis_task():
    logger.info("Running automated gap analysis scans...")
    pass

async def start_scheduler():
    scheduler.add_job(automated_gap_analysis_task, "cron", hour=2, minute=0)
    scheduler.start()
    logger.info("Compliance scheduler started")

async def stop_scheduler():
    scheduler.shutdown()
    logger.info("Compliance scheduler stopped")
