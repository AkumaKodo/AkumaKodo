import {
  BotWithCache,
  BotWithHelpersPlugin,
  CreateBotOptions,
  createGatewayManager,
  DiscordenoInteraction,
  DiscordenoMessage,
  EventHandlers,
} from "../../deps.ts";
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";
import { cooldownInterface, InteractionCommand, SlashSubcommand, SlashSubcommandGroup } from "./Command.ts";
import { _runningTaskInterface, AkumaKodoTask } from "./Task.ts";
import { AkumaKodoLogger, logger } from "../../internal/logger.ts";
import { AkumaKodoMonitor } from "./Monitor.ts";
import { AkumaKodoEmbedInterface } from "../lib/utils/Embed.ts";
import { AkumaKodoBotCore } from "../lib/AkumaKodo.ts";

export interface AkumaCreateBotOptions extends CreateBotOptions {
  dir: string;
  /** Optional options for client */
  optional: {
    /** The ID's of the bot owners */
    bot_owners_ids?: (bigint | string)[];
    /** The ID's of the bot supporters */
    bot_supporters_ids?: bigint[];
    /** The ID's of the bot staff */
    bot_staff_ids?: bigint[];
    bot_default_prefix?: AkumaKodoPrefix | undefined;
    /** The development server for your bot */
    bot_development_server_id?: bigint;
    /** Users who can bypass the bots cool-downs for commands*/
    bot_cooldown_bypass_ids?: bigint[];
    /** The framework logs things to the console for internal testing. You can enable this if you wish for more developer logs. */
    bot_internal_logs?: boolean;
    bot_mention_with_prefix?: boolean;
  };
}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
export interface AkumaKodoBotInterface {
  /**
   * Helpful functions to make your bot easier to use all in one method.
   */
  utilities?: AkumaKodoUtilities;
  languageCollection: AkumaKodoCollection<bigint, string>;
  taskCollection: AkumaKodoCollection<string, AkumaKodoTask>;
  monitorCollection: AkumaKodoCollection<string, AkumaKodoMonitor>;
  runningTasks: _runningTaskInterface;
  /** Access slash commands data */
  slashCommands: AkumaKodoCollection<string, InteractionCommand>;
  defaultCooldown: cooldownInterface;
  /** ID of users who bypass the cooldown */
  ignoreCooldown: bigint[];
  /** Access to the client logger */
  logger: AkumaKodoLogger;
  fullyReady: boolean;
  /** The bot prefix */
  prefix?: AkumaKodoPrefix;
  mentionWithPrefix: boolean;
}

/**
 * typings for bot utils
 */
export interface AkumaKodoUtilities {
  // createSlashCommand(bot: AkumaKodoBotInterface, command: InteractionCommand): void;
  // createSlashSubcommandGroup(
  //   bot: AkumaKodoBotInterface,
  //   command: string,
  //   subcommandGroup: SlashSubcommandGroup,
  //   retries?: number,
  // ): Promise<void>;
  // createSlashSubcommand(
  //   bot: AkumaKodoBotInterface,
  //   command: string,
  //   subcommandGroup: SlashSubcommand,
  //   options?: { split?: boolean; retries?: number },
  // ): Promise<void>;
  createTask(client: AkumaKodoBotCore, task: AkumaKodoTask): void;
  destroyTasks(client: AkumaKodoBotCore): void;
  createEmbed(options: AkumaKodoEmbedInterface): void;
}

export type Async<T> = PromiseLike<T> | T;

export type AkumaKodoPrefix =
  | string
  | string[]
  | ((
    message: DiscordenoMessage,
  ) => Async<string | string[]>);
