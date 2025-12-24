import logging
import time
from datetime import datetime, timezone


from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger


from ..application.monitor_service import run_monitor
from ..config import Settings
from .telegram import send_telegram_message

logger = logging.getLogger(__name__)

def _job(settings: Settings) -> None:
    result = run_monitor(settings.source_url, settings.db_path);

    if result["changed"]:
        now_iso = datetime.now(timezone.utc).isoformat();
        logger.info(
        "Change detected | added=%s removed=%s updated=%s",
        len(result["added"]),
        len(result["removed"]),
        len(result["updated"]),
    )
        if settings.telegram_bot_token and settings.telegram_chat_id:
            msg = "\n".join([
                "AutoMonitor alert",
                f"Time: {now_iso}",
                format_products("Added", result["added"]),
                format_products("Removed", result["removed"]),
                format_products("Updated", result["updated"]),
                f"Source: {settings.source_url}",
            ])
            send_telegram_message(settings.telegram_bot_token, settings.telegram_chat_id, msg);
            logger.info("Telegram notification sent.");
        else: 
            logger.info("Telegram settings not configured; skipping notification.");
    else:
        logger.info("No changes detected (scheduled run).");

def run_scheduler(settings: Settings) -> None:
    scheduler = BackgroundScheduler(timezone="UTC");
    scheduler.add_job(_job, 
                      trigger=IntervalTrigger(seconds=settings.run_interval_seconds), 
                      args=[settings], 
                      id="automonitor_job",
                      max_instances=1,
                      coalesce=True,
                      misfire_grace_time=30, 
                      replace_existing=True);
    scheduler.start();
    logger.info("Scheduler started with interval of %d seconds.", settings.run_interval_seconds);

    try:
        while True:
            time.sleep(1);
    except KeyboardInterrupt:
        logger.info("Shutting down scheduler...");
        scheduler.shutdown(wait=True);
        logger.info("Scheduler shut down successfully.");


def format_products(label: str, items: list[dict], limit: int = 8) -> str:
    if not items:
        return f"{label}: 0"

    lines = [f"{label}: {len(items)}"]
    for p in items[:limit]:
        pid = p.get("id", "?")
        title = p.get("title", "?")
        price = p.get("price", "?")
        lines.append(f"- #{pid} {title} — ${price}")

    remaining = len(items) - limit
    if remaining > 0:
        lines.append(f"... +{remaining} más")

    return "\n".join(lines)
