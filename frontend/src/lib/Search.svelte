<div class="search-component flex flex-col items-start w-full">
  {#if schedule}
    {#if filteredCourses.length > 0}
      <ul>
        {#each filteredCourses as course }
          <li>
            <button on:click={() => selectCourse(course)}>
              {course.course_code} - {course.course_title}
            </button>
          </li>    
        {/each}  
      </ul>
    {:else} 
      <ul>
        {#each orderedCourses(courses,card.courses) as course (course.course_code) }
          <li animate:flip={{ duration: 300 }}>
            <button on:click={() => selectCourse(course)}>
              {course.course_code} - {course.course_title}
            </button>
          </li>    
        {/each}  
      </ul>
    {/if}
  {:else} 
    Please select a schedule before proceeding...
  {/if}
</div>

<script>
	import { getScheduleByID } from "./db";
  import { selectedScheduleID } from "../store.js";
  import {flip} from 'svelte/animate';
  
  export let selectCourse;
  export let card;
  let schedule = null; // Initialize schedule to null
  let courses = null;
  let filteredCourses = [];
  
  async function loadSchedule(selectedScheduleID) {
    console.log("Search loading schedule...");
    try {
      // Fetch the schedule object using the selectedScheduleID
      schedule = await getScheduleByID(selectedScheduleID);
      courses = schedule.courses;
      console.log("Search loaded schedule succesfully!");
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  }


  function orderedCourses(allCourses, selectedCourses) {
    // Create a set of selected course codes for quick lookup
    const selectedCourseCodes = new Set(selectedCourses.map(course => course.course_code));
    
    // Separate the selected courses from the rest
    const selected = allCourses.filter(course => selectedCourseCodes.has(course.course_code));
    const unselected = allCourses.filter(course => !selectedCourseCodes.has(course.course_code));
    
    // Combine the selected courses at the top followed by the unselected courses
    return [...selected, ...unselected];
  }
  
  $: loadSchedule($selectedScheduleID); 
</script>
