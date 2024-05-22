# Schedule of Classes Scraper
This scraper is a naive program which assumes the best network conditions
and the SOC website having a consistent format.

It serves as an additional source of data for the schedule and there are
a few benefits having it:
- Consistent format each year
- Open access 
- Contains the schedule as students see it
- Also deals with multiple sections and lecture/recitation pairing

Limitations:
- Doesn't work for Jarrin's trial schedules
- Prerequisite information doesn't include the minimum grade needed (Necessary?)
- Not as in depth as the other scraper (Information may or not be needed anyways)

It outputs a json which contains the schedule.json, which has the following format:
```
"courses": [
    {
      "course_code": "XXXXX",
      "course_title": "XXXXX",
      "units": "X",
      "description": "XXX",
      "prereqs": "XXX",
      "coreqs": "XXX",
      "sections": [ // all lectures, recitations
        {
          "section_type": "Lecture", // or recitation 
          "section_id": "W",
          "timings": {
            "days": [
              "UT"
            ],
            "begin": "04:00PM",
            "end": "05:15PM",
            "teaching_location": "Doha, Qatar",
            "delivery_mode": "In-person Expectation",
            "instructor": [
              "XXXXX",
              "XXXXX"
            ]
          }
        }
      ]
    },
]
```
