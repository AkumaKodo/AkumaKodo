import { AkumaKodoBot } from "../AkumaKodo.ts";
import {
  getMissingChannelPermissions,
  getMissingGuildPermissions,
} from "https://deno.land/x/discordeno_permissions_plugin@0.0.15/src/permissions.ts";

AkumaKodoBot.inhibitorCollection.set("userPermissions", (bot, command, options) => {
  if (command.dmOnly) return true;
  if (
    command.userGuildPermissions?.length &&
    (!options?.guildId ||
      !options.memberId ||
      getMissingGuildPermissions(
        AkumaKodoBot,
        options.guildId,
        options.memberId,
        command.userGuildPermissions,
      ).length)
  ) {
    return {
      channel: false,
      value: getMissingGuildPermissions(
        bot,
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
        bot,
        options.channelId,
        options.memberId,
        command.userChannelPermissions,
      ).length)
  ) {
    return {
      channel: true,
      value: getMissingGuildPermissions(
        bot,
        options!.guildId!,
        options!.memberId!,
        command.userChannelPermissions,
      ),
    };
  }
  return true;
});

AkumaKodoBot.inhibitorCollection.set("botPermissions", (bot, command, options) => {
  if (command.dmOnly) return true;
  if (
    command.botGuildPermissions?.length &&
    (!options?.guildId ||
      getMissingGuildPermissions(
        bot,
        options.guildId,
        bot.id,
        command.botGuildPermissions,
      ).length)
  ) {
    return {
      type: "BOT_MISSING_PERMISSIONS",
      channel: false,
      value: getMissingGuildPermissions(
        bot,
        options!.guildId!,
        bot.id,
        command.botGuildPermissions,
      ),
    };
  }
  if (
    command.botChannelPermissions?.length &&
    (!options?.channelId ||
      getMissingChannelPermissions(
        bot,
        options.channelId,
        bot.id,
        command.botChannelPermissions,
      ).length)
  ) {
    return {
      type: "BOT_MISSING_PERMISSIONS",
      channel: true,
      value: getMissingChannelPermissions(
        bot,
        options!.channelId!,
        bot.id,
        command.botChannelPermissions,
      ),
    };
  }
  return true;
});

AkumaKodoBot.inhibitorCollection.set("guildOrDmOnly", (bot, command, options) => {
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
