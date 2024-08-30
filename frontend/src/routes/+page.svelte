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
  <footer class="text-center py-4 text-gray-500 text-sm">
    <p>Made with ❤️ for <a href="https://github.com/open-cmuq">Open-CMUQ</a></p>
    <p class="flex items-center justify-center mt-2">
      <span>&copy; {new Date().getFullYear()} MIT License</span>
      <a href="https://github.com/open-cmuq/schedule-genius" target="_blank" class="ml-2 text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5 fill-current" aria-label="GitHub">
          <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.92.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.42-3.87-1.42-.52-1.32-1.28-1.67-1.28-1.67-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.97.1-.74.4-1.26.72-1.55-2.56-.29-5.26-1.28-5.26-5.67 0-1.25.44-2.27 1.16-3.07-.12-.29-.5-1.46.1-3.04 0 0 .96-.31 3.15 1.18.91-.25 1.89-.37 2.86-.37s1.95.12 2.86.37c2.18-1.5 3.15-1.18 3.15-1.18.6 1.58.22 2.75.1 3.04.72.8 1.16 1.82 1.16 3.07 0 4.4-2.7 5.38-5.26 5.67.42.36.76 1.08.76 2.17v3.22c0 .31.21.66.8.56A10.51 10.51 0 0023.5 12c0-6.27-5.23-11.5-11.5-11.5z"/>
        </svg>
      </a>
    </p>
  </footer>
{:else if fetchResult === false }
  <p class="text-red-500">Failed to fetch the latest schedule. Please try again later.</p>
{:else}
  Please wait as we fetch the latest schedule...  
{/if}
