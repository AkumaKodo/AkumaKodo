/*Creates a slash command*/
import { AkumaKodoCollection } from "./Collection.ts";
import { AkumaKodoBot } from "../AkumaKodo.ts";
import { SlashSubcommand, SlashSubcommandGroup } from "../../interfaces/Command.ts";
import { delay } from "../../../internal/utils.ts";
import {AkumaKodoBotInterface} from "../../interfaces/Client.ts";

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
