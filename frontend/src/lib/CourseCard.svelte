<script>
  export let course;
  export let selectCourse;
  export let isSelected = false;
</script>


<button
  on:click={() => selectCourse(course)}
  class="w-full text-left p-4 border rounded-md transition-colors duration-300"
  class:bg-blue-500={isSelected} class:text-white={isSelected}
  class:bg-white={!isSelected} class:text-black={!isSelected}
>
  {course.course_code} - {course.course_title}
</button>
