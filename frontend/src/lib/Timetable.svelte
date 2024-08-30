<script>
  import Calendar from '@event-calendar/core';
  import TimeGrid from '@event-calendar/time-grid';
  import {hashStringToColor} from "$lib/colors.js";
  
  export let schedule;
  let today = new Date();
  let dayOfWeek = today.getDay(); // 0 (Sunday) through 6 (Saturday)
  let diff = today.getDate() - dayOfWeek;
  let mostRecentSunday = new Date(today.setDate(diff));

  function convertTo24Hour(time) {
    if (time === "TBA") return null;
    const [timeStr, modifier] = time.split(/(AM|PM)/);
    let [hours, minutes] = timeStr.split(':');
    if (modifier === 'PM' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
    }
    if (modifier === 'AM' && hours === '12') {
        hours = '00';
    }
    return `${hours}:${minutes}:00`;
  }

  function generateEvents(courses){
    let events = [];
    
    courses.forEach(course => {
      course.selected.forEach( index => {
        let section;
        // We would like to grab the timings directly from the schedule
        // but if the schedule is non-selected for whatever reason we go with 
        // whatever timings were saved. This allows us to update the timings
        // reactively when a schedule is changed while still preserving the same "section"
        if (schedule){
          const courseSched = schedule.find(c => c.course_code === course.course_code);
          // Course was not found in the current schedule, we should ignore it
          if (!courseSched) return null;
          section = courseSched.sections[index];
        } else {
          section = course.sections[index];
        }

        if (section.timings.days.includes('TBA')) {
          return; // Ignore sections with TBA days
        }
        
        for (let i = 0; i < section.timings.days[0].length; i++){
          const day = section.timings.days[0][i];
          let daysToAdd = ['U', 'M', 'T', 'W', 'R', 'F', 'S'].indexOf(day);
          let eventDate = new Date(mostRecentSunday.getTime());
          eventDate.setDate(mostRecentSunday.getDate() + daysToAdd);

          // Format date as YYYY-MM-DD
          let year = eventDate.getFullYear();
          let month = String(eventDate.getMonth() + 1).padStart(2, '0');
          let dayOfMonth = String(eventDate.getDate()).padStart(2, '0');
          // Construct start and end times in 24-hour format
          let startTime24 = convertTo24Hour(section.timings.begin);
          let endTime24 = convertTo24Hour(section.timings.end);

          let event = {
           id: course.course_code,
           title: `${course.course_title} - ${section.section_type} ${section.section_id}`,
           start: `${year}-${month}-${dayOfMonth}T${startTime24}:00`,
           end: `${year}-${month}-${dayOfMonth}T${endTime24}:00`,
           color: hashStringToColor(course.course_code) // You can set a default color or derive it based on section type, etc.
          };

          events.push(event);  
        }
      });
    });
    return events;
  }


  export let card;
  let ec;
  let plugins = [TimeGrid];
  let options = {
      view: 'timeGridWeek',
      allDaySlot: false,
      height: '100%',
      editable: false,
      slotMinTime: '07:00:00',
      slotMaxTime: '19:00:00',
      theme: (theme) => {
        return {...theme};         
      },
      dayHeaderFormat: (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      },
      events: generateEvents(card.courses)
  };
  
</script>

<Calendar bind:this={ec} {plugins} {options} />

<style>
  /* We don't need the toolbar as we need to display only a single week */
  :global(.ec-toolbar) {
    display: none;
  }
</style>

