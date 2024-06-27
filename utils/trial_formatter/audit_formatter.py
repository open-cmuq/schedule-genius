import pandas as pd
import json
import os

base_dir = os.path.dirname(os.path.abspath(__file__))

path = os.path.join(base_dir, "../data/audits-xlsx/is-audit.xlsx")
audit = pd.read_excel(path, dtype={"Course or code": str})

audit_json = audit.to_json(orient='records')

json_path = os.path.join(base_dir, "./is-audit.json")
with open(json_path, 'w') as f:
    f.write(audit_json)

print("Excel file has been converted to JSON and saved at", json_path)
