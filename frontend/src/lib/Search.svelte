<div class="search-component flex flex-col items-center w-full m-2"> 
  {#if courses} 
    <div class="filter-controls m-2"> <input type="text" id="search-field" placeholder="Keywords, title, etc..." 
				 autocomplete="off"
         on:input={handleSearch} 
         class="border p-2 rounded-md"
      />
    </div>

    {#if filteredCourses.length > 0}
      <!-- This section is for showing all the courses with filters applied -->
      <div class="header bg-gray-200">
        <div>Course Code</div>
        <div>Title</div>
        <div>Units</div>
        <div>Section</div>
        <div>Day</div>
        <div>Begin</div>
        <div>End</div>
        <div>Room</div>
        <div>Instructor</div>
      </div>
      {console.log(card.courses)}
      {#each orderedCourses(filteredCourses, card.courses) as course (course.course_code)}
          <div class="course-card-wrapper mt-3 {courseSelected(course.course_code) ? 'selected' : ''}" 
            animate:flip={{ duration: 300 }}>
            <CourseCard {course} {selectCourse} 
              isSelected={card.courses.find(c => c.course_code === course.course_code)} />
          </div>
      {/each} 
    {/if}
  {:else} 
    Please select a schedule before proceeding...
  {/if}
</div>

<script>
  import { selectedScheduleID } from "../store.js";
  import {flip} from 'svelte/animate';
	import CourseCard from "./CourseCard.svelte";
	import { filterCourses } from "./search";
  
  export let selectCourse;
  export let card;
  export let audit;
  export let courses;
  export let loadSchedule;


  // let schedule = null; // Initialize schedule to null
  // let courses = null;
  let filteredCourses = [];

  let searchTerm = "";
  let searchTimeout;
  // We need a way to support multiple filters for more refined searching
  let filters = {
    keyword: [],
    countsFor: [],
    instructor: [],
    department: [],
    units: [1,18],
    clearedPreReqs: false,
    noConflicts: false
  };
  
  // Refresh the courses displayed each time we change the selected schedule
  async function refilterSchedule(selectedScheduleID) {
    try {
      courses = null;
      await loadSchedule(selectedScheduleID);
      filteredCourses = filterCourses(courses,filters);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  }

  // Reorder a set of courses or search results so that selected courses 
  // appear on the top
  function orderedCourses(allCourses, selectedCourses) {
    // Create a set of selected course codes for quick lookup
    const selectedCourseCodes = new Set(selectedCourses.map(course => course.course_code));
    
    // Separate the selected courses from the rest
    // Note that for selected courses we look at the entire schedule not the filtered ones
    const selected = courses.filter(course => selectedCourseCodes.has(course.course_code));
    const unselected = allCourses.filter(course => !selectedCourseCodes.has(course.course_code));
    
    // Combine the selected courses at the top followed by the unselected courses
    return [...selected, ...unselected];
  }
  
  // When searching courses we'd only like to search after the user has stopped 
  // typing for efficiency
  function searchCourses() {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      if (filters.keyword.length > 0){
        filters.keyword[0] = searchTerm;
      } else {
        filters.keyword.push(searchTerm);
      }
      filteredCourses = filterCourses(courses,filters);
    }, 100); 
    
  }

  function courseSelected(course_code) {
    return card.courses.find(c => c.course_code === course_code); 
  }
  
  // FIX Lag when entering search input
  function handleSearch(event) {
    searchTerm = event.target.value;

    // Call the debounced search function
    searchCourses();
  }
  
  $: refilterSchedule($selectedScheduleID); 
</script>

<style>
  .header, .course-card-wrapper {
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      gap: 0;
      width: 100%;
  }

  .header > div {
      border: 1px solid #ccc;
      padding: 8px;
  }

  .selected {
      background-color: #3b82f6;
  }
</style>
