<script>
	import { flip } from "svelte/animate";

  export let course;
  export let selectCourse;
  export let isSelected = false;
</script>
  
<!-- <button -->
<!--   on:click={() => selectCourse(course)} -->
<!--   class="w-full text-left p-4 border rounded-md transition-colors duration-300" -->
<!--   class:bg-blue-500={isSelected} class:text-white={isSelected} -->
<!--   class:bg-white={!isSelected} class:text-black={!isSelected} -->
<!-- > -->
<!--   {course.course_code} - {course.course_title} -->
<!-- </button> -->

<style>
  .course-card {
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
</style>

<!-- Render each section of the course as a table row -->
{#each course.sections as section, i (section)}
  <tr on:click={() => selectCourse(course)} class="course-card" class:bg-blue-500={isSelected} class:bg-white={!isSelected} animate:flip>
    {#if i === 0}
      <td rowspan={course.sections.length} class="border border-gray-300 p-2">{course.course_code}</td>
      <td rowspan={course.sections.length} class="border border-gray-300 p-2">{course.course_title}</td>
      <td rowspan={course.sections.length} class="border border-gray-300 p-2">{course.units}</td>
    {/if}
    <td class="border border-gray-300 p-2">{section.section_id}</td>
    <td class="border border-gray-300 p-2">{section.timings.days.join(', ')}</td>
    <td class="border border-gray-300 p-2">{section.timings.begin}</td>
    <td class="border border-gray-300 p-2">{section.timings.end}</td>
    <td class="border border-gray-300 p-2">{section.timings.teaching_location}</td>
    <td class="border border-gray-300 p-2">{section.timings.instructor.join(', ')}</td>
  </tr>
{/each}
