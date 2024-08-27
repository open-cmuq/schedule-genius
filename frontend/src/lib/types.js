/**
 * Represents a semester.
 * @typedef {Object} Semester
 * @property {string} semester_name
 * @property {string} semester_shortcode
 * @property {string} last_update
 * @property {string} ID
 * @property {Course[]} courses
 */

/**
 * Represents a course.
 * @typedef {Object} Course
 * @property {string} course_code
 * @property {string} course_title
 * @property {string} units
 * @property {string} description
 * @property {string} prereqs
 * @property {string} coreqs
 * @property {Section[]} sections
 */

/**
 * Represents a section.
 * @typedef {Object} Section
 * @property {string} section_type
 * @property {string} section_id
 * @property {Timings} timings
 */

/**
 * Represents the timings for a section.
 * @typedef {Object} Timings
 * @property {string[]} days
 * @property {string} begin
 * @property {string} end
 * @property {string} teaching_location
 * @property {string} delivery_mode
 * @property {string[]} instructor
 */

/**
 * Represents the overall data structure.
 * @typedef {Object} Schedule
 * @property {string} semester_name
 * @property {string} semester_shortcode
 * @property {string} last_update
 * @property {string} ID
 * @property {Course[]} courses
 */

/**
 * An array containing:
 * - A string array representing unique requirements.
 * - An array of course objects, each containing:
 *   - A string property "Course or code" representing the course or code identifier.
 *   - A string property "Requirement" representing the requirement.
 *   - A string property "Inclusion/Exclusion" indicating whether the course is included or excluded.
 *   - A string property "Type" specifying if the requirement is by course or department code.
 *
 * @typedef {Array<string>} RequirementArray
 * @typedef {Object} CourseObject
 * @property {string} Course or code
 * @property {string} Requirement
 * @property {string} Inclusion/Exclusion
 * @property {string} Type
 * @typedef {Array<RequirementArray|CourseObject>} RequirementAndCourseArray
 */

/**
 * An object containing the schedule card information this is used to track a possible 
 * plan for a semester. 
 *
 * @typedef {Object} ScheduleCard 
 * @property {number} id - Unique ID for the ScheduleCard 
 * @property {string} name - A name for the plan 
 * @property {Array.<Course>} courses - the courses which have been selected for the schedule, we append a "selected" property which contains an Array, this Array contains a number of the selected sections
 * @property {Array.<String>} courses_taken - the courses which have been cleared 
 * @property {string} major - major of the student 
 * @property {number} entry_year - entry year of the student 
 */


/**
 * @typedef {Object} Requirement
 * @property {string} Course or code - The course code or identifier.
 * @property {string} Requirement - The requirement category that the course fulfills.
 * @property {string} Inclusion/Exclusion - Specifies whether the course/code is included or excluded from the requirement.
 * @property {string} Type - The type of item (typically "Course") but could be code.
 */

/**
 * @typedef {Array.<string>} RequirementCategories
 * @description An array of strings representing various requirement categories.
 */

/**
 * An inclusion/exclusion list of the courses and what they count for a given major 
 * and entry year. We also include a unique list of all the requirements which are pre 
 * processed in the first index
 * 
 * @typedef {Array.<RequirementCategories | Requirement>} Audit
 */
