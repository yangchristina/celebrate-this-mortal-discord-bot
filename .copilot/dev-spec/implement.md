# Implementation Checklist for dev-spec

### File: `package.json` (New File)
- [ ] Create `package.json` with dependencies: `discord.js`, `firebase`, `node-cron`, `dotenv`.
- [ ] Add scripts: `"start": "node dist/index.js"`, `"build": "tsc"`, `"dev": "ts-node src/index.ts"`.

### File: `tsconfig.json` (New File)
- [ ] Create `tsconfig.json` with TypeScript config for Node.js (target ES2020, module commonjs, outDir dist).

### File: `src/index.ts` (New File)
- [ ] Create the file with basic structure.
- [ ] **Line 1-10:** Import required modules (`discord.js`, `firebase/app`, `firebase/firestore`, `node-cron`).
- [ ] **Line 11-20:** Load environment variables (DISCORD_TOKEN, FIREBASE_CONFIG).
- [ ] **Line 21-30:** Initialize Discord client with intents (Guilds, GuildMessages, MessageContent, GuildMessageReactions).
- [ ] **Line 31-40:** Initialize Firebase app and Firestore.
- [ ] **Line 41-50:** Define event handlers for `ready`, `interactionCreate`.
- [ ] **Line 51-60:** Register slash commands on startup.
- [ ] **Line 61-70:** Set up cron job for daily birthday check at UTC midnight.
- [ ] **Line 71-80:** Login to Discord and handle errors.

### File: `src/commands/setBirthday.ts` (New File)
- [ ] Create the file.
- [ ] **Line 1-10:** Import Firestore functions and Discord types.
- [ ] **Line 11-20:** Export async function `execute(interaction)`.
- [ ] **Line 21-30:** Extract user and date from interaction options.
- [ ] **Line 31-40:** Validate date format (YYYY-MM-DD) and check if valid date.
- [ ] **Line 41-50:** Store birthday in Firestore collection 'birthdays' with userId as doc ID.
- [ ] **Line 51-60:** Calculate event date (14 days before birthday) and schedule channel creation.
- [ ] **Line 61-70:** Reply with success message or error.

### File: `src/commands/voteTemplates.ts` (New File)
- [ ] Create the file.
- [ ] **Line 1-10:** Import API client and Discord types.
- [ ] **Line 11-20:** Export async function `execute(interaction)`.
- [ ] **Line 21-30:** Fetch random templates from API (count=5).
- [ ] **Line 31-40:** Create embed with template previews and emoji options.
- [ ] **Line 41-50:** Send message in channel and react with emojis.
- [ ] **Line 51-60:** Set timeout for 24 hours to count reactions and lock winner.
- [ ] **Line 61-70:** Handle /more-templates by rerolling templates.

### File: `src/utils/apiClient.ts` (New File)
- [ ] Create the file.
- [ ] **Line 1-10:** Import fetch or axios for HTTP requests.
- [ ] **Line 11-20:** Define base URL for celebratethismortal.com/api/discord.
- [ ] **Line 21-30:** Implement `getTemplates(count)` with fetch and JSON parse.
- [ ] **Line 31-40:** Implement `createCard(data)` POST request.
- [ ] **Line 41-50:** Implement `getSignatures(cardId)` GET request.
- [ ] **Line 51-60:** Implement `getCard(cardId)` GET request.
- [ ] **Line 61-70:** Add `fetchWithRetry` function with exponential backoff (up to 3 retries).
- [ ] **Line 71-80:** Handle HTTP errors and return parsed JSON or throw.

### File: `src/scheduler.ts` (New File)
- [ ] Create the file.
- [ ] **Line 1-10:** Import node-cron and Discord client.
- [ ] **Line 11-20:** Export `scheduleEvent(date, callback)` using cron.schedule.
- [ ] **Line 21-30:** Export `checkBirthdays()` to query Firestore for upcoming birthdays (14 days out).
- [ ] **Line 31-40:** For each birthday, create private channel and post template poll.
- [ ] **Line 41-50:** Schedule reminders at 3 days and 1 day before deadline.
- [ ] **Line 51-60:** Schedule reveal at birthday midnight UTC.

### File: `src/utils/firestore.ts` (New File)
- [ ] Create the file.
- [ ] **Line 1-10:** Import Firestore functions.
- [ ] **Line 11-20:** Export `getBirthday(userId)` to fetch doc from 'birthdays'.
- [ ] **Line 21-30:** Export `setBirthday(userId, date)` to set doc.
- [ ] **Line 31-40:** Export `getUpcomingBirthdays(daysAhead)` to query docs with birthday in range.
- [ ] **Line 41-50:** Handle Firestore errors and return null or throw.

### File: `src/commands/signCard.ts` (New File) - Additional for /sign-card
- [ ] Create the file.
- [ ] **Line 1-10:** Export async function to provide signing link from card data.
- [ ] **Line 11-20:** Reply with the signing URL.

### File: `src/commands/whoSigned.ts` (New File) - Additional for /who-signed
- [ ] Create the file.
- [ ] **Line 1-10:** Poll API for signature count.
- [ ] **Line 11-20:** Reply with current count.

### File: `.env` (New File)
- [ ] Create `.env` file with placeholders for DISCORD_TOKEN, FIREBASE_API_KEY, etc.

### File: `README.md` (Update Existing)
- [ ] Add setup instructions for Firebase, Discord bot creation, and environment variables.
- [ ] Document commands and deployment steps.
