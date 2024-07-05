<div class="schedule-card flex flex-col p-5 m-4 bg-white border border-gray-200 rounded-lg shadow dark:border-gray-700" in:fly={{x: 100, y: -200, duration: 300}} out:fly={{ x: -200, duration: 300 }}>
  <div class="flex justify-between">
      <h5 class="text-2xl font-bold underline tracking-tight text-gray-900">{card.name}</h5>
      <button class="ml-2 bg-red-700 text-white p-2 rounded-full w-5 h-5 flex items-center justify-center mb-5" on:click={removeCard}>X</button>
  </div>
  
  <div class="flex justify-between items-center mb-4">
    <button class="expand-button bg-gray-200 pl-1 pr-1 rounded-md" on:click={() => (expanded = !expanded)}>
      {#if expanded}
        Collapse
      {:else}
        Student Information
      {/if}
    </button>
  </div>

  {#if expanded}
  <div class="flex justify-between items-center mb-4" transition:slide> 
    <div class="flex flex-col space-y-2"> 
      <div class="flex items-center">
        <label class="text-gray-700 mr-2">Major:</label>
        <select name="major-select" id="major-select" bind:value={card.major} on:change={() => updateCard(card)} class="rounded p-1">
          {#each majorOptions as majorOption}
            <option value={majorOption.id}>{majorOption.name}</option> 
          {/each} 
        </select>
      </div>
      
      <div class="flex items-center">
        <label class="text-gray-700 mr-2">Entry Year:</label>
        <select name="entry-select" id="entry-select" bind:value={card.entry_year} on:change={() => updateCard(card)} class="rounded p-1">
          {#each entryOptions as entryOption}
            <option value={entryOption}>{entryOption}</option> 
          {/each} 
        </select>
      </div>
    
      <div class="flex flex-wrap items-center">
        <label class="text-gray-700 mr-2">Courses Taken:</label>
          {#each card.courses_taken as course}
            <button class="text-black bg-gray-100 rounded-full ml-2 p-1 px-2 hover:bg-red-200" on:click={deleteCourseTaken(course)}>{course}</button> 
          {/each}
          <button class="ml-2 bg-gray-400 text-white p-2 rounded-full w-5 h-5 flex items-center justify-center" on:click={() => {/* TODO Open course addition menu */}}>+</button>
      </div>
    </div>  
  </div>
  {/if}

  <div class="grid grid-cols-5 gap-4 mb-3">
    <div class="col-span-3 border border-gray-300 rounded p-4 max-h-96">
    {#key timetableCount}
      <Timetable {card} count={timetableCount} schedule={courses} />
    {/key}
    </div>
    <div class="col-span-2 border border-gray-300 rounded p-4 max-h-96 overflow-auto">
      <p>Selected Courses:</p>
      <ul>
        {#each card.courses as course}
          <SelectCard {courses} {course} {updateTimetable} {selectCourse}/>
        {/each}
      </ul>
    </div>
  </div>

  <div class="flex flex-col items-center justify-center">
    <button class="rounded-full border border-gray-200 bg-white hover:bg-gray-200 text-black font-bold py-1 px-4 focus:outline-none focus:shadow-outline  flex items-center justify-center" on:click={() => showSearch = !showSearch}>
      {showSearch ? 'Hide Search' : 'Search Courses'}
    </button>
    {#if showSearch }
      <Search {selectCourse} {card} {audit} {courses} {loadSchedule}/>
    {/if}
  </div>
</div>

<script>
  import {deleteScheduleCard, saveScheduleCard, fetchAudit } from "$lib/db";
  import { fly, slide } from 'svelte/transition';
  import Search from '$lib/Search.svelte';
	import { onMount } from "svelte";
  import { getScheduleByID } from "./db";
  import Timetable from "./Timetable.svelte"; import SelectCard from "./SelectCard.svelte";

  export let card;
  export let onRemove;

  let showSearch = false;
  let audit = null;
  let schedule = null;
  let courses = null;
  let timetableCount = 0; 
  let expanded = true;
  // TODO Ideally we don't want this to be hardcoded, it should 
  // dynamically be fetched from the server
  let majorOptions = [{id: "CS", name: "Computer Science"},
    {id: "BA", name: "Business Administration"}];
  let entryOptions = [2021,2022,2023,2024,2025];

  async function deleteCourseTaken(course) {
    card.courses_taken = card.courses_taken.filter(item => course !== item);
    await saveScheduleCard(card);
  }
  
  // Select a course and save this to the database. We can't filter 
  // with the object directly as javascript sees the object as unique 
  // and I'm not sure why that is.
  async function selectCourse(course){
    const selectedCourseCodes = new Set(card.courses.map(course => course.course_code));
    
    if (selectedCourseCodes.has(course.course_code)){
      card.courses = card.courses.filter(c => c.course_code !== course.course_code);
    } else {
      let course_select;
      if (course.sections.length > 1 && 
          course.sections[1].section_type === "Recitation"){
          course_select = {...course, selected: [0,1]};
      } else {
      course_select = {...course, selected: [0]};
      }
      card.courses.push(course_select);
    }
    await saveScheduleCard(card);
    card.courses = card.courses;
    // This ensures that the timetable component gets rerendered
    updateTimetable();
  }

  async function updateTimetable(){
    timetableCount++;
  }

  async function updateCard(card) {
    await saveScheduleCard(card);
    if (card.major && card.entry_year){
      audit = fetchAudit(card.major, card.entry_year); 
    }
  }
 
  // Delete a schedule card 
  // TODO Implement a confirmation dialogue before nuking it forever,
  // also consider an undo as well
  async function removeCard () {
    showSearch = false;
    await deleteScheduleCard(card.id);
    onRemove(card.id);
  }

  // Load all courses on the schedule
  async function loadSchedule(selectedScheduleID) {
    updateTimetable();
    try {
      // Fetch the schedule object using the selectedScheduleID
      schedule = await getScheduleByID(selectedScheduleID);
      courses = schedule.courses;
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  }

  onMount(async () => {
    // Fixes bug where user deletes data and audit is only fetched 
    // once the user changes card selection
    if (card.major && card.entry_year){
      audit = fetchAudit(card.major, card.entry_year); 
    } 
  });
  
</script>

<style>
  .expand-button {
    cursor: pointer;
  }
</style>
