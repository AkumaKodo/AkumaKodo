/** base command interface */
import {
  ApplicationCommandOption,
  ApplicationCommandTypes,
  DiscordenoInteraction,
  DiscordenoMessage,
  Permission,
} from "../../../deps.ts";
import { ArgumentDefinition, ConvertArgumentDefinitionsToArgs } from "./Arugment.ts";
import { AkumaKomoBotInterface } from "./Client.ts";
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";

/** Base command interface. All commands have these options */
export interface ParentCommand {
  /** The name of this command. */
  name: string;
  /** The command description */
  description?: string;
  /** Rate limits the command for users or the guild */
  ratelimit: ratelimitInterface;
  /** If the command can only be used in a NSFW channel. */
  nsfw?: boolean;
  /** If the command can only be executed in a guild */
  guildOnly?: boolean;
  /** If the command can only be executed in a DM */
  dmOnly?: boolean;
  /** If the command can only be executed by the bot developers. */
  ownerOnly?: boolean;
  /** The command category */
  category?: string[];
  /**The channel permissions needed by the member to execute the command*/
  userChannelPermissions?: Permission[];
  /**The guild permissions needed by the member to execute the command*/
  userGuildPermissions?: Permission[];
  /**The channel permissions needed by the bot to execute the command*/
  botChannelPermissions?: Permission[];
  /**The guild permissions needed by the bot to execute the command*/
  botGuildPermissions?: Permission[];
  /** Runs the command function */
}

export interface MessageCommand<T extends readonly ArgumentDefinition[]> extends ParentCommand {
  /** The command aliases. Do not work with slash commands. */
  aliases?: string[];
  /**The command arguments*/
  arguments?: T;
  /**A collection of subcommands*/
  subcommands?: AkumaKodoCollection<string, Omit<MessageCommand<T>, "category">>;
  execute: (
    bot: AkumaKomoBotInterface,
    message: DiscordenoMessage,
    args: ConvertArgumentDefinitionsToArgs<T>,
  ) => unknown | Promise<unknown>;
}

/** Used for making slash commands */
export interface InteractionCommand extends ParentCommand {
  /** The scope of the command. */
  scope: "Guild" | "Global" | "Development";
  /**Whether the command is enabled by default when the app is added to a guild*/
  defaultPermission?: boolean;
  /**The application command type (context menus/input command)*/
  type?: ApplicationCommandTypes;
  /**A list of options for the command*/
  options?: ApplicationCommandOption[];
  /**A collection of */
  subcommands?: AkumaKodoCollection<string, SlashSubcommandGroup | SlashSubcommand>;
  execute?: (bot: AkumaKomoBotInterface, data: DiscordenoInteraction) => unknown | Promise<unknown>;
}

interface ratelimitInterface {
  guild: {
    limit: number;
    usages: number;
  };
  user: {
    limit: number;
    usages: number;
  };
}

/**The interface for slash subcommands*/
export interface SlashSubcommand extends ParentCommand {
  /**A list of options for the subcommand*/
  options?: ApplicationCommandOption[];
  /**The subcommand type*/
  SubcommandType?: "subcommand";
  execute?: (bot: AkumaKomoBotInterface, data: DiscordenoInteraction) => unknown | Promise<unknown>;
}

/**The interface for slash subcommands groups*/
export interface SlashSubcommandGroup {
  /**The subcommand group's name*/
  name: string;
  /**The subcommand group's description*/
  description: string;
  /**The subcommand type*/
  SubcommandType?: "subcommandGroup";
  /**A collection of subcommands for the group*/
  subcommands?: AkumaKodoCollection<string, SlashSubcommand>;
}
