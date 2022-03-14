import { AkumaKodoBot } from "../AkumaKodo.ts";

AkumaKodoBot.inhibitorCollection.set("ownerOnly", (bot, command, options) => {
  if (
    command.ownerOnly &&
    (!options?.memberId || !bot.container.bot_owners_ids?.includes(options.memberId))
  ) {
    return { type: "ownerOnly" };
  }
  return true;
});
