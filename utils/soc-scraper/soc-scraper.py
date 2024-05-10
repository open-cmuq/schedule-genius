import json
import requests
import pandas as pd
from bs4 import BeautifulSoup

url = "https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/search"

payload = {
    'SEMESTER': 'F24',
    'MINI': 'NO',
    'GRAD_UNDER': 'All',
    'PRG_LOCATION': 'DOH',
    'DEPT': 'All',
    'LAST_NAME': '',
    'FIRST_NAME': '',
    'BEG_TIME': 'All',
    'KEYWORD': '',
    'TITLE_ONLY': 'YES',
    'SUBMIT': ''
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.118 Safari/537.36',
    'Referer': 'https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/search',
    'Content-Type': 'application/x-www-form-urlencoded'
}

#response = requests.post(url, headers=headers, data=payload)
#soup = BeautifulSoup(response.text, "html5lib")
response = open("soc.html","r")
response = response.read()
# The original SOC page has some rows which don't have open <tr> tags which 
# requires a better parser or tidy
soup = BeautifulSoup(response,"html5lib")
department_titles = soup.find_all('h4', class_='department-title')
tables = list()

for title in department_titles:
    # Find the table following the department title
    table = title.find_next_sibling('table')
    tables.append(table)

# For every table process its rows, and for courses with multiple instructors
# create a list of instructors
l = []
for table in tables:
    rows = table.find_all("tr")
    rows = rows[1:] # Remove the table headers row
    for tr in rows:
        td = tr.find_all('td')
        row = [tr.text.strip() for tr in td]
        instructors = td[-1].find_all('li')
        instructors_list = [instructor.text.strip() for instructor in instructors]
        row[-1] = instructors_list 
        l.append(row)

# Save the tables rows into a dataframe
df = pd.DataFrame(l, columns=["COURSE", "COURSE TITLE", "UNITS","SEC","MINI","DAYS","BEGIN","END","TEACHING LOCATION","BLDG","DELIVERY MODE","INSTRUCTOR"])   

# Convert DataFrame to JSON
courses = []
current_course = None
current_lecture = None

# In the conversion to a JSON we need to account for a course having multiple
# sections or having a lecture/recitation pair. To deal with this each course
# will have a sections array and any section containing Lec in it has it's
# corresponding recitation directly after it. These timings should be dealt with
# together by any program parsing our file.
# TODO: Possibly adding a property to a lecture to indicate the next section is
# its recitation
for _, row in df.iterrows():
    # We're in a case where we have multiple sections (including recitations)
    if row["COURSE"].strip() == "":
        # Linked to the last course seen above
        section = {
            "section_type": "Recitation" if "Lec" in current_lecture else "Lecture",
            "section_id": row["SEC"],
            "timings": {
                "days": [row["DAYS"]],
                "begin": row["BEGIN"],
                "end": row["END"],
                "teaching_location": row["TEACHING LOCATION"],
                "delivery_mode": row["DELIVERY MODE"],
                "instructor": row["INSTRUCTOR"]
            }
        }
        courses[-1]["sections"].append(section)
    else:
        # New course
        course = {
            "course_code": row["COURSE"],
            "course_title": row["COURSE TITLE"],
            "units": row["UNITS"],
            "sections": [{
                "section_type": "Lecture",
                "section_id": row["SEC"],
                "timings": {
                    "days": [row["DAYS"]],
                    "begin": row["BEGIN"],
                    "end": row["END"],
                    "teaching_location": row["TEACHING LOCATION"],
                    "delivery_mode": row["DELIVERY MODE"],
                    "instructor": row["INSTRUCTOR"]
                }
            }]
        }
        courses.append(course)
        current_course = row["COURSE"]
        current_lecture = row["SEC"]

json_data = json.dumps({"courses": courses}, indent=2)
with open("schedule.json", "w") as f:
    f.write(json_data)

