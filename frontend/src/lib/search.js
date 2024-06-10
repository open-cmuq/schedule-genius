// This function implements the filtering ability for the search.
// It notably has a ranking system as we would like to order courses in terms 
// of their score. When filtering by a search term for example, we have to 
// prioritize matches with a title before the description.
// TODO Consider ranking to also prioritize the students deparment
// also if you enter 15 for example it doesn't show course codes which have 15 
// so this also needs fixing
export const filterCourses = (courses, filters, audit, coursesTaken) => {
  return courses
    .map(course => {
      let score = 0;

      if (filters.keyword.length > 0) {
        const keywords = filters.keyword.map(k => k.toLowerCase());
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
    .map(item => item.course); // Extract the sorted courses
};
