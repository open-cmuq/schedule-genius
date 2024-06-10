<div class="schedule-card flex flex-col p-5 m-4 bg-white border border-gray-200 rounded-lg shadow dark:border-gray-700" in:fly={{x: 100, y: -200, duration: 300}} out:fly={{ x: -200, duration: 300 }}>
  <div class="flex justify-between">
      <h5 class="text-2xl font-bold underline tracking-tight text-gray-900">{card.name}</h5>
      <button class="ml-2 bg-red-700 text-white p-2 rounded-full w-5 h-5 flex items-center justify-center mb-5" on:click={removeCard}>X</button>
  </div>
    
  <div class="flex justify-between items-center mb-4"> 
    <div class="flex flex-col space-y-2"> 
      <div class="flex items-center">
        <label class="text-gray-700 mr-2">Major:</label>
        <select name="major-select" id="major-select" bind:value={card.major} on:change={() => saveScheduleCard(card)} class="rounded p-1">
          {#each majorOptions as majorOption}
            <option value={majorOption.id}>{majorOption.name}</option> 
          {/each} 
        </select>
      </div>
      
      <div class="flex items-center">
        <label class="text-gray-700 mr-2">Entry Year:</label>
        <select name="entry-select" id="entry-select" bind:value={card.entry_year} on:change={() => saveScheduleCard(card)} class="rounded p-1">
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

  <div class="grid grid-cols-5 gap-4 mb-3">
    <div class="col-span-3 border border-gray-300 rounded p-4">
      <p>Calendar Box</p>
      <!-- Calendar component will go here -->
    </div>
    <div class="col-span-2 border border-gray-300 rounded p-4">
      <p>Selected Courses:</p>
      <ul>
        {#each card.courses as course}
          <li>{course.course_code} - {course.course_title}</li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="flex flex-col items-center justify-center">
    <button class="rounded-full border border-gray-200 bg-white hover:bg-gray-200 text-black font-bold py-1 px-4 focus:outline-none focus:shadow-outline  flex items-center justify-center" on:click={() => showSearch = !showSearch}>
      {showSearch ? 'Hide Search' : 'Search Courses'}
    </button>
    {#if showSearch }
      <Search {selectCourse} {card} />
    {/if}
  </div>
</div>

<script>
  import {deleteScheduleCard, saveScheduleCard} from "$lib/db";
  import { fly } from 'svelte/transition';
  import Search from '$lib/Search.svelte';
  export let card;
  export let onRemove;

  let showSearch = false;
 
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
      card.courses.push(course);
    }
    await saveScheduleCard(card);
    card.courses = card.courses;
  }
 
  // Delete a schedule card 
  // TODO Implement a confirmation dialogue before nuking it forever,
  // also consider an undo as well
  async function removeCard () {
    showSearch = false;
    await deleteScheduleCard(card.id);
    onRemove(card.id);
  }

</script>
