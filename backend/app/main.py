from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta, timezone

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Report(BaseModel):
    id: int
    type: str
    position: list[float]
    timestamp: str


reports_db: List[Report] = []


@app.get("/")
def root():
    return {"message": "Canyon backend running"}


@app.get("/reports")
def get_reports():
    one_hour_ago = datetime.now(timezone.utc) - timedelta(seconds=10)

    active_reports = [
        report
        for report in reports_db
        if datetime.fromisoformat(report.timestamp) > one_hour_ago
    ]

    reports_db.clear()
    reports_db.extend(active_reports)

    return reports_db


@app.post("/reports")
def create_report(report: Report):
    reports_db.append(report)
    return {"message": "Report added successfully"}