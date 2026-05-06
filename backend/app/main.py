# main.py - Canyon backend using FastAPI

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
    confirmations: int = 0
    dismissals: int = 0

reports_db: List[Report] = []


@app.get("/")
def root():
    return {"message": "Canyon backend running"}


@app.get("/reports")
def get_reports():
    one_hour_ago = datetime.now(timezone.utc) - timedelta(seconds=3600)

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
    return {"message": "Report created"}


@app.post("/reports/{report_id}/vote")
def vote_report(report_id: int, vote: str):
    for report in reports_db:
        if report.id == report_id:
            if vote == "confirm":
                report.confirmations += 1
            elif vote == "dismiss":
                report.dismissals += 1

            if report.dismissals >= 3:
                reports_db.remove(report)

            return {"message": "Vote recorded"}

    return {"message": "Report not found"}