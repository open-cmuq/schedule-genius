<Navbar />
<div class="p-1">
  {#each scheduleCards as card (card.id) }
    <ScheduleCard {card} onRemove={handleRemoveCard} />
  {/each}
  <div class="flex items-center justify-center p-2">
    <button class="rounded-full border border-gray-700 bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 focus:outline-none focus:shadow-outline  flex items-center justify-center" on:click={addScheduleCard}>
    Create a plan
    </button>
  </div>

</div>
  
<script>
	import { fetchSchedules, getAllScheduleCards, createScheduleCard, } from '$lib/db';
  import { onMount, afterUpdate } from 'svelte';
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
  
  function handleRemoveCard(cardID) {
    scheduleCards = scheduleCards.filter(card => card.id !== cardID);
  }

  onMount(async () => {
    await fetchSchedules();
    // TODO There's a bug here where if it fails to fetch schedules the cards 
    // don't render and we don't run what's below, the backend being down shouldn't 
    // nuke the students data
    scheduleCards = await getAllScheduleCards();
    supportIndexedDB = 'indexedDB' in window;
  })
  
  // TODO When deleting a card we don't really want to scroll to the bottom. 
  // The issue is when using a scroll in the add function, we have a race 
  // where the scrolling occurs before the creation of the schedule card
  afterUpdate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
</script>
