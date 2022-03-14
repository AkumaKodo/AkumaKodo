import { AkumaKodoBot } from "../AkumaKodo.ts";

AkumaKodoBot.inhibitorCollection.set("hasRole", (bot, command, options) => {
  if (command.dmOnly || !command.hasRoles?.length || !options?.guildId) {
    return true;
  }
  if (!options?.memberId) {
    return { type: "missing required roles", value: command.hasRoles };
  }
  const member = AkumaKodoBot.members.get(
    bot.transformers.snowflake(`${options.memberId}${options.guildId}`),
  );
  if (command.hasRoles?.some((e) => !member?.roles.includes(e))) {
    return {
      type: "missing required roles",
      value: command.hasRoles?.filter((e) => !member?.roles.includes(e)),
    };
  }
  return true;
});
