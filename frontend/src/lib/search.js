import { countsFor } from "./audit";

/**
  * This function implements the filtering ability for the search.
  * It notably has a ranking system as we would like to order courses in terms 
  * of their score. When filtering by a search term for example, we have to 
  * prioritize matches with a title before the description.
  *
  * TODO Consider ranking to also prioritize the students deparment 
  * also if you enter 15 for example it doesn't show course codes which have 15 
  * so this also needs fixing
  *
  * @param {*} courses
  * @param {*} keyword 
  */
function filterKeywords(courses,keyword) {
  return courses
    .map(course => {
      let score = 0;

      if (keyword.length > 0) {
        const keywords = keyword.map(k => k.toLowerCase());
        const matchesCode = keywords.some(keyword => course.course_code.toLowerCase().includes(keyword));
        const matchesTitle = keywords.some(keyword => course.course_title.toLowerCase().includes(keyword));
        const matchesDescription = keywords.some(keyword => course.description.toLowerCase().includes(keyword));

        if (matchesCode) score += 3;
        if (matchesTitle) score += 2;
        if (matchesDescription) score += 1;

        // If no match at all, return null (we'll filter these out later)
        if (!matchesCode && !matchesTitle && !matchesDescription) return null;
      }

      return { course, score };
    })
    .filter(item => item !== null) // Remove courses with no matches
    .sort((a, b) => b.score - a.score) // Sort by score in descending order
    .map(item => item.course);
}

function timeToMinutes(time) {
  const [hours, minutes] = time.match(/(\d+):(\d+)/).slice(1).map(Number);
  const period = time.slice(-2);
  const totalMinutes = (period === 'PM' && hours !== 12 ? hours + 12 : hours) * 60 + minutes;
  return totalMinutes;
}

function hasConflict(timing1, timing2) {
  const start1 = timeToMinutes(timing1.begin);
  const end1 = timeToMinutes(timing1.end);
  const start2 = timeToMinutes(timing2.begin);
  const end2 = timeToMinutes(timing2.end);

  // Check if there is an overlap in times
  return start1 < end2 && start2 < end1;
}

function daysOverlap(days1, days2) {
  days1 = days1[0].split("");
  days2 = days2[0].split("");
  return days1.some(day => days2.includes(day));
}

function filterConflictingCourses(courses, coursesTaken) {
  const selectedTimings = [];

  // Collect timings of selected courses
  coursesTaken.forEach(courseTaken => {
    courseTaken.selected.forEach(index => {
      selectedTimings.push(courseTaken.sections[index].timings);
    });
  });
  
  return courses.filter(course => {
    // Group sections by consecutive lecture and recitation
    const groupedSections = groupSections(course.sections);

    // Check if there is at least one group of sections that does not conflict
    return groupedSections.some(group => {
      return group.every(section => {
        if (section.timings.begin === 'TBA' || section.timings.days[0] === 'TBA') {
          return true;
        }

        return !selectedTimings.some(takenTiming => {
          if (takenTiming.begin === 'TBA' || takenTiming.days[0] === 'TBA') {
            return false; }
          return daysOverlap(section.timings.days, takenTiming.days) && hasConflict(section.timings, takenTiming);
        });
      });
    });
  });
}

// Group consecutive lecture and recitation sections
function groupSections(sections) {
  const grouped = [];
  let currentGroup = [];

  sections.forEach(section => {
    if (currentGroup.length > 0) {
      const lastSection = currentGroup[currentGroup.length - 1];
      if (lastSection.section_type === 'Lecture' && section.section_type === 'Recitation') {
        currentGroup.push(section);
      } else {
        grouped.push(currentGroup);
        currentGroup = [section];
      }
    } else {
      currentGroup.push(section);
    }
  });

  if (currentGroup.length > 0) {
    grouped.push(currentGroup);
  }

  return grouped;
}

function filterCountsFor(courses,reqs,audit){
  return courses.filter(course => {
    const courseReqs = countsFor(course.course_code, audit); // Get the set of requirements this course can count for
    return reqs.some(req => courseReqs.has(req)); // Check if any of the required reqs are in the set
  });
}

export const filterCourses = (courses, filters,audit,coursesTaken) => {
  let results = filterKeywords(courses,filters.keyword);
  
  if (filters.noConflicts){
    results = filterConflictingCourses(results,coursesTaken);
  }
  
  if (filters.countsFor.length > 0){
    results = filterCountsFor(results,filters.countsFor,audit);
  }

  
  return results;
}

