from __future__ import annotations

import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from ..config import get_settings
from ..application.query_service import (
    list_event_summaries_paged,
    get_event_detail,
    get_latest_event_detail,
    get_metrics
)


def create_app() -> FastAPI:
    app = FastAPI(title="AutoMonitor API", version="0.1.0")

    cors_origins = os.getenv("CORS_ORIGINS", "")
    origins = [o.strip() for o in cors_origins.split(",") if o.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    @app.get("/events")
    def events(
        limit: int = Query(default=50, ge=1, le=200),
        offset: int = Query(default=0, ge=0),
    ) -> dict:
        settings = get_settings()
        return list_event_summaries_paged(
            settings.db_path,
            limit=limit,
            offset=offset,
        )

    @app.get("/events/latest")
    def latest_event() -> dict:
        settings = get_settings()
        detail = get_latest_event_detail(settings.db_path)
        if detail is None:
            raise HTTPException(status_code=404, detail="No events yet")
        return detail
    
    @app.get("/metrics/overview")
    def overview_metrics() -> dict:
        settings = get_settings()
        return get_metrics(settings.db_path)


    @app.get("/events/{event_id}")
    def event_detail(event_id: int) -> dict:
        settings = get_settings()
        detail = get_event_detail(settings.db_path, event_id)
        if detail is None:
            raise HTTPException(status_code=404, detail="Event not found")
        return detail
    
    return app


app = create_app()
