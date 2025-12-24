from typing import Any, Dict
import httpx;

def fetch_json(url: str, timeout_seconds: float = 15.0) -> Dict[str, Any]:
    with httpx.Client(timeout=timeout_seconds, follow_redirects = True) as client:
        response = client.get(url);
        response.raise_for_status();

        data = response.json();
        if not isinstance(data, dict):
            raise ValueError("Expected JSON response to be a dictionary.");
        return data;