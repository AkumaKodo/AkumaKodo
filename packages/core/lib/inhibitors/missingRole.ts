import { AkumaKomoBot } from "../AkumaKodo.ts";

AkumaKomoBot.inhibitorCollection.set("hasRole", (message, command, options) => {
  if (command.dmOnly || !command.hasRoles?.length || !options?.guildId) {
    return true;
  }
  if (!options?.memberId) {
    return { type: "missing required roles", value: command.hasRoles };
  }
  const member = AkumaKomoBot.members.get(
    AkumaKomoBot.transformers.snowflake(`${options.memberId}${options.guildId}`),
  );
  if (command.hasRoles?.some((e) => !member?.roles.includes(e))) {
    return {
      type: "missing required roles",
      value: command.hasRoles?.filter((e) => !member?.roles.includes(e)),
    };
  }
  return true;
});
