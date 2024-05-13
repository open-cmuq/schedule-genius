import json
import time
import requests
import pandas as pd
import os
from bs4 import BeautifulSoup

# Global header for any requests
glob_headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.118 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Referer': 'https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/search'
}

"""
Given a request return the cached version or make request and save 
into cache if it isn't already present. This is a very naive approach
as it doesn't consider the headers or payloads being different to the 
same page.
"""
def cacheRequest(url, func_headers, payload, cache_name,method):
    cache_name = cache_name + ".html"
    cache_path = os.path.join("../.cache",cache_name)
    os.path
    if os.path.exists(cache_path):
        with open(cache_path, "r") as f:
            return f.read()
    else:
        # Artificial rate limiting
        time.sleep(0.3)
        if method == "POST":
            response = requests.post(url,headers=func_headers,data=payload)
        else:
            response = requests.get(url,headers=func_headers,data=payload)

        if response.status_code == 200:
            with open(cache_path,"w") as f:
                f.write(response.text)
            return response.text
        
        return None

"""
Given the element containing requisites
Sanitize it and output a list of the requisites needed
"""
def sanitizeReqs(req_elem):
    req_list = [c.strip() for c in req_elem.text.split(",") if c.strip()]
    # Remove any additional newlines and spaces
    req_list = [c.replace('\n', '').replace(' ', '') for c in req_list]
    # Filter out empty strings
    req_list = list(filter(None, req_list))
    # Join corequisites into a string
    requisites = ', '.join(req_list)
    return requisites


"""
Given a course number get its prereqs/coreqs and the course description.
Returns a dictionary containing these
"""
def getCourseData(course_number):
    course_url = f"https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/courseDetails?COURSE={course_number}&SEMESTER=F24"

    response = cacheRequest(course_url, glob_headers,{}, f"{course_number}","GET")
    soup = BeautifulSoup(response, "html5lib")

    description_elem = soup.find(id='course-detail-description')
    description = description_elem.find('p').text.strip().strip("\n")

    prerequisites_elem = soup.find('dt', string='Prerequisites').find_next_sibling('dd')
    prerequisites = prerequisites_elem.get_text(strip=True)

    corequisites_elem = soup.find('dt', string='Corequisites').find_next_sibling('dd')
    corequisites = sanitizeReqs(corequisites_elem)

    courseData = {"description": description,
                  "prereqs": prerequisites,
                  "coreqs": corequisites
                  }
    return courseData

"""
Given a semester output a dataframe of the entire course schedule
this json should contain indepth information including a course
description, and requirements
"""
def getCourseSchedule(semester):
    schedule_url = "https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/search"

    payload = {
        'SEMESTER': f'{semester}',
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

    response = cacheRequest(schedule_url,glob_headers,payload,"soc","POST")
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
    processedRows = []
    for table in tables:
        rows = table.find_all("tr")
        rows = rows[1:] # Remove the table headers row
        for tr in rows:
            td = tr.find_all('td')
            row = [tr.text.strip() for tr in td]
            instructors = td[-1].find_all('li')
            instructors_list = [instructor.text.strip() for instructor in instructors]
            row[-1] = instructors_list
            if row[0].isnumeric():
                courseData = getCourseData(row[0])
                row.append(courseData["description"])
                row.append(courseData["prereqs"])
                row.append(courseData["coreqs"])
            processedRows.append(row)

    # Save the tables rows into a dataframe
    df = pd.DataFrame(processedRows, columns=["COURSE", "COURSE TITLE", "UNITS","SEC","MINI",
                                  "DAYS","BEGIN","END","TEACHING LOCATION","BLDG",
                                  "DELIVERY MODE","INSTRUCTOR","DESCRIPTION","PREREQS",
                                  "COREQS"])
    return df

"""
Given a dataframe containing the course information, convert into a JSON
"""
def convertScheduleToJson(df, path):
    courses = []
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
            current_lecture = row["SEC"]
            course = {
                "course_code": row["COURSE"],
                "course_title": row["COURSE TITLE"],
                "units": row["UNITS"],
                "description": row["DESCRIPTION"],
                "prereqs": row["PREREQS"],
                "coreqs": row["COREQS"],
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

    # Save each course to its own JSON file
    for course in courses:
        course_number = course["course_code"]
        file_path = os.path.join("../data/course-details-soc-scraper/", f"{course_number}.json")
        json_data = json.dumps(course, indent=2)
        with open(file_path, "w") as f:
            f.write(json_data)

    json_data = json.dumps({"courses": courses}, indent=2)
    with open(path, "w") as f:
        f.write(json_data)

df = getCourseSchedule("F24")
convertScheduleToJson(df, "../data/soc-schedule.json")
