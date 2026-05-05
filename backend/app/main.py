from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

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

reports_db: List[Report] = []


@app.get("/")
def root():
    return {"message": "Canyon backend running"}


@app.get("/reports")
def get_reports():
    return reports_db


@app.post("/reports")
def create_report(report: Report):
    reports_db.append(report)
    return {"message": "Report added successfully"}