<script>
  import { getAllSchedules, uploadSchedule, getScheduleByID} from "$lib/db.js";
  import { selectedScheduleID } from "../store.js";
  import { onMount } from 'svelte';

  let schedules = [];
  let isLoading = true;
  
  const handleSelectChange = async (event) => {
    if (event.target.value === 'upload') {
      // Open file input dialog
      document.getElementById('file-input').click();
    } else {
      selectedScheduleID.set(event.target.value);
      localStorage.setItem('selectedScheduleID',event.target.value);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      schedules = await uploadSchedule(file);
      selectedScheduleID.set(schedules[schedules.length - 1].ID); // Select the newly uploaded schedule
    } catch (error) {
      localStorage.setItem('selectedScheduleID','');
      selectedScheduleID.set('');
      console.error('Error uploading file:', error);
    }
  };
  
  onMount(async () => {
    schedules = await getAllSchedules();
    // We cannot assume that schedules are the same since last session
    const storedScheduleID = localStorage.getItem('selectedScheduleID');
    const isStoredAvailable = schedules.some(schedule => schedule.ID === storedScheduleID);

    if (storedScheduleID && isStoredAvailable) {
      selectedScheduleID.set(storedScheduleID);
    } else {
      selectedScheduleID.set("");
      localStorage.setItem('selectedScheduleID','');
    }
  });

</script>
  
<nav class="bg-gray-100 grid grid-cols-3 items-center p-1 shadow">
  <div class="text-xl font-semibold">
    Schedule Genius
  </div>
  <div class="flex justify-center">
    <!-- TODO: this should include a delete button for uploaded schedules and possibly a rename one  -->
    <select name="schedule-select" id="schedule-select" bind:value={$selectedScheduleID} on:change={handleSelectChange} class="rounded p-1 text-center">
      <option disabled selected value="">--Please select a semester--</option>
      {#each schedules as schedule }
        <option value={schedule.ID}>
          {schedule.semester_name}
        </option>
      {/each}
      <option value="upload">Upload</option>
    </select>
  </div>
  <div class="ml-auto">
    Last Update: 
    {#if $selectedScheduleID != ""} 
      {#await getScheduleByID($selectedScheduleID)}
        Loading... 
      {:then schedule} 
        {schedule.last_update.slice(0,10)}
      {/await}
    {:else} 
      No schedule selected 
    {/if}
  </div>
  <input id="file-input" type="file" accept=".xlsx" style="display: none;" on:change={handleFileUpload}/>
</nav>

<slot/>

