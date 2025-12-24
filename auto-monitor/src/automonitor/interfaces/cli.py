import logging
import sys
from datetime import datetime, timezone

from ..config import get_settings
from ..application.monitor_service import run_monitor
from ..infrastructure.telegram import send_telegram_message
from ..infrastructure.scheduler import run_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


def run_once() -> None:
    settings = get_settings();
    result = run_monitor(settings.source_url, settings.db_path)

    if result["changed"]:
        logging.info(
         "Change detected | added=%s removed=%s updated=%s",
            len(result["added"]),
            len(result["removed"]),
            len(result["updated"]),
        )
        if settings.telegram_bot_token and settings.telegram_chat_id:
            # now_iso = datetime.now(timezone.utc).isoformat()
            msg = "\n".join([
                "AutoMonitor alert",
                format_products("Added", result["added"]),
                format_products("Removed", result["removed"]),
                format_products("Updated", result["updated"]),
                f"Source: {settings.source_url}",
            ])
            send_telegram_message(
                settings.telegram_bot_token,
                settings.telegram_chat_id,
                msg
            )
            logging.info("Telegram notification sent.")
        else:
            logging.info("Telegram settings not configured; skipping notification.")
    else:
        logging.info("No changes detected.")

def format_products(label: str, items: list[dict], limit: int = 5) -> str:
    if not items:
        return f"{label}: 0"
    
    lines = [f"{label}: {len(items)}"]
    for p in items[:limit]:
        pid = p.get("id", "?")
        title = p.get("title", "?")
        price = p.get("price", "?")
        lines.append(f" - ID: {pid}, Title: {title}, Price: ${price}")

    if len(items) > limit:
        lines.append(f"... + {len(items) - limit} más")
    return "\n".join(lines)

def main() -> None:
    # Uso:
    # python -m src.automonitor.interfaces.cli run
    # python -m src.automonitor.interfaces.cli watch
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"

    if cmd == "run":
        run_once()
        return

    if cmd == "watch":
        settings = get_settings()
        run_scheduler(settings)
        return

    raise SystemExit("Usage: python -m src.automonitor.cli [run|watch]")


if __name__ == "__main__":
    main()
