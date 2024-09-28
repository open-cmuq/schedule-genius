<script>
  import { onMount } from "svelte";
  import { slide } from 'svelte/transition';
  import { selectedScheduleID } from "../store.js";
  import { hashStringToColor } from "$lib/colors";

  export let course = null;
  export let schedule = null;
  export let updateTimetable;
  export let selectCourse;
  export let checkBoxUpdate;

  let inSched;
  let isExpanded = false;

  function toggleExpand() {
    isExpanded = !isExpanded;
  }

  function isSectionSelected(index) {
    // Check if course and course.selected are initialized
    if (!course || !course.selected) return false;
    return course.selected.includes(index);
  }

  function generateColor() {
    return hashStringToColor(course.course_code);
  }

  function handleCheckboxChange(c, index) {
    // if (!c.selected) return; // Guard against undefined c.selected
    if (c.selected.includes(index)) {
      c.selected = c.selected.filter(i => i !== index);
    } else {
      c.selected.push(index);
      if (index < c.sections.length - 1 && 
          c.sections[index + 1].section_type === "Recitation") {
        c.selected.push(index + 1);
      }
    }
    checkBoxUpdate();
    updateTimetable();
  }

  async function refreshCard(selectedScheduleID) {
    if (!course || !schedule) return; // Guard against undefined course/schedule
    await waitForSchedule(selectedScheduleID, 1000); // waits up to 1 second

    if (schedule) {
      console.log("Updating select color");
      inSched = schedule.courses.find(c => c.course_code === course.course_code);
      // TODO Figure out why this causes a bug.
      // In theory this should show the updated information for the new schedule
      // course = inSched ? inSched : course;
    } else {
      inSched = true;
    }
  }

  function waitForSchedule(selectedScheduleID, timeout) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      (function checkCondition() {
        if (schedule && schedule.ID === selectedScheduleID) {
          resolve();
        } else if (Date.now() - startTime >= timeout) {
          resolve(); // resolve even if the condition isn't met after timeout
        } else {
          requestAnimationFrame(checkCondition);
        }
      })();
    });
  }

  onMount(async () => {
    if (course && schedule) {
      await refreshCard(selectedScheduleID);  
    }
  });

  // Ensure reactive statement only runs if both course and schedule are defined
  $: refreshCard($selectedScheduleID);
  
</script>

{#if course && schedule}
<div 
  class={`p-4 rounded shadow`}  
  style={`background-color: ${generateColor()};`}> <!-- Always show the same color, for now TODO bug fix -->
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
    <button class="text-red-500" on:click={() => selectCourse(course)}>X</button>
  </div>
  <div class="mt-2 text-gray-700">{course.course_code}::{course.units} units</div>
  {#if isExpanded}
    <div transition:slide={{duration: 400}}>
      <table class="mt-4 w-full text-left table-fixed">
        <thead>
          <tr>
            <th class="w-2/12">Select</th>
            <th class="w-2/12">Section Code</th>
            <th class="w-3/12">Instructor</th>
            <th class="w-3/12">Time</th>
            <th class="w-3/12">Days</th>
          </tr>
        </thead>
        <tbody>
          {#each course.sections as section, index}
            <tr>
              {#if (course.sections.length === 2 && course.sections[1].section_type !== "Recitation") 
                  || (course.sections.length >= 3)}
                <td>
                  <input type="checkbox" checked={isSectionSelected(index)} 
                    on:change={() => handleCheckboxChange(course, index)} />
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
{:else} 
<div class={`p-4 rounded shadow`} style={`background-color: gray;`}> 
  Loading course details...
</div>
{/if}


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
