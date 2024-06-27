<script>
    import Calendar from '@event-calendar/core';
    import TimeGrid from '@event-calendar/time-grid';

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
        events: [
          {
            id: 1, // Unique identifier for the event
            title: 'Math Test', // Event title
            start: '2024-06-27T10:00:00', // Event start time
            end: '2024-06-27T11:30:00', // Event end time
            color: '#bbbbcc' // Optional color for the event
          }
        ]
    };
</script>

<Calendar bind:this={ec} {plugins} {options} />

<style>
  /* We don't need the toolbar as we need to display only a single week */
  :global(.ec-toolbar) {
    display: none;
  }
</style>

