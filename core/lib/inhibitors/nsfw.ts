import { AkumaKodoBot } from "../AkumaKodo.ts";

AkumaKodoBot.inhibitorCollection.set("nsfw", (bot, command, options) => {
  // Returns false so the command can be executed if the command is not NSFW
  if (!command.nsfw) return false;

  // DMs are not channels, so we need to return true to cancel the command on dm events
  if (!options.guildId) return true;

  // check if channel is NSFW
  const channel = bot.channels.get(options.channelId);

  if (channel) {
    return channel.nsfw;
  } else {
    return true;
  }
});
