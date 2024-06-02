import Dexie from 'dexie';

const db = new Dexie("schedule-genius");

db.version(1).stores({
  schedules: 'ID, semester_shortcode, last_update',
  scheduleCards: '++id, major, entry_year,courses'
  },
);

let schedules_counter = -1;

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

// Returns all schedules ID and its associated 
// name and update date
export const getAllSchedules = async () => {
  const schedules = await db.schedules.toArray();
  return schedules.map(schedule => ({
    ID: schedule.ID,
    semester_name: schedule.semester_name,
    last_update: schedule.last_update,
  })
  )
}

export const getScheduleByID = async (ID) => {
  const schedule = await db.schedules.where("ID").equals(ID).first();
  return schedule;
}

// Save or update a schedule card
export const saveScheduleCard = async (card)=> {
  if (card.id) {
    await db.scheduleCards.put(card);
  } else{
    await db.scheduleCards.add(card);
  }
}

// Get all Schedule Cards
export const getAllScheduleCards = async () => {
  return await db.scheduleCards.toArray();
}

// Generate the next cards name
function generatePlanName() {
  schedules_counter++;
  return "Plan " + String.fromCharCode('A'.charCodeAt() + schedules_counter % 25);
}

// Create a new scheduleCard, it should inherit the properties 
// of the previous card for usability. Professors will have to change it 
// but it doesn't require too much effort.
export const createScheduleCard = async () => {
  const cards = await getAllScheduleCards();
  const lastCard = cards[cards.length - 1];
  schedules_counter = (cards.length - 1);
  if (lastCard){
    // Inherits the information from the previous card but removes 
    // selections
    const newCard = {...lastCard, id: undefined, name: generatePlanName(), courses: []};
    await saveScheduleCard(newCard);
  } else {
    // This is the first card so nothing to inherit from
    await saveScheduleCard({name: generatePlanName(), major: '', entry_year: '', courses:[], courses_taken: ["15210","02251"]});
  }
}

// Given the ID of a scheduleCard get rid of it
export const deleteScheduleCard = async (id) => {
  await db.scheduleCards.delete(id);
}
