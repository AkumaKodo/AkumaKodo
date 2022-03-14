import { AkumaKodoBot, initializeTask } from "../AkumaKodo.ts";
import { AkumaKodoLogger } from "../../../internal/logger.ts";
import { delay } from "../../../internal/utils.ts";
import { EditGlobalApplicationCommand, MakeRequired } from "../../../deps.ts";
import { SlashSubcommandGroup } from "../../interfaces/Command.ts";
import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";

AkumaKodoBot.events.ready = async (bot, payload) => {
  await delay(1000);

  const Bot = bot as AkumaKodoBotInterface;

  // Wait until the bot shards are ready before running startup functions
  if (payload.shardId + 1 === Bot.ws.maxShards) {
    initializeTask(Bot);

    const globalCommands: MakeRequired<EditGlobalApplicationCommand, "name">[] = [];
    const perGuildCommands: MakeRequired<
      EditGlobalApplicationCommand,
      "name"
    >[] = [];

    for (const command of Bot.slashCommands.values()) {
      const slashCmd = {
        name: command.name,
        type: command.type,
        description: command.type === undefined || command.type == 1 ? command.description : undefined,
        options: command.type == 1 || command.type === undefined
          ? [
            ...(command.options || []),
            ...(command.subcommands?.map((sub) =>
              sub.SubcommandType == "subcommand"
                ? {
                  name: command.name,
                  description: sub.description!,
                  options: command.options,
                  type: 1,
                }
                : {
                  name: command.name,
                  description: sub.description!,
                  options: (sub as SlashSubcommandGroup).subcommands!.map(
                    (sub) => {
                      return {
                        name: sub.name,
                        description: sub.description!,
                        options: sub.options,
                        type: 1,
                      };
                    },
                  ),
                  type: 2,
                }
            ) || []),
          ]
          : undefined,
      };

      if (!command.scope || command.scope === "Global") {
        globalCommands.push(slashCmd);
      } else if (command.scope === "Guild") perGuildCommands.push(slashCmd);
    }

    await bot.helpers.upsertApplicationCommands(globalCommands);

    perGuildCommands
      .filter((e) => {
        const command = AkumaKodoBot.slashCommands.get(e.name);
        return Boolean(command?.scope == "Guild" && command?.guildIds?.length);
      })
      .forEach((cmd) => {
        const command = AkumaKodoBot.slashCommands.get(cmd.name);
        if (!command || command.scope !== "Guild") return;
        command.guildIds?.forEach(async (guildId) => {
          await AkumaKodoBot.helpers.upsertApplicationCommands([cmd], guildId);
        });
      });

    // Push slash commands to each guild
    for (const guildId of payload.guilds) {
      await Bot.helpers.upsertApplicationCommands(
        perGuildCommands.filter((e) => {
          const command = Bot.slashCommands.get(e.name);
          return command?.scope == "Guild" && !command.guildIds?.length;
        }),
        guildId,
      );
    }

    Bot.fullyReady = true;

    AkumaKodoLogger("info", "EVENT READY", "AkumaKodo Framework is ready and online!");
  }
};
