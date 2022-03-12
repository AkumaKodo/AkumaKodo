import { AkumaKomoBot } from "../AkumaKodo.ts";

AkumaKomoBot.inhibitorCollection.set("nsfw", (message, command) => {
  // Returns false so the command can be executed if the command is not NSFW
  if (!command.nsfw) return false;

  // DMs are not channels, so we need to return true to cancel the command on dm events
  if (!message.guildId) return true;

  // check if channel is NSFW
  const channel = AkumaKomoBot.channels.get(message.channelId);

  if (channel) {
    return channel.nsfw;
  } else {
    return true;
  }
});