import { AkumaKodoBot } from "../AkumaKodo.ts";
import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";
import { SlashSubcommandGroup } from "../../interfaces/Command.ts";

AkumaKodoBot.events.guildCreate = (_, guild) => {
  const bot = _ as AkumaKodoBotInterface;
  bot.slashCommands
    .filter((cmd) => cmd.scope === "Guild" && !cmd.guildIds?.length)
    .forEach(async (cmd) => {
      await bot.helpers.upsertApplicationCommands(
        [
          {
            name: cmd.name,
            type: cmd.type,
            description: cmd.type == 1 || cmd.type === undefined ? cmd.description : undefined,
            options: cmd.type == 1 || cmd.type === undefined
              ? [
                ...(cmd.options || []),
                ...(cmd.subcommands?.map((sub) =>
                  sub.SubcommandType == "subcommand"
                    ? {
                      name: cmd.name,
                      description: sub.description!,
                      options: cmd.options,
                      type: 1,
                    }
                    : {
                      name: cmd.name,
                      description: sub.description!,
                      options: (
                        sub as SlashSubcommandGroup
                      ).subcommands!.map((sub) => {
                        return {
                          name: sub.name,
                          description: sub.description!,
                          options: sub.options,
                          type: 1,
                        };
                      }),
                      type: 2,
                    }
                ) || []),
              ]
              : undefined,
          },
        ],
        guild.id,
      );
    });
};
