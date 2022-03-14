import {AkumaKodoBot} from "../AkumaKodo.ts";
import {AkumaKodoLogger} from "../../../internal/logger.ts";
import {AkumaKodoBotInterface} from "../../interfaces/Client.ts";
import {SlashSubcommandGroup} from "../../interfaces/Command.ts";
import {DiscordenoGuild} from "../../../deps.ts";


export async function upsertSlashCommands(bot: AkumaKodoBotInterface, guild: DiscordenoGuild) {
    AkumaKodoLogger("info", "upsertCommands", "Uploading slash commands...");
    // Filter commands by guild id and pushes them if the id matches the config settings.
    bot.slashCommands
        .filter((cmd) => cmd.scope === "Guild" && !cmd.guildIds?.length)
        .forEach((cmd) => {
            bot.helpers.upsertApplicationCommands(
                [
                    {
                        name: cmd.name,
                        type: cmd.type,
                        description:
                            cmd.type == 1 || cmd.type === undefined
                                ? cmd.description
                                : undefined,
                        options:
                            cmd.type == 1 || cmd.type === undefined
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
                guild.id
            );
        });
}