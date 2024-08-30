<script>
	import { onMount } from "svelte";
  import { fly, slide } from 'svelte/transition';
  import { selectedScheduleID } from "../store.js";
  import {deleteScheduleCard, saveScheduleCard, fetchAudit, getScheduleByID } from "$lib/db";
  import Search from '$lib/Search.svelte';
  import Timetable from "$lib/Timetable.svelte"; 
  import SelectCard from "$lib/SelectCard.svelte";

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
  let entryOptions = [2021,2022,2023,2024];

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
      try {
        audit = await fetchAudit(card.major, card.entry_year);
      } catch (error){
        console.error("Failed to fetch audit data:",error); 
        audit = null;
      }
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
    try {
      // Fetch the schedule object using the selectedScheduleID
      schedule = await getScheduleByID(selectedScheduleID);
      courses = schedule.courses;
      updateTimetable();
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  }

  onMount(async () => {
    // Fixes bug where user deletes data and audit is only fetched 
    // once the user changes card selection
    if (card.major && card.entry_year){
      audit = await fetchAudit(card.major, card.entry_year); 
    } 
  });
  
  $: loadSchedule($selectedScheduleID);
</script>

<div 
  class="schedule-card flex flex-col p-5 m-4 bg-white border border-gray-200 rounded-lg shadow dark:border-gray-700" 
  in:fly={{x: 100, y: -200, duration: 300}} 
  out:fly={{ x: -200, duration: 300 }}>
  <div class="flex justify-between">
    <h5 class="text-2xl font-bold underline tracking-tight text-gray-900">
      {card.name}
    </h5>
    <button 
      class="p-2 mb-5 ml-2 w-5 h-5 bg-red-700 text-white rounded-full flex items-center justify-center" 
      on:click={removeCard}>
      X
    </button>
  </div>
  
  <div class="flex justify-between items-center mb-4">
    <button 
      class="expand-button bg-gray-200 pl-1 pr-1 rounded-md" 
      on:click={() => (expanded = !expanded)}>
      {#if expanded}
        Collapse
      {:else}
        Student Information
      {/if}
    </button>
  </div>

  {#if expanded}
  <div class="flex justify-between items-center mb-4" transition:slide> 
    <div class="flex flex-col space-y-2 text-sm"> 
      <div class="flex items-center">
        <label class="text-gray-700 mr-2">Major:</label>
        <select name="major-select" id="major-select" 
            class="rounded p-1"
            bind:value={card.major} 
            on:change={() => updateCard(card)}>
          {#each majorOptions as majorOption}
            <option value={majorOption.id}>{majorOption.name}</option> 
          {/each} 
        </select>
      </div>
      
      <div class="flex items-center">
        <label class="text-gray-700 mr-2">Entry Year:</label>
        <select name="entry-select" id="entry-select" 
            class="rounded p-1"
            bind:value={card.entry_year} 
            on:change={() => updateCard(card)}>
          {#each entryOptions as entryOption}
            <option value={entryOption}>{entryOption}</option> 
          {/each} 
        </select>
      </div>
    
      <div class="flex flex-wrap items-center">
        <label class="text-gray-700 mr-2">Courses Taken:</label>
          {#each card.courses_taken as course}
            <button 
              class="text-black bg-gray-100 rounded-full ml-2 p-1 px-2 hover:bg-red-200" 
              on:click={deleteCourseTaken(course)}>
              {course}
            </button> 
          {/each}
          <button 
            class="ml-2 bg-gray-400 text-white p-2 rounded-full w-5 h-5 flex items-center justify-center" 
            on:click={() => {/* TODO Open course addition menu */}}>
            +
          </button>
      </div>
    </div>  
  </div>
  {/if}

  <div class="grid grid-cols-5 gap-4 mb-3">
    <div class="col-span-3 border border-gray-300 rounded p-4 max-h-96">
    {#key timetableCount}
      <Timetable {card} schedule={courses} />
    {/key}
    </div>
    <div class="col-span-2 border border-gray-300 rounded p-4 max-h-96 overflow-auto">
      <p>Selected Courses:</p>
      <ul>
        {#each card.courses as course (`${course.course_code}-${course.sections.map(s => s.section_code).join('-')}`) }
          <SelectCard {schedule} {course} {updateTimetable} {selectCourse}/>
        {/each}
      </ul>
    </div>
  </div>

  <div class="flex flex-col items-center justify-center">
    <button 
      class="px-4 py-1 flex items-center justify-center text-black font-bold bg-white     
      rounded-full border border-gray-200 hover:bg-gray-200 focus:outline-none focus:shadow-outline" 
      on:click={() => showSearch = !showSearch}>
      {showSearch ? 'Hide Search' : 'Search Courses'}
    </button>
    {#if showSearch }
      {#if card.major && card.entry_year && audit }
        <Search {selectCourse} {card} {audit} {courses} {loadSchedule}/> 
      {:else if card.major}
        Please fill out your entry year
      {:else if card.entry_year}
        Please fill out your major
      {:else} 
        Please fill out your major and entry year
      {/if}
    {/if}
  </div>
</div>

<style>
  .expand-button {
    cursor: pointer;
  }
</style>
