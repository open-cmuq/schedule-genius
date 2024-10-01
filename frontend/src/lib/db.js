/**
 * @typedef {import('./types').Schedule} Schedule
 * @typedef {import('./types').ScheduleCard} ScheduleCard
 * @typedef {import('./types').Audit} Audit
 */

import Dexie from 'dexie';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const db = new Dexie("schedule-genius");

db.version(1).stores({
  schedules: 'ID, semester_shortcode, last_update',
  scheduleCards: '++id, major, entry_year,courses', 
  audits: '++id, major, entry_year' 
  },
);

let schedules_counter = -1;

/**  
 * Given a schedule object from the server we save it to the schedules 
 * store
 *
 * @param {Schedule} schedule  
 * @returns {boolean} - true if succesful, false otherwise
 */
export const saveSchedule = async (schedule) => {
  try {
    // Check if a schedule with the same semester_shortcode exists
    const existingShortcode = await db.schedules
      .where('semester_shortcode')
      .equals(schedule.semester_shortcode)
      .first();

    // Check if the exact schedule ID already exists
    const existingID = await db.schedules.where('ID').equals(schedule.ID).first();

    // If the shortcode matches, only keep the latest one
    if (existingShortcode && !((schedule.semester_shortcode[0] === 'T' || 
      schedule.semester_shortcode[0] === 'U'))) {
      if (new Date(schedule.last_update) > new Date(existingShortcode.last_update)) {
        // Delete the old version
        await db.schedules.delete(existingShortcode.ID);
        console.log("Deleted schedule with ID:", existingShortcode.ID);
      } else {
        console.log("Existing schedule is already the latest.");
        return true; // If existing one is newer or equal, skip saving
      }
    }

    // If a schedule with the same ID exists, dismiss saving it
    if (existingID) {
      console.log("Schedule with ID already exists:", schedule.ID);
      return true; // Dismiss saving
    }
    // Save the new schedule
    await db.schedules.put(schedule);
    console.log("Saved new schedule:", schedule.ID);
    return true;

  } catch (error) {
    console.error("Failed to save schedule:", error);
    return false;
  }
};


/**  
 * Given a URL we fetch that specific schedule json and save it to 
 * our indexedDB store.
 *
 * @param {string} url  
 * @returns {boolean} - true if succesful, false otherwise
 */
