import { AkumaKomoBot } from "../AkumaKodo.ts";

AkumaKomoBot.inhibitorCollection.set("ownerOnly", (message, command, options) => {
  if (
    command.ownerOnly &&
    (!options?.memberId || !AkumaKomoBot.container.bot_owners_ids?.includes(options.memberId))
  ) {
    return { type: "ownerOnly" };
  }
  return true;
});
