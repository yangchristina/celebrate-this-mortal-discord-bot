import { ChatInputCommandInteraction, User } from 'discord.js';
import { setBirthday, isValidBirthday } from '../utils/firestore';

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
          content: `❌ Invalid date format! Please use YYYY-MM-DD format (e.g., 2000-12-25).\nReceived: "${dateString}"`,
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

      // Store the birthday in Firestore
      await setBirthday(user.id, dateString);

      // Calculate when the card event will start (14 days before)
      const birthdayDate = new Date(dateString);
      const eventStartDate = new Date(birthdayDate);
      eventStartDate.setDate(birthdayDate.getDate() - 14);

      // Format dates for display
      const birthdayFormatted = birthdayDate.toLocaleDateString('en-US', {
        year: 'numeric',
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
