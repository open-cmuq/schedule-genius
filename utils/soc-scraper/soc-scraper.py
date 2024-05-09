import requests
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

response = requests.post(url, headers=headers, data=payload)
soup = BeautifulSoup(response.text, "html.parser")
department_titles = soup.find_all('h4', class_='department-title')
tables = list()
for title in department_titles:
    # Print the department title
    #print("Department:", title.text.strip())
    
    # Find the table following the department title
    table = title.find_next_sibling('table')
    tables.append(table)
    
    # Print the table content (if found)
    """
    if table:
        print("Table content:")
        print(table.prettify())
    else:
        print("No table found for this department")
    """
# Initialize variables to store current course information
current_course_number = None
current_course_title = None
current_course_sections = []
