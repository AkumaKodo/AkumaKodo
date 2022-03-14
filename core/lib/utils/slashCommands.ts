/*Creates a slash command*/
import { AkumaKodoCollection } from "./Collection.ts";
import { AkumaKodoBot } from "../AkumaKodo.ts";
import { InteractionCommand, SlashSubcommand, SlashSubcommandGroup } from "../../interfaces/Command.ts";
import { delay } from "../../../internal/utils.ts";
import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";
import { DiscordenoInteraction } from "https://deno.land/x/discordeno@13.0.0-rc18/src/transformers/interaction.ts";

export function createSlashCommand(bot: AkumaKodoBotInterface, command: SlashSubcommand) {
  // @ts-ignore -
  bot.slashCommands.set(command.name, command);
}
/*Creates a subcommand group for a slash command*/
export async function createSlashSubcommandGroup(
  bot: AkumaKodoBotInterface,
  command: string,
  subcommand: SlashSubcommandGroup,
  retries?: number,
): Promise<void> {
  const cmd = bot.slashCommands.get(command);
  if (!cmd) {
    if (retries == 20) {
      throw `The command with name "${command}" does not exist!`;
    } else {
      await delay(500);
      return createSlashSubcommandGroup(
        bot,
        command,
        subcommand,
        retries ? retries + 1 : 1,
      );
    }
  }
  cmd?.subcommands ? cmd.subcommands.set(subcommand.name, subcommand) : bot.slashCommands.set(command, {
    ...cmd!,
    subcommands: new AkumaKodoCollection([
      [
        subcommand.name,
        subcommand as SlashSubcommandGroup | SlashSubcommand,
      ],
    ]),
  });
}

/*Creates a subcommand for a slash command or slash subcommand group*/
export async function createSlashSubcommand(
  bot: AkumaKodoBotInterface,
  command: string,
  subcommand: SlashSubcommand,
  options?: { split?: boolean; retries?: number },
): Promise<void> {
  options = options ?? {};
  options.split = options.split ?? true;
  const commandNames = command.split("-", 2);
  const cmd = bot.slashCommands.get(options.split ? commandNames[0] : command);
  if (!cmd) {
    if (options.retries == 20) {
      throw `The command with name "${command}" does not exist!`;
    } else {
      await delay(500);
      return createSlashSubcommand(bot, command, subcommand, {
        ...options,
        retries: options.retries ? options.retries + 1 : 1,
      });
    }
  }
  if (options.split && commandNames.length > 1) {
    const subcommandGroup = cmd.subcommands?.get(
      `${commandNames[1]}${command.slice(commandNames.join("-").length)}`,
    ) as SlashSubcommandGroup | undefined;
    if (!subcommandGroup) {
      return console.error(
        `The subcommand group with name "${commandNames[1]}${
          command.slice(
            commandNames.join("-").length,
          )
        }" does not exist!`,
      );
    }
    subcommandGroup.subcommands
      ? subcommandGroup.subcommands.set(subcommand.name, {
        ...subcommand,
        SubcommandType: "subcommand",
      })
      : (subcommandGroup.subcommands = new AkumaKodoCollection([
        [
          subcommand.name,
          { ...subcommand, SubcommandType: "subcommand" } as SlashSubcommand,
        ],
      ]));
    bot.slashCommands.set(commandNames[0], {
      ...cmd,
      subcommands: new AkumaKodoCollection([
        ...(cmd.subcommands?.entries() ?? []),
        [
          subcommandGroup.name,
          { ...subcommandGroup, SubcommandType: "subcommandGroup" } as
            | SlashSubcommandGroup
            | SlashSubcommand,
        ],
      ]),
    });
  } else {
    cmd.subcommands ? cmd.subcommands.set(subcommand.name, subcommand) : bot.slashCommands.set(command, {
      ...cmd,
      subcommands: new AkumaKodoCollection([
        [
          subcommand.name,
          { ...subcommand, SubcommandType: "subcommand" } as
            | SlashSubcommandGroup
            | SlashSubcommand,
        ],
      ]),
    });
  }
}

interface commandFetch {
  type: "command" | "subcommand" | "subcommandGroup";
  command: InteractionCommand | SlashSubcommand;
}

function fetchCommand(
  data: DiscordenoInteraction,
  command: InteractionCommand,
): commandFetch | undefined {
  if (!command.subcommands?.size) return { type: "command", command };
  const subGroup: SlashSubcommandGroup | undefined = command.subcommands.find(
    (e) =>
      data.data!.options![0].type == 2 &&
      e.name == data.data!.options![0].name &&
      e.SubcommandType == "subcommandGroup",
  ) as SlashSubcommandGroup | undefined;
  if (subGroup) {
    return {
      type: "subcommandGroup",
      command: subGroup.subcommands?.get(
        data.data!.options![0].options![0].name,
      )!,
    };
  }

  const sub = command.subcommands.get(data.data!.options![0].name) as
    | SlashSubcommand
    | undefined;
  if (sub) return { type: "subcommand", command: sub };
}

export async function handleSlash(
  bot: AkumaKodoBotInterface,
  data: DiscordenoInteraction,
) {
  if (
    data.type !== 2 ||
    !data.data?.name ||
    !bot.slashCommands.has(data.data.name)
  ) {
    return;
  }
  if (data.guildId && !bot.guilds.has(data.guildId)) {
    bot.guilds.set(
      data.guildId,
      await bot.helpers.getGuild(data.guildId, { counts: true }),
    );
  }
  if (data.guildId && data.member && !bot.members.has(data.user.id)) {
    bot.members.set(
      bot.transformers.snowflake(`${data.user.id}${data.guildId}`),
      await bot.helpers.getMember(data.guildId, data.user.id),
    );
  }
  if (data.channelId && !bot.channels.has(data.channelId)) {
    bot.channels.set(
      data.channelId,
      await bot.helpers.getChannel(data.channelId),
    );
  }
  const cmd = bot.slashCommands.get(data.data.name)!;
  const command = fetchCommand(data, cmd)!;
  if (
    bot.inhibitorCollection.some(
      (e) =>
        e(bot, command?.command as InteractionCommand, {
          guildId: data.guildId,
          channelId: data.channelId!,
          memberId: data.user.id,
        }) !== true,
    )
  ) {
    return bot.events.commands.error?.({
      data,
      error: bot.inhibitorCollection
        .map((e) =>
          e(bot, command?.command as InteractionCommand, {
            guildId: data.guildId,
            channelId: data.channelId!,
            memberId: data.user.id,
          })
        )
        .find((e) => typeof e !== "boolean")! as Error,
    });
  }
  try {
    bot.events.commands.create?.(command!.command! as InteractionCommand, data);
    command?.command.execute?.(
      bot,
      command.type === "command"
        ? data
        : command.type === "subcommand"
        ? { ...data, data: data.data.options?.[0] }
        : { ...data, data: data.data.options?.[0].options?.[0] },
    );
    bot.events.commands.destroy(command!.command! as InteractionCommand, data);
  } catch (e) {
    if (bot.events.commands.error) {
      bot.events.commands.error({
        error: "Slash Handler Error",
        data,
      });
    } else throw e;
  }
}
