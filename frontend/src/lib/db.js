import Dexie from 'dexie';

const db = new Dexie("schedule-genius");

db.version(1).stores({
  schedules: 'ID, semester_shortcode, last_update',
  scheduleCards: '++id, major, entry_year,courses', 
  audits: '++id, major, entry_year' 
  },
);

let schedules_counter = -1;

// Given a schedule object from the server we 
// save it to the schedules store
export const saveSchedule = async (schedule) => {
  try {
    const existingShortcode = 
      await db.schedules.where('semester_shortcode').equals(schedule.semester_shortcode).first();
    
    // We have a semester with the same shortcode, get the latest one
    if (existingShortcode && 
      (new Date(schedule.last_update) > new Date(existingShortcode.last_update))){
      // Delete the old version
      await db.schedules.delete(existingShortcode.ID); 
      console.log("Deleted schedule with ID",existingShortcode.ID);
    } else if (existingShortcode){
      // We already have latest one return
      return;
    }
    await db.schedules.put(schedule);
  } catch(error) {
    console.error("Failed to save schedule:",error);
  }
}

// Given a URL we fetch that specific schedule 
// and save it to the schedules store
export const fetchSchedule = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule from ${url}: ${response.statusText}`);
    }
    const schedule = await response.json();
    await saveSchedule(schedule);
  } catch (error) {
    console.error("Failed to fetch or save schedule:", error);
  }
}

// Given a URL if specified we get all schedules 
// from the server
export const fetchSchedules = async (url = "http://127.0.0.1:8000/schedules") => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch schedules from ${url}: ${response.statusText}`);
    }
    const schedules = await response.json();

    // Wait for all schedules to be saved in indexedDB, previously we had a race 
    // condition as we weren't waiting for all promises to resolve
    await Promise.all(schedules.schedules.map(async (sched) => {
      try {
        await saveSchedule(sched);
      } catch (error) {
        console.error("Failed to save schedule:", error);
      }
    }));

    return true;
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return false;
  }
};


// Given an uploaded excel file upload it to the server 
// to be processed
export const uploadSchedule = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sched_name', 'Test');

  try {
    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const newSchedule = await response.json();
    await saveSchedule(newSchedule);
    return await getAllSchedules();
  } catch (error) {
    console.error("Failed to upload or save schedule:", error);
    throw error; // Re-throw to allow the caller to handle this if needed
  }
}

// Returns all schedule ID's and its associated 
// name and update date from what is saved in the browser
export const getAllSchedules = async () => {
  try {
    const schedules = await db.schedules.toArray();
    return schedules.map(schedule => ({
      ID: schedule.ID,
      semester_name: schedule.semester_name,
      last_update: schedule.last_update,
    }));
  } catch (error) {
    console.error("Failed to retrieve all schedules:", error);
    return [];
  }
}

export const getScheduleByID = async (ID) => {
  try {
    const schedule = await db.schedules.where("ID").equals(ID).first();
    return schedule;
  } catch (error) {
    console.error(`Failed to retrieve schedule by ID ${ID}:`, error);
    return null;
  }
}

// Save or update a schedule card
export const saveScheduleCard = async (card) => {
  try {
    if (card.id) {
      await db.scheduleCards.put(card);
    } else {
      await db.scheduleCards.add(card);
    }
  } catch (error) {
    console.error("Failed to save schedule card:", error);
  }
}

// Get all Schedule Cards
export const getAllScheduleCards = async () => {
  try {
    return await db.scheduleCards.toArray();
  } catch (error) {
    console.error("Failed to retrieve schedule cards:", error);
    return [];
  }
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
  try {
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
      await saveScheduleCard({name: generatePlanName(), major: '', entry_year: '', courses: [], courses_taken: ["15210","02251"]});
    }
  } catch (error) {
    console.error("Failed to create schedule card:", error);
  }
}

// Given the ID of a scheduleCard get rid of it
export const deleteScheduleCard = async (id) => {
  try {
    await db.scheduleCards.delete(id);
  } catch (error) {
    console.error(`Failed to delete schedule card with ID ${id}:`, error);
  }
}



export const fetchAudit  =  async (major,entry_year) => {
  // Check if the audit data is already in the database
  let existingAudit = await db.audits
    .where({ major: major, entry_year: entry_year })
    .first();


  if (existingAudit) {
    return existingAudit.audit;
  } else {
    // If not found, fetch the data from the server
    let response;
    let fetchedAudit = null;
    
    let url = `http://localhost:8000/audit/${major}/${entry_year}`;
    // Catches error if backend is down
    try {
      response = await fetch(url);
    } catch (error) {
      throw error;
    }
    
    // Check if the response is ok (status code 200-299) 
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    } else {
      fetchedAudit = await response.json();
      // Save the fetched data in the database as received,
      // the reader script can only parse the original response 
      // and we need to get rid of the metadata and new object properties
      await db.audits.add({ audit: fetchedAudit, major: major, entry_year: entry_year });
    }
    
    return fetchedAudit;
  }
}
