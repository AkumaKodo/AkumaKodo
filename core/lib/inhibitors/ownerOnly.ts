import { AkumaKodoBot } from "../AkumaKodo.ts";

AkumaKodoBot.inhibitorCollection.set("ownerOnly", (command, options) => {
  if (
    command.ownerOnly &&
    (!options?.memberId || !AkumaKodoBot.container.bot_owners_ids?.includes(options.memberId))
  ) {
    return { type: "ownerOnly" };
  }
  return true;
});
