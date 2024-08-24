<!-- This is the initial entry point to our application, we introduce the concept of  -->
<!-- a schedule card which is a semester plan. It has associated student information  -->
<!-- such as student major and entry year, in addition to this it also contains the  -->
<!-- courses which were taken and selected for this schedule. The schedule card is  -->
<!-- agnostic to the selected schedule so changing the schedule automatically would  -->
<!-- change the timings and preserve the previous selection. If a course doesn't exist -->
<!-- we display it to the user.  -->

<script>
  import { onMount, afterUpdate } from 'svelte';
	import { fetchSchedules, getAllScheduleCards, createScheduleCard, } from '$lib/db';
  import Navbar from '$lib/Navbar.svelte';
  import ScheduleCard from '$lib/ScheduleCard.svelte';
  
  // TODO Ensure that IndexedDB is supported 
  let supportIndexedDB = false;
  let fetchResult = null;
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
    fetchResult = await fetchSchedules();
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

{#if fetchResult}
  <Navbar />
  <div class="p-1">
    <!-- Generate existing cards  -->
    {#each scheduleCards as card (card.id) }
      <ScheduleCard {card} onRemove={handleRemoveCard} />
    {/each}
     
    <div class="flex items-center justify-center p-2">
      <button 
        class="px-4 py-2 flex items-center justify-center text-black font-bold bg-white
        rounded-full border border-gray-700 hover:bg-gray-200 focus:outline-none focus:shadow-outline " 
        on:click={addScheduleCard}>
        Create a plan
      </button>
    </div>
  </div>
{:else if fetchResult === false }
  <p class="text-red-500">Failed to fetch the latest schedule. Please try again later.</p>
{:else}
  Please wait as we fetch the latest schedule...  
{/if}
