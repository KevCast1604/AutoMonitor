# Backend Documentation - AutoMonitor

## 1. Project Description

**AutoMonitor** is a system designed to track changes in a product feed (JSON format). Its main function is to detect modifications (products added, removed, or updated) by comparing the current state with the last recorded state.

The system consists of three main components:
1.  **Monitor Core (CLI/Scheduler):** Responsible for downloading data, calculating differences (`diff`), saving history to a SQLite database, and sending notifications via Telegram if changes are detected.
2.  **REST API:** An interface built with FastAPI that allows querying event history, specific change details, and general metrics.
3.  **Database:** Local SQLite for persistence of events and states.

## 2. Requirements and Configuration

### Things to keep in mind before starting
*   **Python:** Python 3.9 or higher is required.
*   **Virtual Environment:** It is strongly recommended to use a virtual environment (`venv`) to isolate dependencies.
*   **Database:** The system automatically initializes the SQLite file (`monitor.db` by default) if it does not exist. No manual SQL scripts are needed.
*   **Telegram:** To receive alerts, you need to create a Telegram Bot (via BotFather) and obtain your `Chat ID`.

### Environment Variables
The system uses centralized configuration (referenced as `get_settings()`). Make sure to configure the following environment variables (or create a `.env` file if the project uses `python-dotenv`):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SOURCE_URL` | URL of the product JSON to monitor | `https://api.example.com/products.json` |
| `DB_PATH` | Path to the SQLite database file | `monitor.db` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token (Optional) | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` |
| `TELEGRAM_CHAT_ID` | Chat/Channel ID for alerts (Optional) | `-100123456789` |
| `RUN_INTERVAL_SECONDS` | Interval in seconds for "watch" mode | `300` (5 minutes) |
| `CORS_ORIGINS` | Allowed origins for the API (comma separated) | `http://localhost:3000,https://my-frontend.com` |

## Telegram Integration

AutoMonitor uses a Telegram Bot for notifications. The Telegram Bot Name is: **AutoMonitor**, select /start to use this option

Required environment variables:

- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID

⚠️ Never commit or share the bot token.
Each environment (dev/prod) must use its own token.

## 3. Installation

1.  **Clone the repository and navigate to the folder:**
    ```bash
    cd auto-monitor
    ```

2.  **Create and activate the virtual environment:**
    *   Windows:
        ```powershell
        python -m venv .venv
        .\.venv\Scripts\Activate.ps1
        ```
    *   Linux/Mac:
        ```bash
        python3 -m venv .venv
        source .venv/bin/activate
        ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: If you don't have a `requirements.txt`, the main dependencies detected in the code are: `fastapi`, `uvicorn`, `httpx`, `apscheduler`).*

## 4. Execution Commands

The project has two main entry points: the Command Line Interface (CLI) and the Web API.

### A. Run the Monitor (CLI)

The CLI is located at `src/automonitor/interfaces/cli.py`. Make sure to run these commands from the project root (where the `src` folder is).

**1. Run Once:**
Executes the verification process a single time. Ideal for scheduled tasks with CRON or manual testing.
```bash
python -m src.automonitor.interfaces.cli run
```

**2. Watch Mode:**
Starts a persistent process that runs the monitor periodically according to the configured interval (`RUN_INTERVAL_SECONDS`). Uses `APScheduler`.
```bash
python -m src.automonitor.interfaces.cli watch
```

### B. Start the API (Web Backend)

The API allows the frontend or other systems to query the data. `uvicorn` is used as the ASGI server.

**Command for development (with auto-reload):**
```bash
uvicorn src.automonitor.interfaces.api:app --reload
```

**Command for production:**
```bash
uvicorn src.automonitor.interfaces.api:app --host 0.0.0.0 --port 8000
```

The interactive API documentation (Swagger UI) will be available at:
*   `http://localhost:8000/docs`

## 5. Main Endpoints

Once the API is started, these are the available resources:

*   `GET /health`: Service health check.
*   `GET /events`: Paged list of events (change history). Supports `limit` and `offset`.
*   `GET /events/latest`: Full details of the last recorded event.
*   `GET /events/{event_id}`: Details of a specific event (products added, removed, updated).
*   `GET /metrics/overview`: General metrics (total events, sum of changes, etc.).