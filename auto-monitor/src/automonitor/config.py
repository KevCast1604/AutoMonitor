from dataclasses import dataclass
import os
from dotenv import load_dotenv
from fastapi import FastAPI

# Load environment variables from .env file

load_dotenv();

@dataclass(frozen=True)
class Settings:
    source_url: str
    db_path: str
    telegram_bot_token: str | None
    telegram_chat_id: str | None
    run_interval_seconds: int

def get_settings() -> Settings:
    source_url = os.getenv("SOURCE_URL", "").strip();
    db_path = os.getenv("DB_PATH", "automonitor.db").strip();


    if not source_url:
        raise ValueError("SOURCE_URL environment variable is not set or is empty.");

    token = os.getenv("TELEGRAM_BOT_TOKEN");
    chat_id = os.getenv("TELEGRAM_CHAT_ID");

    interval_raw = os.getenv("RUN_INTERVAL_SECONDS", "60").strip();
    try:
        interval = int(interval_raw);
        if interval < 10:
            raise ValueError("RUN_INTERVAL_SECONDS must be at least 10 seconds.");
    except ValueError as e:
        raise ValueError(f"Invalid RUN_INTERVAL_SECONDS = '{interval_raw}': {e}") from e;


    return Settings(source_url=source_url, 
                    db_path=db_path,
                    telegram_bot_token=token.strip() if token else None,
                    telegram_chat_id=chat_id.strip() if chat_id else None,
                    run_interval_seconds=interval
                );


