import { AkumaKomoBot } from "../AkumaKodo.ts";
import { getMissingChannelPermissions, getMissingGuildPermissions } from "../../../../deps.ts";

AkumaKomoBot.inhibitorCollection.set("userPermissions", (_message, command, options) => {
  if (command.dmOnly) return true;
  if (
    command.userGuildPermissions?.length &&
    (!options?.guildId ||
      !options.memberId ||
      getMissingGuildPermissions(
        AkumaKomoBot,
        options.guildId,
        options.memberId,
        command.userGuildPermissions,
      ).length)
  ) {
    return {
      channel: false,
      value: getMissingGuildPermissions(
        AkumaKomoBot,
        options!.guildId!,
        options!.memberId!,
        command.userGuildPermissions,
      ),
    };
  }
  if (
    command.userChannelPermissions?.length &&
    (!options?.memberId ||
      !options?.channelId ||
      getMissingChannelPermissions(
        AkumaKomoBot,
        options.channelId,
        options.memberId,
        command.userChannelPermissions,
      ).length)
  ) {
    return {
      channel: true,
      value: getMissingGuildPermissions(
        AkumaKomoBot,
        options!.guildId!,
        options!.memberId!,
        command.userChannelPermissions,
      ),
    };
  }
  return true;
});

AkumaKomoBot.inhibitorCollection.set("botPermissions", (_message, command, options) => {
  if (command.dmOnly) return true;
  if (
    command.botGuildPermissions?.length &&
    (!options?.guildId ||
      getMissingGuildPermissions(
        AkumaKomoBot,
        options.guildId,
        AkumaKomoBot.id,
        command.botGuildPermissions,
      ).length)
  ) {
    return {
      type: "BOT_MISSING_PERMISSIONS",
      channel: false,
      value: getMissingGuildPermissions(
        AkumaKomoBot,
        options!.guildId!,
        AkumaKomoBot.id,
        command.botGuildPermissions,
      ),
    };
  }
  if (
    command.botChannelPermissions?.length &&
    (!options?.channelId ||
      getMissingChannelPermissions(
        AkumaKomoBot,
        options.channelId,
        AkumaKomoBot.id,
        command.botChannelPermissions,
      ).length)
  ) {
    return {
      type: "BOT_MISSING_PERMISSIONS",
      channel: true,
      value: getMissingChannelPermissions(
        AkumaKomoBot,
        options!.channelId!,
        AkumaKomoBot.id,
        command.botChannelPermissions,
      ),
    };
  }
  return true;
});

AkumaKomoBot.inhibitorCollection.set("guildOrDmOnly", (_message, command, options) => {
  if (
    (!options?.guildId && command.guildOnly) ||
    (options?.guildId && command.dmOnly) ||
    (!options?.guildId && command.guildOnly) ||
    (options?.guildId && command.dmOnly)
  ) {
    return {
      type: command.guildOnly && !options?.guildId ? "GUILD ONLY" : "DM ONLY",
    };
  }
  return true;
});
