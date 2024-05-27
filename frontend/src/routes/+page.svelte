<Navbar />
<div class="p-1">
  {#each scheduleCards as card (card.id) }
    <ScheduleCard {card} />
  {/each}
  <div class="flex items-center justify-center p-5">
    
  <button class="rounded-full border border-gray-700 bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 focus:outline-none focus:shadow-outline  flex items-center justify-center" on:click={addScheduleCard}>
    Create a plan
  </button>
  </div>

</div>
  
<script>
	import { fetchSchedules, getAllScheduleCards, createScheduleCard } from '$lib/db';
  import { onMount } from 'svelte';
  import Navbar from '$lib/Navbar.svelte';
  import ScheduleCard from '$lib/ScheduleCard.svelte';
  
  // TODO Ensure that IndexedDB is supported 
  let supportIndexedDB = false;
  let scheduleCards = [];

  async function addScheduleCard() {
    await createScheduleCard();
    console.log("Created card");
    scheduleCards = await getAllScheduleCards();
  }
  
  onMount(async () => {
    await fetchSchedules();
    scheduleCards = await getAllScheduleCards();
    supportIndexedDB = 'indexedDB' in window;
  })
</script>
