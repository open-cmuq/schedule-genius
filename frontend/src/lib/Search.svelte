<script>
  import {flip} from 'svelte/animate';
  import { selectedScheduleID } from "../store.js";
	import CourseCard from "$lib/CourseCard.svelte";
	import { filterCourses } from "$lib/search";
  
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
    coursesTaken: [],
    units: [1,18],
    clearedPreReqs: false,
    noConflicts: false // TODO Enabled for testing purposes only
  };
  
  // Refresh the courses displayed each time we change the selected schedule
  async function refilterSchedule(selectedScheduleID) {
    try {
      courses = null;
      await loadSchedule(selectedScheduleID);
      filteredCourses = filterCourses(courses,filters,audit,card.courses);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  }

  // Reorder a set of courses or search results so that selected courses 
  // appear on the top
  function orderedCourses(allCourses) {
    // Create a set of selected course codes for quick lookup
    const selectedCourseCodes = getSelectedCourse();
    
    // Separate the selected courses from the rest
    // Note that for selected courses we look at the entire schedule not the filtered ones
    const selected = courses.filter(course => selectedCourseCodes.has(course.course_code));
    const unselected = allCourses.filter(course => !selectedCourseCodes.has(course.course_code));
    
    // Combine the selected courses at the top followed by the unselected courses
    return [...selected, ...unselected];
  }

  function selectCourseSearch(course){
    selectCourse(course);
    filteredCourses = filterCourses(courses,filters,audit,card.courses);
  }

  function toggleNoConflicts() {
    filters.noConflicts = !filters.noConflicts;
    filteredCourses = filterCourses(courses,filters,audit,card.courses);
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
      filteredCourses = filterCourses(courses,filters,audit,card.courses);
    }, 100); 
    
  }
  
  function getSelectedCourse() {
    return new Set(card.courses.map(course => course.course_code));
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

<div class="search-component flex flex-col items-center w-full m-2"> 
  {#if courses} 
    <div class="filter-controls m-2"> 
      <input type="text" id="search-field" placeholder="Keywords, title, etc..." 
				 autocomplete="off"
         on:input={handleSearch} 
         class="border p-2 rounded-md"
      />
      <br/> 
      <label>
        <input type="checkbox" on:change={toggleNoConflicts}/>
        Hide courses which conflict with current schedule
      </label>
    </div>

    {#if filteredCourses.length > 0}
      <!-- This section is for showing all the courses with filters applied -->
      <div class="header bg-rose-300">
        <div class="text-center">Course Code</div>
        <div>Title</div>
        <div>Units</div>
        <div>Section</div>
        <div>Day</div>
        <div>Begin</div>
        <div>End</div>
        <div>Room</div>
        <div>Instructor</div>
      </div>
      {#each orderedCourses(filteredCourses, card.courses) as course, index (course.course_code)}
          <div class="course-card-wrapper mt-3 {courseSelected(course.course_code) ? 'selected' : ''}
          {index % 2 === 0 ? 'bg-gray-300' : 'bg-white'}" 
            animate:flip={{ duration: 300 }}>
            <CourseCard {course} {selectCourseSearch} {audit} 
              isSelected={card.courses.find(c => c.course_code === course.course_code)} />
          </div>
      {/each} 
    {/if}
  {:else} 
    Please select a schedule before proceeding...
  {/if}
</div>

<style>
  .header, .course-card-wrapper {
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      gap: 0;
      width: 100%;
      border: 1px solid black; 
      border-radius: 8px; 
      overflow: hidden; 
      font-size: 0.85em;
  }

  .header > div {
      border: 1px solid #ccc;
      padding: 8px;
  }

  .selected {
      background-color: #3b82f6;
  }
</style>
