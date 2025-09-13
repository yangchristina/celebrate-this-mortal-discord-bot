#!/usr/bin/env node

/**
 * Standalone scheduler script for external cron jobs
 * Can be called by GitHub Actions, AWS Lambda, Google Cloud Functions, etc.
 */

import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function initializeServices() {
  // Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  // Initialize Discord client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions
    ]
  });

  await client.login(process.env.DISCORD_TOKEN);
  return client;
}

export async function runScheduler() {
  console.log(`🕐 Starting birthday scheduler at ${new Date().toISOString()}`);

  try {
    const client = await initializeServices();

    // Import scheduler functions
    const { checkBirthdays, checkBirthdayReveals, processScheduledEvents } =
      await import('./scheduler');

    // Get the task type from command line argument
    const taskType = process.argv[2] || 'daily';

    switch (taskType) {
      case 'daily':
        console.log('🎂 Running daily birthday check (14 days ahead)...');
        await checkBirthdays(client);
        break;

      case 'hourly':
        console.log('⏰ Running hourly scheduled events check...');
        await processScheduledEvents(client);
        break;

      case 'reveals':
        console.log('🎉 Checking for birthday reveals...');
        await checkBirthdayReveals(client);
        break;

      case 'all':
        console.log('🔄 Running all scheduler tasks...');
        await checkBirthdays(client);
        await processScheduledEvents(client);
        await checkBirthdayReveals(client);
        break;

      default:
        console.error(`❌ Unknown task type: ${taskType}`);
        console.log('Available tasks: daily, hourly, reveals, all');
        process.exit(1);
    }

    await client.destroy();
    console.log(`✅ Scheduler completed successfully at ${new Date().toISOString()}`);

  } catch (error) {
    console.error('❌ Scheduler failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runScheduler();
}
