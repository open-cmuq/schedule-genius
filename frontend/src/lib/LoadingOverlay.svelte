<script>
  export let isLoading = false;
  export let message = "Loading";
</script>

{#if isLoading}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="flex items-center space-x-2">
      <span class="loading loading-spinner loading-lg text-white"></span>
      <p class="text-white text-xl">{message}</p>
    </div>
  </div>
{/if}
