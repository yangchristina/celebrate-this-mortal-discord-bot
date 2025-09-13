import { ChatInputCommandInteraction, User } from 'discord.js';
import { setBirthday, isValidBirthday, getBirthday } from '../utils/firestore';

export const setBirthdayCommand = {
  name: 'set-birthday',

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Extract options from the interaction
      const user = interaction.options.getUser('user', true);
      const dateString = interaction.options.getString('date', true).trim();

      console.log(`Received date string: "${dateString}" (type: ${typeof dateString})`);

      // Validate the date format
      if (!isValidBirthday(dateString)) {
        console.log(`Date validation failed for: "${dateString}"`);
        await interaction.reply({
          content: `❌ Invalid date format! Please use MM-DD format (e.g., 12-25 for December 25th).\nReceived: "${dateString}"`,
          ephemeral: true
        });
        return;
      }

      // Check if user is trying to set their own birthday
      if (user.id === interaction.user.id) {
        await interaction.reply({
          content: '❌ You cannot set your own birthday! Ask an admin to do it for you.',
          ephemeral: true
        });
        return;
      }

      // TODO: Add admin permission check
      // For now, allow anyone to set birthdays for testing

      // Check if birthday already exists
      const existingBirthday = await getBirthday(user.id);
      if (existingBirthday) {
        await interaction.reply({
          content: `⚠️ **${user.displayName} already has a birthday set: ${existingBirthday}**\n\n` +
                  `Would you like to update it to ${dateString}? React with ✅ to confirm.`,
          ephemeral: true
        });
        // TODO: Add reaction-based confirmation for updates
        return;
      }

      // Store the birthday in Firestore
      await setBirthday(user.id, dateString);

      // Calculate when the card event will start (14 days before)
      // For MM-DD format, we'll use the current year or next year if the date has passed
      const [month, day] = dateString.split('-').map(num => parseInt(num, 10));
      const currentYear = new Date().getFullYear();
      const birthdayThisYear = new Date(currentYear, month - 1, day); // month is 0-indexed
      const today = new Date();

      // If the birthday has already passed this year, use next year
      const birthdayDate = birthdayThisYear < today
        ? new Date(currentYear + 1, month - 1, day)
        : birthdayThisYear;

      const eventStartDate = new Date(birthdayDate);
      eventStartDate.setDate(birthdayDate.getDate() - 14);

      // Format dates for display (without year for birthday)
      const birthdayFormatted = birthdayDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      });

      const eventStartFormatted = eventStartDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await interaction.reply({
        content: `🎂 **Birthday set for ${user.displayName}!**\n` +
                `📅 Birthday: ${birthdayFormatted}\n` +
                `🎉 Card coordination will start on: ${eventStartFormatted}\n\n` +
                `*The bot will automatically create a private channel and start template voting 2 weeks before the birthday.*`,
        ephemeral: false
      });

      console.log(`Birthday set for user ${user.id} (${user.username}): ${dateString}`);

    } catch (error) {
      console.error('Error in setBirthday command:', error);

      await interaction.reply({
        content: '❌ An error occurred while setting the birthday. Please try again later.',
        ephemeral: true
      });
    }
  }
};
