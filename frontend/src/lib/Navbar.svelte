<script>
  import { getAllSchedules, uploadSchedule } from "$lib/db.js";
  import { selectedSchedule } from "../store.js";
  import { onMount } from 'svelte';

  let schedules = [];
  
  const handleSelectChange = async (event) => {
    if (event.target.value === 'upload') {
      // Open file input dialog
      document.getElementById('file-input').click();
    } else {
      selectedSchedule.set(event.target.value);
      localStorage.setItem('selectedSchedule',event.target.value);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      schedules = await uploadSchedule(file);
      selectedSchedule.set(schedules[schedules.length - 1].ID); // Select the newly uploaded schedule
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  
  onMount(async () => {
    schedules = await getAllSchedules();
    // We cannot assume that schedules are the same since last session
    const storedSelectedSchedule = localStorage.getItem('selectedSchedule');
    const isStoredAvailable = schedules.some(schedule => schedule.ID === selectedSchedule);

    if (storedSelectedSchedule && isStoredAvailable) {
      selectedSchedule.set(storedSelectedSchedule);
    } else {
      selectedSchedule.set("");
    }
  });

</script>
  
<nav class="bg-gray-100 flex items-center justify-between p-1 shadow">
  <div class="text-xl font-semibold">Schedule Genius</div>
  <div class="flex-grow flex justify-center">
    <select name="schedule-select" id="schedule-select" bind:value={$selectedSchedule} on:change={handleSelectChange} class="rounded p-1">
      <option value="">--Please select a semester--</option>
      {#each schedules as schedule }
        <option value={schedule.ID}>
          {schedule.semester_name}
        </option>
      {/each}
      <option value="upload">Upload</option>
    </select>
  </div>
  <div class="ml-4">Semester: {#if $selectedSchedule != ""} {$selectedSchedule} {:else} No schedule selected {/if}</div>
  <input id="file-input" type="file" accept=".xlsx" style="display: none;" on:change={handleFileUpload}/>
</nav>

<slot/>

<style>
  nav {
    justify-content: space-between;
  }
</style>
