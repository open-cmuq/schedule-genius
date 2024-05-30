<!-- <div class="flex justify-center py-5" bind:this={compRef}> -->
<!--   <div class="m-2 w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:border-gray-700"> -->
<!--       <a href="/"> -->
<!--           <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">{card.name}</h5> -->
<!--       </a> -->
<!--       <p class="mb-3 font-normal text-gray-700 ">Here is a placeholder card for where the schedule calendar and selection list  -->
<!--       will be hosted -->
<!--     </p> -->
<!---->
<!--     <button on:click={removeCard}>Delete</button> -->
<!--   </div> -->
<!-- </div> -->

<script>
  import {deleteScheduleCard} from "$lib/db";
  export let card;
  let compRef;

  async function removeCard () {
    await deleteScheduleCard(card.id);
    compRef.parentNode.removeChild(compRef);
  }

</script>

<div class="schedule-card flex flex-col p-5 m-3 bg-white border border-gray-200 rounded-lg shadow dark:border-gray-700" bind:this={compRef}>
  <div class="flex justify-between items-center mb-4">
    <div class="flex flex-col space-y-2">
      <div class="flex items-center">
        <label class="text-gray-700 mr-2">Major:</label>
        <input type="text" bind:value={card.major} class="border border-gray-300 p-1 rounded" on:input={() => saveScheduleCard(card)} />
      </div>
      <div class="flex items-center">
        <label class="text-gray-700 mr-2">Entry Year:</label>
        <input type="number" bind:value={card.entryYear} class="border border-gray-300 p-1 rounded" on:input={() => saveScheduleCard(card)} />
      </div>
      <div class="flex items-center">
        <label class="text-gray-700 mr-2">Courses Taken:</label>
        <button class="ml-2 bg-blue-500 text-white p-1 rounded" on:click={() => {/* Open course addition menu */}}>+</button>
      </div>
    </div>
    <div class="flex items-center space-x-4">
      <h5 class="text-2xl font-bold tracking-tight text-gray-900">{card.name}</h5>
      <button class="bg-red-500 text-white p-2 rounded" on:click={removeCard}>X</button>
    </div>
  </div>

  <div class="flex space-x-4">
    <div class="flex-1 border border-gray-300 rounded p-4">
      <p>Calendar Box</p>
      <!-- Calendar component will go here -->
    </div>
    <div class="flex-1 border border-gray-300 rounded p-4">
      <p>Selected Courses:</p>
      <ul>
        {#each card.courses as course}
          <li>{course.courseNumber} - {course.selectedSection}</li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="mt-4">
    <button class="bg-blue-500 text-white p-2 rounded" on:click={() => {/* Toggle search dropdown */}}>Search Courses</button>
    <!-- The search dropdown component goes here -->
  </div>
</div>


