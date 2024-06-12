<div class="search-component flex flex-col items-center w-full m-2">
  {#if schedule}
    <div class="filter-controls m-2">
      <input type="text" 
				 id="search-field" 
				 placeholder="Keywords, title, etc..." 
				 autocomplete="off"
         bind:value={searchTerm}
         on:input={searchCourses} 
         class="border p-2 rounded-md"
      />
    </div>

  {#if filteredCourses.length > 0}
    <!-- This section is for showing all the courses with filters applied -->
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-200">
          <th class="border border-gray-300 p-2">Course Code</th>
          <th class="border border-gray-300 p-2">Title</th>
          <th class="border border-gray-300 p-2">Units</th>
          <th class="border border-gray-300 p-2">Section</th>
          <th class="border border-gray-300 p-2">Day</th>
          <th class="border border-gray-300 p-2">Begin</th>
          <th class="border border-gray-300 p-2">End</th>
          <th class="border border-gray-300 p-2">Room</th>
          <th class="border border-gray-300 p-2">Instructor</th>
        </tr>
      </thead>
      <tbody>
        {#each orderedCourses(filteredCourses, card.courses) as course (course.course_code)}
          <!-- Render CourseCard as table rows -->
          <CourseCard {course} {selectCourse} 
            isSelected={card.courses.find(c => c.course_code === course.course_code)} />
        {/each}
      </tbody>
    </table>
  {/if}
  {:else} 
    Please select a schedule before proceeding...
  {/if}
</div>

<script>
	import { getScheduleByID } from "./db";
  import { selectedScheduleID } from "../store.js";
  import {flip} from 'svelte/animate';
	import CourseCard from "./CourseCard.svelte";
	import { filterCourses } from "./search";
  
  export let selectCourse;
  export let card;
  export let audit;
  let schedule = null; // Initialize schedule to null
  let courses = null;
  let filteredCourses = [];

  let searchTerm = "";
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
  
  async function loadSchedule(selectedScheduleID) {
    try {
      // Fetch the schedule object using the selectedScheduleID
      schedule = await getScheduleByID(selectedScheduleID);
      courses = schedule.courses;
      filteredCourses = filterCourses(courses,filters);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  }


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
  
  function searchCourses() {
    if (filters.keyword.length > 0){
      filters.keyword[0] = searchTerm;
    } else {
      filters.keyword.push(searchTerm);
    }

    filteredCourses = filterCourses(courses,filters);
  }
  
  $: loadSchedule($selectedScheduleID); 
</script>

<style>
	.test {
 		display: contents; 
	}
	
</style>
