# Implementation Plan for dev-spec

## 1. High-Level Strategy

We will implement the Discord bot as a TypeScript application using discord.js for interactions, Firebase Firestore for storing user birthdays, and HTTP requests to the e-card API for templates, card creation, and signature polling. The bot will run as a Node.js process with scheduled tasks for daily checks and reminders. Key components include command handlers, a scheduler, database utilities, and API clients. Hosting will be on a cloud platform like Heroku or Vercel for simplicity.

## 2. Detailed Implementation Steps

### File: `src/index.ts` (New File)

**Objective:** Main entry point for the bot, handling initialization, event listeners, and scheduling.
**Context / Rationale:** This file bootstraps the bot, connects to Discord and Firestore, and sets up recurring tasks.
**Steps:**

1. **Action:** Set up Discord client with intents and login.
   - **Goal:** Establish connection to Discord API.
   - **Pseudocode:**
     ```
     import { Client } from 'discord.js';
     const client = new Client({ intents: [...] });
     client.login(process.env.DISCORD_TOKEN);
     ```
2. **Action:** Initialize Firestore connection.
   - **Goal:** Prepare database for birthday storage.
   - **Pseudocode:**
     ```
     import { initializeApp } from 'firebase/app';
     import { getFirestore } from 'firebase/firestore';
     const db = getFirestore(initializeApp(firebaseConfig));
     ```
3. **Action:** Register slash commands and event handlers.
   - **Goal:** Enable bot commands like /set-birthday.
   - **Pseudocode:**
     ```
     client.on('interactionCreate', handleInteraction);
     // Register commands on startup
     ```
4. **Action:** Set up daily scheduler for birthday checks.
   - **Goal:** Automate 14-day advance scheduling.
   - **Pseudocode:**
     ```
     import * as cron from 'node-cron';
     cron.schedule('0 0 * * *', checkBirthdays); // Daily at midnight UTC
     ```

### File: `src/commands/setBirthday.ts` (New File)

**Objective:** Handle the /set-birthday command to store user birthdays.
**Context / Rationale:** Admins use this to register birthdays, triggering the card event scheduling.
**Steps:**

1. **Action:** Validate input (user mention, YYYY-MM-DD format).
   - **Goal:** Ensure data integrity.
   - **Pseudocode:**
     ```
     if (!isValidDate(date)) return errorMessage;
     ```
2. **Action:** Store in Firestore.
   - **Goal:** Persist birthday data.
   - **Pseudocode:**
     ```
     await setDoc(doc(db, 'birthdays', userId), { birthday: date });
     ```
3. **Action:** Schedule card event 14 days before.
   - **Goal:** Automate coordination channel creation.
   - **Pseudocode:**
     ```
     const eventDate = subtractDays(birthday, 14);
     scheduleEvent(eventDate, createCardChannel);
     ```

### File: `src/commands/voteTemplates.ts` (New File)

**Objective:** Handle /vote-templates and /more-templates for template polling.
**Context / Rationale:** Contributors vote on card templates in the private channel.
**Steps:**

1. **Action:** Fetch random templates from API.
   - **Goal:** Get options for voting.
   - **Pseudocode:**
     ```
     const templates = await fetch('/api/discord/templates/random?count=5');
     ```
2. **Action:** Post poll with emoji reactions.
   - **Goal:** Allow voting.
   - **Pseudocode:**
     ```
     const message = await channel.send(embedWithTemplates);
     templates.forEach((_, i) => message.react(emoji[i]));
     ```
3. **Action:** Track votes and lock after 24h or majority.
   - **Goal:** Determine winner.
   - **Pseudocode:**
     ```
     setTimeout(() => {
       const winner = getMostReactions();
       lockTemplate(winner);
     }, 24 * 60 * 60 * 1000);
     ```

### File: `src/utils/apiClient.ts` (New File)

**Objective:** Utility for interacting with the e-card API.
**Context / Rationale:** Centralize API calls for templates, cards, and signatures.
**Steps:**

1. **Action:** Implement fetch functions for each endpoint.
   - **Goal:** Handle HTTP requests with retries.
   - **Pseudocode:**
     ```
     export const getTemplates = async (count) => {
       return await fetchWithRetry('/api/discord/templates/random?count=' + count);
     };
     ```
2. **Action:** Add error handling and rate limiting.
   - **Goal:** Robust API interactions.
   - **Pseudocode:**
     ```
     const fetchWithRetry = async (url, retries = 3) => {
       try { return await fetch(url); } catch { if (retries) return fetchWithRetry(url, retries - 1); }
     };
     ```

### File: `src/scheduler.ts` (New File)

**Objective:** Manage scheduled tasks like reminders and reveals.
**Context / Rationale:** Handle time-based events without blocking the main bot.
**Steps:**

1. **Action:** Use a library like node-cron for scheduling.
   - **Goal:** Execute tasks at specific times.
   - **Pseudocode:**
     ```
     export const scheduleReminder = (date, callback) => {
       cron.schedule(date, callback);
     };
     ```
2. **Action:** Implement reminder logic (3 days, 1 day before deadline).
   - **Goal:** Notify contributors.
   - **Pseudocode:**
     ```
     const reminder = () => channel.send('Reminder: Sign the card!');
     scheduleReminder(deadline.subtractDays(3), reminder);
     ```

### File: `src/utils/firestore.ts` (New File)

**Objective:** Database utilities for birthday storage and retrieval.
**Context / Rationale:** Abstract Firestore operations for reusability.
**Steps:**

1. **Action:** Functions to get/set birthdays.
   - **Goal:** CRUD operations.
   - **Pseudocode:**
     ```
     export const getBirthday = async (userId) => {
       const doc = await getDoc(doc(db, 'birthdays', userId));
       return doc.data()?.birthday;
     };
     ```

## 3. Testing Plan

- **Unit Tests:** Test individual functions (e.g., date validation, API calls) using Jest.
- **Integration Tests:** Simulate Discord interactions and API responses.
- **Manual Testing:** Deploy to a test server, test commands, scheduling, and reveals.
- **Edge Cases:** Test leap years, API failures, invalid inputs via retries and error messages.

## 4. User Intervention Required

- Set up Firebase project and provide config (API key, etc.).
- Confirm hosting platform (e.g., Heroku for Node.js apps).
- Test the e-card API endpoints once built.
- Provide Discord bot token and server ID for testing.
