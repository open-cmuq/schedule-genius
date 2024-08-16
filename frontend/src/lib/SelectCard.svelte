<script>
	import { hashStringToColor } from "./colors";
  import { slide } from 'svelte/transition';


  export let course;
  // TODO This is for checking that the course is in the 
  // current schedule
  //export let courses;
  export let updateTimetable;
  export let selectCourse;

  let isExpanded = false;

  function toggleExpand() {
    isExpanded = isExpanded ? false : true;
  }

  function isSectionSelected(index){
    let selected = course.selected; 
    return selected.includes(index);
  }

  function generateColor() {
    return hashStringToColor(course.course_code);
  }

  function handleCheckboxChange(c,index){
    if (c.selected.includes(index)){
      c.selected = c.selected.filter(i =>  i !== index);
    } else {
      c.selected.push(index);
      c.selected = c.selected;
    }
    updateTimetable();
  }
</script>

<style>
  .expandable-content {
    transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
    overflow: hidden;
  }

  .expanded {
    max-height: 1000px; /* TODO Adjust */
    opacity: 1;
  }

  .collapsed {
    max-height: 0;
    opacity: 0;
  }
</style>

<div class={`p-4 rounded shadow`}  style={`background-color: ${generateColor()};`}>
  <div class="flex justify-between items-center">
    <div class="flex items-center">
      <button on:click={toggleExpand} class="text-gray-500">
        {#if isExpanded}
          &#9650; <!-- Up arrow -->
        {:else}
          &#9660; <!-- Down arrow -->
        {/if}
      </button>
      <h2 class="font-bold ml-2">{course.course_title}</h2>
    </div>
    <button class="text-red-500" on:click={selectCourse(course)}>X</button>
  </div>
  <div class="mt-2 text-gray-700">{course.course_code}::{course.units} units</div>
  {#if isExpanded}
    <div transition:slide={{duration: 400}}>
      <table class="mt-4 w-full text-left table-fixed">
        <thead>
          <tr>
            <th class="w-1/12">Select</th>
            <th class="w-2/12">Section Code</th>
            <th class="w-3/12">Instructor</th>
            <th class="w-3/12">Time</th>
            <th class="w-3/12">Days</th>
          </tr>
        </thead>
        <tbody>
          {#each course.sections as section, index}
            <tr>
              {#if course.sections.length > 1}
                <td>
                  <input type="checkbox" checked={isSectionSelected(index)} 
                    on:change={() => handleCheckboxChange(course,index)}/>
                </td>
              {:else} 
                <td></td>
              {/if}
              <td>{section.section_id}</td>
              <td>{section.timings.instructor.join(', ')}</td>
              <td>{section.timings.begin} - {section.timings.end}</td>
              <td>{section.timings.days.join(', ')}</td>
            </tr>
          {/each}
        </tbody>
      </table>    
    </div>
  {/if}
</div>
