<div class="flex justify-center py-5" bind:this={compRef}>
  <div class="m-2 w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:border-gray-700">
      <a href="/">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">Plan A</h5>
      </a>
      <p class="mb-3 font-normal text-gray-700 ">Here is a placeholder card for where the schedule calendar and selection list 
      will be hosted
    </p>

    <button on:click={removeCard}>Delete</button>
  </div>
</div>

<script>
  import {deleteScheduleCard} from "$lib/db";
  export let card;
  let compRef;

  async function removeCard () {
    await deleteScheduleCard(card.id);
    compRef.parentNode.removeChild(compRef);
  }

</script>
