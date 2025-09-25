# 🎂 Group E-Card Discord Bot — Development Setup

## Overview

A Discord bot that helps communities celebrate birthdays with hype and collaboration. Contributors can pick or re-roll card templates, sign the card, and reveal it on the birthday — all inside Discord. The bot automates **timing**, starting template voting **two weeks before the recipient's birthday**.

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Discord Bot Token
- Firebase Project
- Git

### 1. Clone and Install

```bash
git clone <repository-url>
cd celebrate-this-mortal-discord-bot
npm install
```

### 2. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application and bot
3. Copy the bot token
4. Generate OAuth2 URL with scopes: `bot`, `applications.commands`
5. Required permissions: `Send Messages`, `Manage Channels`, `Manage Roles`, `Add Reactions`
6. Invite bot to your server

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Go to Project Settings → General → Your apps
5. Add a web app and copy the config object

### 4. Environment Configuration

**⚠️ Security Note:** Never commit your `.env` file with real credentials to version control. The repository includes `.env.example` as a template.

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here

# Firebase Admin Configuration (for server-side operations)
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id

# Firebase App Configuration (for client-side operations)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
FIREBASE_APP_ID=your_app_id_here
FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# E-Card API Configuration
ECARD_API_BASE_URL=https://celebratethismortal.com/api/discord

# Bot Configuration
CELEBRATION_CHANNEL_NAME=general
BIRTHDAY_ROLE_NAME=Birthday Star
```

### 5. Build and Run

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run production
npm start
```

## 🎮 Commands

### Admin Commands

- `/set-birthday @user YYYY-MM-DD` - Set a user's birthday
- `/set-celebration-channel #channel` - Configure reveal channel (not implemented yet)

### User Commands

- `/vote-templates` - Start template voting (not implemented yet)
- `/more-templates` - Get new template options (not implemented yet)
- `/sign-card` - Get signing link (not implemented yet)
- `/who-signed` - Check signature progress (not implemented yet)

## 🔧 Development

### Project Structure

```
src/
├── index.ts              # Main bot entry point
├── commands/
│   └── setBirthday.ts   # /set-birthday command
├── utils/
│   ├── apiClient.ts     # E-card API client
│   └── firestore.ts     # Database utilities
└── scheduler.ts         # Birthday checking & automation
```

### Key Features Implemented

- ✅ Birthday storage in Firestore
- ✅ Automatic channel creation (14 days before)
- ✅ Birthday reveals with role assignment
- ✅ `/set-birthday` command
- ⏳ Template voting system
- ⏳ Signature tracking
- ⏳ Reminder system

### Testing

1. Set up a test Discord server
2. Invite your bot
3. Create a "Birthday Star" role
4. Test with: `/set-birthday @user 2025-09-26` (adjust date as needed)
5. Check Firestore for stored data
6. Wait for automated channel creation (or modify date for immediate testing)

## 📝 Notes

- The bot checks for birthdays daily at midnight UTC
- Private channels exclude the birthday recipient automatically
- The e-card API endpoints need to be implemented on celebratethismortal.com
- All TypeScript compilation errors are expected until dependencies are installed

## 🔮 Next Steps

1. Install dependencies: `npm install`
2. Set up Firebase and Discord bot
3. Configure environment variables
4. Test the `/set-birthday` command
5. Implement remaining commands (template voting, etc.)
6. Build the e-card API endpoints

---

## Core Features

### 🎉 Card Creation & Coordination

1. **Birthday Setup**

   * Admin sets a user's birthday:

     ```
     /set-birthday @User YYYY-MM-DD
     ```

   * Bot stores the birthday internally.
   * Automatically schedules a **card event** to start **2 weeks before the birthday**.

2. **Private Coordination Channel**

   * Bot creates a temporary channel named `#username-birthday-card` visible to all contributors **except the recipient**.
   * Used for **template voting, discussion, and signing reminders**.
   * **Important:** This channel will be **deleted automatically** after the card is sent/revealed.
   * Channel permissions ensure only contributors can see and interact until reveal.

3. **Template Selection (Quick Poll)**

   * Bot posts **3–5 random card templates** in the channel.
   * Contributors vote via emoji reactions.
   * `/more-templates` → Rerolls another 3–5 templates.
   * Bot **locks in winner** automatically after 24 hours or when majority reacts.

---

### ✍️ Signing Phase

* Bot posts a **signing link** to your e-card site with a **unique `cardId`**:

  ```
  ✍️ Sign Alex's card here → [ecard link]
  Deadline: YYYY-MM-DD 23:59
  ```

* Bot tracks **signature count** by polling your API:

  ```
  GET /api/card-signatures?cardId=abc123
  Response: { "cardId": "abc123", "totalSignatures": 7 }
  ```

* Contributors can see progress with `/who-signed`:

  ```
  ✨ 7 people have signed so far!
  ```

* Optional reminders sent 3 days and 1 day before the deadline.

---

### 🎂 Reveal Phase

* On the birthday (midnight server time):

  * Bot posts the finished card in the **public celebration channel**:

    ```
    🎉 SURPRISE @Alex! 🎉
    Your friends picked the 🌸 Sakura card and signed it: [ecard link]
    🎂 Happy Birthday!!!
    ```

  * Assigns a temporary **Birthday Star role** to the recipient for 24 hours.
  * Deletes the private coordination channel automatically.

---

## Discord Command Set

### User Commands

* `/vote-templates` → Bot posts 3–5 template options.
* `/more-templates` → Rerolls template options.
* `/sign-card` → Provides the signing link.
* `/who-signed` → Shows real-time signing progress.
* `/when-deadline` → Shows signing deadline.

### Admin Commands

* `/set-birthday @User YYYY-MM-DD` → Registers birthday and schedules card event.
* `/lock-template` → Force a template lock-in.
* `/set-celebration-channel #channel` → Configures reveal channel.
* `/end-card` → Cancels an in-progress card.
* `/preview-card` → Shows a teaser/blurred preview.

---

## Scheduling & Automation

* Bot runs a **daily check** for birthdays **14 days away**.
* Automatically:

  1. Creates the private coordination channel.
  2. Posts the initial **template poll**.
  3. Schedules automatic template lock-in and reminders.
* Timing for reminders and reveal is configurable by admins.

---

## Future Spec (Not in MVP)

* CSV/Google Sheet import of birthdays.
* AI-powered parsing for messy inputs.
* Custom card uploads and advanced voting.
* Gift threads or polls for additional celebrations.
