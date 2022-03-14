import { ParentCommand } from "../../interfaces/Command.ts";
import { AkumaKodoBot } from "../AkumaKodo.ts";
import { DiscordenoMessage } from "https://deno.land/x/discordeno@13.0.0-rc18/src/transformers/message.ts";
import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";

/**
 * Creates a new inhibitor in the collection.
 * @param bot
 * @param name The name of the inhibitor.
 * @param inhibitor configuration options for the inhibitor.
 */
export function createInhibitor(
  name: string,
  inhibitor: <T extends ParentCommand = ParentCommand>(
    bot: AkumaKodoBotInterface,
    command: T,
    options?: { memberId?: bigint; guildId?: bigint; channelId: bigint },
  ) => true | Error,
) {
  AkumaKodoBot.inhibitorCollection.set(name, inhibitor);
}

/**
 * Deletes an inhibitor from the inhibitor collection
 * @param name inhibitor name to delete
 */
export function destroyInhibitor(name: string): void {
  AkumaKodoBot.inhibitorCollection.delete(name);
}
