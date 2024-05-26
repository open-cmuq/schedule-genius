import Dexie from 'dexie';

const db = new Dexie("schedule-genius");

db.version(1).stores({
  schedules: 'ID, semester_shortcode, last_update'
  },
);

// Given a schedule object from the server we 
// save it to the schedules store
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

// Given a URL we fetch that specific schedule 
// and save it to the schedules store
export const fetchSchedule = async (url) => {
  const response = await fetch(url);
  const schedule = await response.json();
  await saveSchedule(schedule);
}

// Given a URL if specified we get all schedules 
// from the server
export const fetchSchedules  =  async (url="http://127.0.0.1:8000/schedules") => {
  const response = await fetch(url);
  const schedules = await response.json();
  schedules.schedules.forEach(sched => saveSchedule(sched));
}

// Given an uploaded excel file upload it to the server 
// to be processed
export const uploadSchedule = async (file) => {
  const formData = new FormData();
  formData.append('file',file);
  formData.append('sched_name','Test');

  const response = await fetch("http://127.0.0.1:8000/upload", {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  const newSchedule = await response.json();
  await saveSchedule(newSchedule);
  return getAllSchedules();
}

// Returns all schedules ID and its associated semester name
export const getAllSchedules = async () => {
  const schedules = await db.schedules.toArray();
  return schedules.map(schedule => ({
    ID: schedule.ID,
    semester_name: schedule.semester_name,
  })
  )
}
