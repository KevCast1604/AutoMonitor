import httpx;

def send_telegram_message(token: str, chat_id: str, text: str) -> None:
    url = f"https://api.telegram.org/bot{token}/sendMessage";
    payload = {
        "chat_id": chat_id,
        "text": text,
        "disable_web_page_preview": True,
    }

    with httpx.Client(timeout=15.0) as client:
        res = client.post(url, json=payload);
        res.raise_for_status();