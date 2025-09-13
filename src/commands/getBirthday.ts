import { ChatInputCommandInteraction } from 'discord.js';
import { getBirthday } from '../utils/firestore';

export const getBirthdayCommand = {
  name: 'get-birthday',

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Extract user from the interaction
      const user = interaction.options.getUser('user', true);

      // Get the birthday from Firestore
      const birthday = await getBirthday(user.id);

      if (!birthday) {
        await interaction.reply({
          content: `🤷‍♀️ **${user.displayName} doesn't have a birthday set yet.**\n\n` +
                  `Use \`/set-birthday @${user.username} MM-DD\` to set it!`,
          ephemeral: true
        });
        return;
      }

      // Parse the MM-DD format for display
      const [month, day] = birthday.split('-').map(num => parseInt(num, 10));
      const currentYear = new Date().getFullYear();
      const birthdayDate = new Date(currentYear, month - 1, day);

      const birthdayFormatted = birthdayDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      });

      await interaction.reply({
        content: `🎂 **${user.displayName}'s Birthday: ${birthdayFormatted}**\n` +
                `📅 Date: ${birthday}\n\n` +
                `*The bot will automatically start card coordination 2 weeks before their birthday.*`,
        ephemeral: true
      });

      console.log(`Retrieved birthday for user ${user.id} (${user.username}): ${birthday}`);

    } catch (error) {
      console.error('Error in getBirthday command:', error);

      await interaction.reply({
        content: '❌ An error occurred while retrieving the birthday. Please try again later.',
        ephemeral: true
      });
    }
  }
};
