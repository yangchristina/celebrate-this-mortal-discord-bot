import { Client, ChannelType, PermissionFlagsBits, TextChannel } from 'discord.js';
import { getUpcomingBirthdays, getBirthdaysForDate } from './utils/firestore';
import { findBirthdayChannel, updateChannelForUsernameChange } from './utils/channelUtils';

/**
 * Check for birthdays that need card coordination to start (14 days ahead)
 */
export async function checkBirthdays(client: Client) {
  try {
    const upcomingBirthdays = await getUpcomingBirthdays(14);

    if (upcomingBirthdays.length === 0) {
      console.log('No birthdays found for 14 days from now');
      return;
    }

    console.log(`Found ${upcomingBirthdays.length} upcoming birthdays`);

    for (const birthday of upcomingBirthdays) {
      try {
        await startBirthdayCardCoordination(client, birthday.userId);
      } catch (error) {
        console.error(`Error starting coordination for user ${birthday.userId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in checkBirthdays:', error);
  }
}

/**
 * Start card coordination for a specific user's birthday
 */
async function startBirthdayCardCoordination(client: Client, userId: string) {
  // Get all guilds the bot is in
  const guilds = client.guilds.cache;

  for (const [guildId, guild] of guilds) {
    try {
      // Check if the user is in this guild
      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) {
        continue; // User not in this guild
      }

      const channelName = `${member.user.username}-birthday-card`;

      // Check if channel already exists using robust search
      const existingChannel = findBirthdayChannel(guild, userId, member.user.username);

      if (existingChannel) {
        console.log(`Channel ${existingChannel.name} already exists in guild ${guild.name}`);
        // Update channel if username has changed
        await updateChannelForUsernameChange(existingChannel, userId, member.user.username);
        continue;
      }

      // Create private coordination channel
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: `🎂 Birthday card for user ID: ${userId} (${member.user.username}) - DO NOT invite them to this channel!`,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          {
            id: userId, // Birthday person
            deny: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      // Send initial message in the channel
      await channel.send({
        content: `🎉 **Birthday Card Coordination Started!**\n\n` +
                `We're planning a surprise birthday card for **${member.user.displayName}**!\n` +
                `🗓️ Their birthday is in **14 days**.\n\n` +
                `**What happens next:**\n` +
                `1. 🎨 Use \`/vote-templates\` to see template options\n` +
                `2. 🗳️ Vote with emoji reactions on your favorite\n` +
                `3. ✍️ Sign the card when the link is shared\n` +
                `4. 🎂 Card will be revealed on their birthday!\n\n` +
                `**Important:** Keep this channel secret from **${member.user.displayName}**! 🤫\n` +
                `This channel will be automatically deleted after the card is revealed.`
      });

      console.log(`Created birthday coordination channel: ${channelName} in guild ${guild.name}`);

    } catch (error) {
      console.error(`Error creating channel in guild ${guild.name}:`, error);
    }
  }
}

/**
 * Check for birthdays happening today and reveal cards
 */
export async function checkBirthdayReveals(client: Client) {
  try {
    const today = new Date();
    const todaysBirthdays = await getBirthdaysForDate(today);

    if (todaysBirthdays.length === 0) {
      console.log('No birthdays to reveal today');
      return;
    }

    console.log(`Found ${todaysBirthdays.length} birthdays to reveal today`);

    for (const birthday of todaysBirthdays) {
      try {
        await revealBirthdayCard(client, birthday.userId);
      } catch (error) {
        console.error(`Error revealing card for user ${birthday.userId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in checkBirthdayReveals:', error);
  }
}

/**
 * Reveal the birthday card and clean up
 */
async function revealBirthdayCard(client: Client, userId: string) {
  const guilds = client.guilds.cache;

  for (const [guildId, guild] of guilds) {
    try {
      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) {
        continue;
      }

      const coordinationChannel = findBirthdayChannel(guild, userId, member.user.username);

      // Find the celebration channel (could be 'general' or configured)
      const celebrationChannelName = process.env.CELEBRATION_CHANNEL_NAME || 'general';
      const celebrationChannel = guild.channels.cache.find(
        (channel): channel is TextChannel => channel.name === celebrationChannelName && channel.type === ChannelType.GuildText
      );

      if (celebrationChannel) {
        // TODO: Get actual card data from API and post the reveal
        // For now, post a placeholder message
        await celebrationChannel.send({
          content: `🎉 **SURPRISE <@${userId}>!** 🎉\n\n` +
                  `🎂 **Happy Birthday!!!** 🎂\n\n` +
                  `Your friends have been secretly working on a special birthday card for you!\n` +
                  `[View your birthday card here](https://celebratethismortal.com/card/placeholder)\n\n` +
                  `Hope your day is absolutely wonderful! 🌟`
        });

        // Assign Birthday Star role if it exists
        const birthdayRoleName = process.env.BIRTHDAY_ROLE_NAME || 'Birthday Star';
        const birthdayRole = guild.roles.cache.find((role) => role.name === birthdayRoleName);

        if (birthdayRole) {
          await member.roles.add(birthdayRole);
          console.log(`Added ${birthdayRoleName} role to ${member.user.username}`);

          // Schedule role removal after 24 hours
          setTimeout(async () => {
            try {
              await member.roles.remove(birthdayRole);
              console.log(`Removed ${birthdayRoleName} role from ${member.user.username}`);
            } catch (error) {
              console.error(`Error removing birthday role:`, error);
            }
          }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
        }
      }

      // Delete the coordination channel
      if (coordinationChannel && coordinationChannel.isTextBased()) {
        await coordinationChannel.delete('Birthday card revealed - cleaning up coordination channel');
        console.log(`Deleted coordination channel: ${coordinationChannel.name}`);
      }

    } catch (error) {
      console.error(`Error revealing birthday in guild ${guild.name}:`, error);
    }
  }
}
