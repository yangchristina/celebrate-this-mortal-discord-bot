#!/usr/bin/env node

/**
 * Local test script for the scheduler
 * Run this to test your scheduler before pushing to GitHub Actions
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testScheduler() {
  console.log('🧪 Testing scheduler locally...\n');

  // Check environment variables
  const requiredEnvVars = [
    'DISCORD_TOKEN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];

  console.log('📋 Checking environment variables:');
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${envVar === 'DISCORD_TOKEN' ? '***' : value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${envVar}: MISSING`);
      process.exit(1);
    }
  }

  console.log('\n🚀 Running scheduler test...');

  try {
    // Import and run the external scheduler
    const { runScheduler } = await import('./external-scheduler');
    await runScheduler();

    console.log('\n✅ Scheduler test completed successfully!');
    console.log('🎯 Ready to push to GitHub Actions!');

  } catch (error) {
    console.error('\n❌ Scheduler test failed:', error);
    console.log('\n🔧 Fix the issues above before pushing to GitHub Actions.');
    process.exit(1);
  }
}

// Run the test
testScheduler();
