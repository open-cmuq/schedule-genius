<Navbar />


{#if supportIndexedDB}
This window supports indexedDB
{:else}
This window does not support indexedDB, please contact X
{/if}


<script>
	import { fetchSchedules } from '$lib/db';
  import { onMount } from 'svelte';
  import Navbar from '$lib/Navbar.svelte';
  
  let supportIndexedDB = false;
  onMount(async () => {
    await fetchSchedules();
    supportIndexedDB = 'indexedDB' in window;
  })
</script>
