<script>
  import { onMount } from "svelte";
  import { slide } from 'svelte/transition';
  import { selectedScheduleID } from "../store.js";
	import { hashStringToColor } from "$lib/colors";


  export let course;
  // TODO This is for checking that the course is in the 
  // current schedule
  export let schedule;
  export let updateTimetable;
  export let selectCourse;

  let inSched;
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
      if (index < c.sections.length - 1 && 
        c.sections[index + 1].section_type === "Recitation"){
        c.selected.push(index + 1);
      }
      c.selected = c.selected;
    }
    updateTimetable();
  }

  /** 
   * Everytime the schedule changes we need to account for the updated 
   * timings and ensure that if the course isn't reflected in the newly 
   * selectedSchedule that we show this to the user in some form or 
   * another. Due to a race condition on when the schedule reflects and the 
   * ID is shown we have a timeout of 1s which should be reasonable. TODO we 
   * should possibly indicate an error if there was a timeout but it should be 
   * subtle and not affect the user. The only case where it fails is if the 
   * users computer is really slow which is unlikely.
   */
  async function refreshCard(selectedScheduleID) {
    await waitForSchedule(selectedScheduleID, 1000); // waits up to 1 second due to race

    if (schedule) {
        console.log("Updating select color");
        inSched = schedule.courses.find(c => c.course_code === course.course_code);
        course = inSched ? inSched : course;
    } else {
        inSched = true;
    }
}
  
  /** 
   * We wait until the timeout to check whether the schedule and the selectedScheduleID
   * are actually matching or not. After the timeout we simply resolve, regardless if 
   * it matches or not. 
   */
  function waitForSchedule(selectedScheduleID, timeout) {
      return new Promise((resolve, reject) => {
          const startTime = Date.now();

          (function checkCondition() {
              if (schedule.ID === selectedScheduleID) {
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
    refreshCard(selectedScheduleID);  
  });

  $: refreshCard($selectedScheduleID);
</script>

<div 
  class={`p-4 rounded shadow`}  
  style={`background-color: ${inSched ? generateColor() : 'gray'};`}>
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
              <!-- We need to ensure that you can't unselect a recitation  -->
              <!-- TODO: WE have a bug where the select for the recitation doesn't update and if we unselect a  -->
              <!-- recitation/lecture pair it doesn't remove the whole pair. -->
              {#if (course.sections.length === 2 && course.sections[1].section_type !== "Recitation") 
                  || (course.sections.length >= 3)
              }
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
