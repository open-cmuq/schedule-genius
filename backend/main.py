from fastapi import FastAPI, File, UploadFile, HTTPException
from pathlib import Path
import json
import os
import mimetypes
import importlib

# Load the Excel utils, this isn't the most ideal code
module_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../utils/trial-formatter/trial-formatter.py'))

# Get the module name
module_name = os.path.splitext(os.path.basename(module_path))[0]

# Load the module
spec = importlib.util.spec_from_file_location(module_name, module_path)
module = importlib.util.module_from_spec(spec)

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


@app.post("/upload")
async def upload_schedule(file: UploadFile = File(...)):
    mime_type,_ = mimetypes.guess_type(file.filename)
    # User input is one of the trickiest things, the least we can do is 
    # verify that any uploaded documents are excel sheets and that 
    # code injection shouldn't be possible
    if mime_type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        raise HTTPException(status_code=400, detail="Invalid file type. Only Excel files are allowed.")
    
    return {"NotImplemented": True}
