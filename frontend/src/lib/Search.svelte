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
  export let showSearch;

  let filteredCourses = [];

  let searchTerm = "";
  let searchTimeout;
  let showOverlay = false;

  let filters = {
    keyword: [],
    countsFor: [],
    instructor: [],
    department: [],
    coursesTaken: new Set(card.courses_taken),
    units: [1, 18],
    clearedPreReqs: false,
    noConflicts: false // TODO Enabled for testing purposes only
  };

  async function refilterSchedule(selectedScheduleID) {
    try {
      courses = null;
      await loadSchedule(selectedScheduleID);
      filteredCourses = filterCourses(courses, filters, audit, card.courses);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  }

  function orderedCourses(allCourses) {
    const selectedCourseCodes = getSelectedCourse();
    const selected = courses.filter(course => selectedCourseCodes.has(course.course_code));
    const unselected = allCourses.filter(course => !selectedCourseCodes.has(course.course_code));
    return [...selected, ...unselected];
  }

  function selectCourseSearch(course) {
    selectCourse(course);
    filteredCourses = filterCourses(courses, filters, audit, card.courses);
  }

  function toggleNoConflicts() {
    filters.noConflicts = !filters.noConflicts;
    filteredCourses = filterCourses(courses, filters, audit, card.courses);
  }

  function searchCourses() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (filters.keyword.length > 0) {
        filters.keyword[0] = searchTerm;
      } else {
        filters.keyword.push(searchTerm);
      }
      filteredCourses = filterCourses(courses, filters, audit, card.courses);
    }, 100);
  }

  function getSelectedCourse() {
    return new Set(card.courses.map(course => course.course_code));
  }

  function courseSelected(course_code) {
    return card.courses.find(c => c.course_code === course_code);
  }

  function handleSearch(event) {
    searchTerm = event.target.value;
    searchCourses();
  }

  $: refilterSchedule($selectedScheduleID);
</script>

<button 
  class="btn btn-outline rounded-full border-gray-200 text-black min-h-2 h-9 text-bold text-base" 
  on:click={() => showOverlay = true}>
  Search Courses
</button>


{#if showOverlay}
  <div class="modal modal-open">
    <div class="modal-box max-w-4xl w-full relative">
      <!-- Fixed Close Button -->
      <button class="btn btn-sm btn-circle absolute top-4 right-4 z-20" on:click={() => showOverlay = false}>
        ✕
      </button>

      <!-- Main Content Wrapper with Scrollable Cards -->
      <div class="flex flex-col w-full">
        <!-- Fixed Search Controls and Header -->
        <div class="sticky top-0 z-10 bg-white w-full">
          {#if courses}
            <div class="filter-controls m-4 w-full">
              <input type="text" id="search-field" placeholder="Keywords, title, etc..."
                autocomplete="off"
                on:input={handleSearch}
                class="input input-bordered w-full mb-4"
              />
              <label class="flex items-center gap-2">
                <input type="checkbox" on:change={toggleNoConflicts} class="checkbox" />
                Hide courses which conflict with current schedule
              </label>
            </div>

            <div class="header bg-sky-600 w-full border-b-2 border-gray-200">
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
          {/if}
        </div>

        <!-- Scrollable Course Cards -->
        <div class="overflow-y-auto" style="max-height: 60vh;">
          {#if courses}
            {#if filteredCourses.length > 0}
              {#each orderedCourses(filteredCourses, card.courses) as course, index (course.course_code)}
                <div class="course-card-wrapper mt-3 {courseSelected(course.course_code) ? 'selected' : ''}
                {index % 2 === 0 ? 'bg-gray-300' : 'bg-white'}"
                  animate:flip={{ duration: 300 }}>
                  <CourseCard {course} {selectCourseSearch} {audit} />
                </div>
              {/each}
            {/if}
          {:else}
            Please select a schedule at the top before proceeding...
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}


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

