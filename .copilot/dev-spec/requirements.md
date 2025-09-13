# Requirements for dev-spec

## 1. Business Objective

To develop a Discord bot that helps communities celebrate birthdays with hype and collaboration, automating the process of creating and revealing e-cards for birthdays. The bot will handle scheduling, template voting, signing coordination, and public reveals, as outlined in the product spec.

## 2. Technical Specification

Implement the Discord bot in TypeScript using a suitable Discord library (e.g., discord.js). The bot will:

- Store user birthdays and schedule events 14 days in advance.
- Create temporary private channels for coordination.
- Post template polls with emoji reactions.
- Track signatures via API polling.
- Send reminders and reveal the card on the birthday.
- Manage roles and channel deletions.

Key integrations: Discord API for bot interactions, external e-card site API for signatures and card generation.

## 3. Q&A (Requirements Gathering)

1. Q: Which Discord library should we use for TypeScript? (e.g., discord.js, discord.py is not suitable)
   A: discord.js
2. Q: What are the details of the e-card site API? Endpoints for creating cards, getting signatures, etc.
   A: Based on the bot's needs, the following endpoints are required on celebratethismortal.com/api/discord/**. All endpoints should use JSON for requests/responses and are public for now (no authentication required).

   - GET /api/discord/templates/random?count=5
     Purpose: Fetch random card templates for voting.
     Response: [{ "id": "template1", "name": "Sakura", "previewUrl": "https://..." }, ...]

   - POST /api/discord/cards
     Purpose: Create a new e-card and get signing link.
     Body: { "templateId": "template1", "recipient": "username", "contributors": ["user1"], "deadline": "YYYY-MM-DD" }
     Response: { "cardId": "abc123", "signingUrl": "https://celebratethismortal.com/sign/abc123" }

   - GET /api/discord/cards/{cardId}/signatures
     Purpose: Get signature count.
     Response: { "cardId": "abc123", "totalSignatures": 7 }

   - GET /api/discord/cards/{cardId}
     Purpose: Get final card details for reveal.
     Response: { "cardId": "abc123", "revealUrl": "https://celebratethismortal.com/card/abc123", "templateName": "Sakura" }

   Additional: Handle errors with HTTP codes and rate limits.
3. Q: How should we store user birthdays? Database? (e.g., SQLite, MongoDB)
   A: Use Firebase Firestore (a NoSQL cloud database). It's managed, has a generous free tier, integrates easily with TypeScript/Node.js, and requires no server management. Store birthdays as simple documents (e.g., userId as key, birthday as field). Alternatives: Supabase (PostgreSQL) or MongoDB Atlas if you prefer SQL/NoSQL.
4. Q: What is the server time zone for birthday calculations?
   A: UTC. If you can get the discord server's time zone, that would be ideal. Otherwise at UTC midnight.
5. Q: Are there any specific security measures needed for the private channels and data handling?
   A: - Ensure private channels exclude the birthday recipient.
   - Validate all user inputs (e.g., birthday format, user mentions).
6. Q: How to handle errors, like API failures or invalid inputs?
   A: - Implement retries with exponential backoff for API calls.
   - Reply to users with clear error messages for invalid commands.

## 4. System Analysis

- **Impact Analysis:** This will introduce a new bot to the Discord server, affecting channel management, user roles, and message posting. No existing systems are mentioned, so it's a new implementation.
- **Security Concerns:** Ensure private channels have proper permissions to exclude recipients. Validate inputs for birthdays and user mentions. Protect API keys and user data.
- **Performance Concerns:** Daily checks for birthdays, API polling for signatures, handling multiple concurrent cards. Optimize for low latency in Discord interactions.
- **Risk Analysis:** Risks include Discord API rate limits, changes in API, data loss if storage fails, user privacy breaches.

## 5. Edge Cases

- Birthday on Feb 29: Handle leap years.
- User leaves server before reveal: Cancel or handle gracefully.
- No votes on templates: Default to first or random.
- API down: Retry or notify admins.
- Multiple birthdays on same day: Handle sequentially.
- Invalid birthday date: Validate and reject.

## 6. User Intervention Required

- Answer the Q&A questions above.
- Provide access to the e-card site API documentation.
- Confirm the choice of database and hosting environment.
