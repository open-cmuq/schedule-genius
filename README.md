# Schedule Genius
Schedule Genius aims to make course planning easier for students
and for professors, by providing an interface in which students can at a 
glance see what courses count for what requirement and to provide an advanced
way of filtering possible course paths for a given semester while maintaining
usability, it also aims to resolve a major problem which is easily resolving
time conflicts. In addition to this, it also serves Professors in trialing
a schedule and testing possible course sets to ensure that students can 
complete their degree and requirements on time. 

# Demo
https://github.com/user-attachments/assets/adcc389b-9f35-45a4-8de1-01ececdc9514



# The Problematic System
## Students Perspective
During a typical semester, students utilize Stellic to find out what courses
count for what in their degree. Stellic isn't so stellar at this as it requires
constant filtering each time you view a course. It also means you need to filter
through every single requirement or a number of courses that are listed on the SOC
to see if you can take it while accounting for time conflicts. 

## Professors Perspective
The registrar's office releases a schedule which professors then have to manually sift and consider
different sets of courses which their advisees might take.

# System Requirements
- npm 
- conda

# Dependencies Setup
- Frontend
```
$ cd frontend
$ npm ci
```
- Backend
```
$ conda env create -f environment.yml
```

# Running (development)
- Frontend
```
$ cd frontend
$ npm run dev 
```
- Backend 
```
$ cd backend 
$ conda activate schedule-genius
$ fastapi dev main.py
```
# License 
This project is licensed under the [MIT License](LICENSE).
