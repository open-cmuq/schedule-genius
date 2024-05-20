from fastapi import FastAPI, HTTPException
from pathlib import Path
import json
import os

app = FastAPI()

# Utility function to load JSON data
def loadJson(file_path):
    with open(file_path, "r") as f:
        return json.load(f)

@app.get("/schedules")
async def getAllSchedules():
    sched_files = [file.name for file in Path("./data/schedules").glob("*.json")]
    schedules = []
    try:
        for filename in sched_files:
            path = os.path.join("./data/schedules/", filename)
            with open(path,"r") as file:
                content = json.load(file)
                schedules.append(content)
        return {"schedules": schedules}
    except:
        raise HTTPException(status_code=500, detail="Error fetching schedules")

@app.get("/schedule/{ID}")
async def getSchedule(ID):
    sched_files = [file.name for file in Path("./data/schedules").glob("*.json")]
    for schedule in sched_files:
        path = os.path.join("./data/schedules/", schedule)
        with open(path,"r") as file:
            if ID in file.read():
                return loadJson(path)
    
    raise HTTPException(status_code=404, detail="Schedule not found")

@app.get("/audit/{major}/{entry_year}")
async def getAudit(major, entry_year):
    try:
        audit_data = loadJson(f"./data/audits/EY{entry_year}-{major}.json")
        return audit_data
    except:
        raise HTTPException(status_code=500, detail="Audit file note found")

