<script>
  export let description;
  export let prereqs;
  export let coreqs;
</script>

<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
  <div class="overlay-content p-4 bg-white shadow-lg border border-gray-200 rounded-lg max-w-sm space-y-2">
    <h3 class="font-semibold text-lg">Course Details</h3>
    
    <p><strong>Description:</strong> {description}</p>
    
    {#if prereqs}
      <p><strong>Prerequisites:</strong> {prereqs}</p>
    {/if}
    
    {#if coreqs}
      <p><strong>Corequisites:</strong> {coreqs}</p>
    {/if}
  </div>
</div>

<style>
  .overlay-content {
    width: 100%;
    max-width: 400px;
    color: black;
  }
</style>
