import { Client, GatewayIntentBits, REST, Routes, Events, Interaction } from 'discord.js';
import admin from 'firebase-admin';
import * as cron from 'node-cron';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const db = admin.firestore();

// Initialize Discord client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// Import command handlers (will be created later)
import { setBirthdayCommand } from './commands/setBirthday';
import { checkBirthdays } from './scheduler';

// Slash command definitions
const commands = [
  {
    name: 'set-birthday',
    description: 'Set a user\'s birthday',
    options: [
      {
        name: 'user',
        description: 'The user whose birthday to set',
        type: 6, // USER type
        required: true
      },
      {
        name: 'date',
        description: 'Birthday date in YYYY-MM-DD format',
        type: 3, // STRING type
        required: true
      }
    ]
  },
  {
    name: 'vote-templates',
    description: 'Start template voting for a birthday card'
  },
  {
    name: 'more-templates',
    description: 'Get more template options'
  },
  {
    name: 'sign-card',
    description: 'Get the signing link for the current card'
  },
  {
    name: 'who-signed',
    description: 'Check how many people have signed the card'
  }
];

// Event handlers
client.once(Events.ClientReady, async () => {
  console.log(`🎂 Bot is ready! Logged in as ${client.user?.tag}`);

  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(client.user!.id), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'set-birthday':
        await setBirthdayCommand.execute(interaction);
        break;
      default:
        await interaction.reply({ content: 'Command not implemented yet!', ephemeral: true });
    }
  } catch (error) {
    console.error('Error executing command:', error);
    const errorMessage = 'There was an error executing this command!';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

// Set up daily birthday check at midnight UTC
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily birthday check...');
  try {
    await checkBirthdays(client);
  } catch (error) {
    console.error('Error during birthday check:', error);
  }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('Failed to login to Discord:', error);
  process.exit(1);
});
