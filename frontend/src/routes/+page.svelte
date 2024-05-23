<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<script>
	import { fetchSchedule, fetchSchedules } from '$lib/db';
  import { onMount } from 'svelte';
  
  onMount(async () => {
    await fetchSchedules("http://127.0.0.1:8000/schedules");
  })
</script>
