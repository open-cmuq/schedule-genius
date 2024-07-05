<script>
  export let course;
  export let selectCourseSearch;
</script>

<div on:click={() => selectCourseSearch(course)} class="course-card">
  <!-- We have this each block since we're generating each section, we only include  -->
  <!-- the course code and name information for the first row  -->
  {#each course.sections as section, i (section)}
      {#if i === 0}
          <div>{course.course_code}</div>
          <div>{course.course_title}</div>
          <div>{course.units}</div>
      {:else }
          <div></div>
          <div></div>
          <div></div>
      {/if}
      <div>{section.section_id}</div>
      <div>{section.timings.days.join(', ')}</div>
      <div>{section.timings.begin}</div>
      <div>{section.timings.end}</div>
      <div>{section.timings.teaching_location}</div>
      <div>{section.timings.instructor.join(', ')}</div>
  {/each}
</div>


<style>
  .course-card {
    display: contents; /* This makes the inner grid items span the full width of the wrapper */
  }

  .course-card > div {
      border: 1px solid #ccc;
      padding: 8px;
  }

  /* Rounded corners for the outer cells */
  .course-card > div:first-child {
      border-top-left-radius: 8px; /* Top left corner */
  }

  .course-card > div:nth-child(9) { /* Last cell in the first row */
      border-top-right-radius: 8px; /* Top right corner */
  }

  .course-card > div:nth-last-child(9) { /* First cell in the last row */
      border-bottom-left-radius: 8px; /* Bottom left corner */
  }

  .course-card > div:last-child {
      border-bottom-right-radius: 8px; /* Bottom right corner */
  }
</style>
