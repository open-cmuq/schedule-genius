import Dexie from 'dexie';

const db = new Dexie("schedule-genius");

db.version(1).stores({
  schedules: 'ID, semester_shortcode, last_update'
});

export const saveSchedule = async (schedule) => {
  const existingShortcode = 
    await db.schedules.where('semester_shortcode').equals(schedule.semester_shortcode).first();
  
  // We have a semester with the same shortcode, get the latest one
  if (existingShortcode && 
    (new Date(schedule.last_update) > new Date(existingShortcode.last_update))){
    // Delete the old version
    await db.schedules.delete(existingShortcode.ID); 
  } else if (existingShortcode){
    // We already have latest one return
    return;
  }
  await db.schedules.put(schedule);
}

export const fetchSchedule = async (url) => {
  const response = await fetch(url);
  const schedule = await response.json();
  await saveSchedule(schedule);
}

export const fetchSchedules  =  async (url) => {
  const response = await fetch(url);
  const schedules = await response.json();
  schedules.schedules.forEach(sched => saveSchedule(sched));
}
