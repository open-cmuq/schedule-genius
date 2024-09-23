<script>
  import { onMount } from 'svelte';
  import { getAllSchedules, uploadSchedule, getScheduleByID, deleteSchedule} from "$lib/db.js";
  import { selectedScheduleID } from "../store.js";
  import LoadingOverlay from './LoadingOverlay.svelte';

  let schedules = [];
  let isLoading = false;
  
  const handleSelectChange = async (event) => {
    if (event.target.value === 'upload') {
      document.getElementById('file-input').click();
    } else {
      selectedScheduleID.set(event.target.value);
      localStorage.setItem('selectedScheduleID', event.target.value);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    isLoading = true;
    try {
      schedules = await uploadSchedule(file);
      selectedScheduleID.set(schedules[schedules.length - 1].ID); // Select the newly uploaded schedule
      localStorage.setItem('selectedScheduleID', schedules[schedules.length - 1].ID);
    } catch (error) {
      localStorage.setItem('selectedScheduleID', '');
      selectedScheduleID.set('');
      console.error('Error uploading file:', error);
    }
    schedules = await getAllSchedules(); // Update the schedule list
    document.querySelector('.dropdown label').blur(); // Close dropdown
    isLoading = false;
  };

  function uploadHandler() {
    document.getElementById('file-input').click();
  }

  async function handleDelete(scheduleID) {
    const deleted = await deleteSchedule(scheduleID);
    if (deleted) {
      selectedScheduleID.set('');
      localStorage.setItem('selectedScheduleID', '');
    } else {
      //pass
    }
    schedules = await getAllSchedules(); // Update the schedule list
    document.querySelector('.dropdown label').blur(); // Close dropdown
  }

  async function changeSchedule(scheduleID) {
    selectedScheduleID.set(scheduleID);
    localStorage.setItem('selectedScheduleID', scheduleID);
    schedules = await getAllSchedules(); // Ensure schedules are up to date
    document.querySelector('.dropdown label').blur(); // Close dropdown
  }

  onMount(async () => {
    schedules = await getAllSchedules();
    const storedScheduleID = localStorage.getItem('selectedScheduleID');
    const isStoredAvailable = schedules.some(schedule => schedule.ID === storedScheduleID);

    if (storedScheduleID && isStoredAvailable) {
      selectedScheduleID.set(storedScheduleID);
    } else {
      selectedScheduleID.set("");
      localStorage.setItem('selectedScheduleID', '');
    }
  });
</script>

<nav class="fixed top-0 left-0 w-full z-30 bg-gray-100 grid grid-cols-3 items-center p-1 shadow">
  <div class="text-xl font-semibold px-3">
    Schedule Genius
  </div>

  <div class="flex justify-center relative">
    <!-- Dropdown -->
    <div class="dropdown">
      <!-- Display the selected schedule name or "Select schedule" when none is selected -->
      <label tabindex="0" class="btn btn-sm rounded px-10 text-center flex justify-between items-center">
        {#if $selectedScheduleID}
          {schedules.find(schedule => schedule.ID === $selectedScheduleID)?.semester_name || 'Unknown'}
        {:else}
          Select schedule
        {/if}
        <span class="ml-2">▼</span>
      </label>

      <!-- Dropdown menu -->
      <!-- The z-40 index is to workaround a bug where the timetable sometimes appears above the dropdown -->
      <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 z-40">
        {#each schedules as schedule }
          <li class="grid grid-cols-4 items-center p-1">
            <button class="btn btn-ghost text-left col-span-3" on:click={() => changeSchedule(schedule.ID)}>
              {schedule.semester_name}
            </button>
            <button class="btn btn-sm btn-outline ml-2" on:click={(e) => { e.stopPropagation(); handleDelete(schedule.ID); }}>
              <span>Delete</span> <!-- Consider material icons --> 
            </button>
          </li>
        {/each}
        <li><button class="btn btn-sm" on:click={uploadHandler}>Upload</button></li>
      </ul>
    </div>
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

<LoadingOverlay {isLoading} />

<slot/>

