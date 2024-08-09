import pandas as pd
import json
import os

base_dir = os.path.dirname(os.path.abspath(__file__))

path = os.path.join(base_dir, "../data/audits-xlsx/cs-audit.xlsx")
audit = pd.read_excel(path, dtype={"Course or code": str})

# Process the 'Requirement' column to extract the last part after '---'
audit['Requirement'] = audit['Requirement'].apply(lambda x: x.split('---')[-1] if isinstance(x, str) else x)

audit_records = audit.to_dict(orient='records')
unique_requirements = list(audit['Requirement'].unique())

final_json_data = [unique_requirements] + audit_records
audit_json = json.dumps(final_json_data)

json_path = os.path.join(base_dir, "./cs-audit.json")

with open(json_path, 'w') as f:
    f.write(audit_json)

print("Excel file has been converted to JSON and saved at", json_path)
