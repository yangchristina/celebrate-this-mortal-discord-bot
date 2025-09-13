import { Guild, TextChannel, ChannelType } from 'discord.js';

/**
 * Find a birthday coordination channel for a user, handling username changes
 */
export function findBirthdayChannel(guild: Guild, userId: string, currentUsername?: string): TextChannel | null {
  const channel = guild.channels.cache.find((channel) => {
    if (channel.type !== ChannelType.GuildText) return false;
    const textChannel = channel as TextChannel;

    // Primary: Check by user ID in topic (most reliable)
    if (textChannel.topic?.includes(`Birthday card for user ID: ${userId}`)) {
      return true;
    }

    // Secondary: Check by current username (for new channels or updated ones)
    if (currentUsername && channel.name === `${currentUsername}-birthday-card`) {
      return true;
    }

    // Fallback: Check if it's a birthday card channel and try to match pattern
    if (channel.name.endsWith('-birthday-card')) {
      return true; // We'll verify this is the right user via the topic update
    }

    return false;
  }) as TextChannel;

  return channel || null;
}

/**
 * Update channel name and topic if username has changed
 */
export async function updateChannelForUsernameChange(
  channel: TextChannel,
  userId: string,
  newUsername: string
): Promise<void> {
  try {
    const expectedName = `${newUsername}-birthday-card`;
    const expectedTopic = `🎂 Birthday card for user ID: ${userId} (${newUsername}) - DO NOT invite them to this channel!`;

    // Update name if username has changed
    if (channel.name !== expectedName) {
      await channel.setName(expectedName, `Updated for username change to ${newUsername}`);
      console.log(`Updated channel name from ${channel.name} to ${expectedName}`);
    }

    // Always update topic to ensure user ID is stored
    if (channel.topic !== expectedTopic) {
      await channel.setTopic(expectedTopic, `Updated topic with user ID for ${newUsername}`);
      console.log(`Updated channel topic for user ${userId} (${newUsername})`);
    }
  } catch (error) {
    console.error(`Error updating channel for username change:`, error);
  }
}

/**
 * Clean up orphaned birthday channels (channels with old usernames that can't be matched)
 */
export async function cleanupOrphanedChannels(guild: Guild): Promise<void> {
  try {
    const birthdayChannels = guild.channels.cache.filter(channel => {
      return channel.type === ChannelType.GuildText &&
             (channel.name.includes('birthday-card') ||
              channel.topic?.includes('Birthday card for user ID:'));
    });

    for (const [channelId, channel] of birthdayChannels) {
      const textChannel = channel as TextChannel;

      // Check if this is an orphaned channel (no valid user ID in topic)
      if (textChannel.topic?.includes('Birthday card for user ID:')) {
        const userIdMatch = textChannel.topic.match(/Birthday card for user ID: (\d+)/);
        if (userIdMatch) {
          const userId = userIdMatch[1];
          try {
            // Try to fetch the user to see if they still exist in the guild
            await guild.members.fetch(userId);
            // User exists, channel is valid
            continue;
          } catch {
            // User no longer in guild, mark for potential cleanup
            console.log(`Found orphaned channel ${textChannel.name} for user ${userId} who left the guild`);
            // You could delete it here or mark it for manual review
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during orphaned channel cleanup:', error);
  }
}