export const fetchSchedule = async (url) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule from ${url}: ${response.statusText}`);
    }
    const schedule = await response.json();
    await saveSchedule(schedule);
    return true;
  } catch (error) {
    console.error("Failed to fetch or save schedule:", error);
    return false;
  }
}

/**  
 * Given a URL we fetch all schedules that the endpoint
 * has. We then save them to our indexedDB store.
 *
 * @param {string} url  
 * @returns {boolean} - true if succesful, false otherwise
 */
export const fetchSchedules = async (url = "/schedules") => {
  try {
    const response = await fetch(`${BASE_URL}${url}`);
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
    console.log("Fetched all schedules succesfuly");
    return true;
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return false;
  }
};


/**  
 * Given an uploaded Excel file upload it to the server 
 * to be processed and receive back a schedule json
 *
 * @param {TODO} file  
 * @returns {Array.<Schedule>} all Schedules 
 * @throws {Error} If the upload fails or the response is not ok.
 */
export const uploadSchedule = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sched_name', file.name);

  try {
    const response = await fetch(`${BASE_URL}/upload`, {
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

/**  
 * We get all schedules in the indexedDB store and it's 
 * associated name, last_update and ID. We exclude the 
 * courses information and sort by last update.
 * @typedef {Object} ScheduleSummary
 * @property {string} ID - The unique identifier for the schedule.
 * @property {string} semester_name - The name of the semester.
 * @property {Date} last_update - The last time the schedule was updated.
 *
 * @returns {Array.<ScheduleSummary>} all Schedules in sorted order 
 */
export const getAllSchedules = async () => {
  try {
    const schedules = await db.schedules.toArray();
    return schedules
      .map(schedule => ({
        ID: schedule.ID,
        semester_name: schedule.semester_name,
        last_update: schedule.last_update,
      }))
      .sort((a, b) => new Date(a.last_update) - new Date(b.last_update)); // Sort by last_update
  } catch (error) {
    console.error("Failed to retrieve all schedules:", error);
    return [];
  }
};


/**  
 * Given an ID we get the schedule from store
 *
 * @param {string} ID 
 * @returns {(Schedule | null) Return the specified schedule to caller 
 */
export const getScheduleByID = async (ID) => {
  try {
    const schedule = await db.schedules.where("ID").equals(ID).first();
    return schedule;
  } catch (error) {
    console.error(`Failed to retrieve schedule by ID ${ID}:`, error);
    return null;
  }
}

/**  
 * Save or update a schedule card to the indexedDB store
 *
 * @param {ScheduleCard} card 
 * @returns {boolean} true if succesful, false otherwise 
 */
export const saveScheduleCard = async (card) => {
  try {
    if (card.id) {
      await db.scheduleCards.put(card);
    } else {
      await db.scheduleCards.add(card);
    }
    return true;
  } catch (error) {
    console.error("Failed to save schedule card:", error);
    return false;
  }
}

/**
 * Get all ScheduleCards in the indexedDB store 
 * 
 * @returns {Array.<ScheduleCard>} 
 */
export const getAllScheduleCards = async () => {
  try {
    return await db.scheduleCards.toArray();
  } catch (error) {
    console.error("Failed to retrieve schedule cards:", error);
    return [];
  }
}

/**
  * Genereate the next cards name 
  *
  * @returns {string} The plan name
  */
function generatePlanName() {
  schedules_counter++;
  return "Plan " + String.fromCharCode('A'.charCodeAt() + schedules_counter % 25);
}

/**
 * Create a new scheduleCard, it should inherit the properties of the 
 * previous card as most students plans will be incremental. It gets 
 * saved to the indexedDB store
 *
 * @returns {boolean} true if succesful, false otherwise
 */
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
      await saveScheduleCard({name: generatePlanName(), major: '', entry_year: '', courses: [], courses_taken: []});
    }
    return true;
  } catch (error) {
    console.error("Failed to create schedule card:", error);
    return false;
  }
}

/**
 * Given the ID of a schedulecard, get rid of it from the 
 * local store
 * 
 * returns {boolean} true if succesful, false otherwise
 */
export const deleteScheduleCard = async (id) => {
  try {
    await db.scheduleCards.delete(id);
    return true;
  } catch (error) {
    console.error(`Failed to delete schedule card with ID ${id}:`, error);
    return false;
  }
}

/**
 * Given the ID of a schedulecard, get rid of it from the 
 * local store
 * 
 * returns {boolean} true if succesful, false otherwise
 */
export const deleteSchedule = async (id) => {
  try {
    await db.schedules.delete(id);
    console.log("Succesfully deleted schedule");
    return true;
  } catch (error) {
    console.error(`Failed to delete schedule with ID ${id}:`, error);
  }
}


/**
 * Fetch a specific audit for a specific major and entry year 
 * from the backend server or from cache if it's in the local 
 * indexedDB store. We save the fetched version to the local store 
 * upon fetching.
 * 
 * TODO We need to have a mechanisim to update the audit for any changes 
 * but for the most part once made, it's absolutely stable.
 *
 * @param {string} major 
 * @param {string} entry_year
 * @returns {Audit} Inclusion/Exclusion Audit
 */
export const fetchAudit  =  async (major,entry_year) => {
  // Check if the audit data is already in the database
  // let existingAudit = await db.audits
  //   .where({ major: major, entry_year: entry_year })
  //   .first();

  // This code is temporarily modified such that we always replace the audit 
  // with the latest one. This is in place until a mechanisim is implemented to 
  // forcefully remove audits from the client if there was an update to it.
  // Typically the audits are stable.
  // TODO Implement server side removal of audits from clients
  // if (existingAudit) {
  //   return existingAudit.audit;
  // } else {
    // If not found, fetch the data from the server
    let response;
    let fetchedAudit = null;
    
    let url = `${BASE_URL}/audit/${major}/${entry_year}`;
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
  //}
}
