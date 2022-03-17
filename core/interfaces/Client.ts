import { CreateBotOptions, DiscordenoMessage } from "../../deps.ts";
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";
import { AkumaKodoCommand, cooldownInterface } from "./Command.ts";
import { _runningTaskInterface, AkumaKodoTask } from "./Task.ts";
import { AkumaKodoLogger } from "../../internal/logger.ts";
import { AkumaKodoMonitor } from "./Monitor.ts";
import { AkumaKodoEmbed, AkumaKodoEmbedInterface } from "../lib/utils/Embed.ts";
import { AkumaKodoBotCore } from "../AkumaKodo.ts";
import { AkumaKodoMongodbProvider } from "../providers/mongodb.ts";

export interface AkumaCreateBotOptions extends CreateBotOptions {}

/** Default options for client if non are passed */
export const defaultConfigOptions = {
  optional: {
    bot_owners_ids: [],
    bot_supporters_ids: [],
    bot_staff_ids: [],
    bot_default_prefix: "",
    bot_development_server_id: undefined,
    bot_cooldown_bypass_ids: [],
    bot_debug_mode: false,
    bot_mention_with_prefix: false,
    bot_log_command_reply: false,
    providers: {
      type: "disabled",
    },
  },
} as AkumaKodoConfigurationInterface;

export interface AkumaKodoConfigurationInterface {
  /** Optional options for client */
  optional: {
    /** The ID's of the bot owners */
    bot_owners_ids?: (bigint | string)[];
    /** The ID's of the bot supporters */
    bot_supporters_ids?: bigint[];
    /** The ID's of the bot staff */
    bot_staff_ids?: bigint[];
    /** The bot default prefix */
    bot_default_prefix?: AkumaKodoPrefix | undefined;
    /** The development server for your bot */
    bot_development_server_id?: bigint;
    /** Users who can bypass the bots cool-downs for commands*/
    bot_cooldown_bypass_ids?: bigint[];
    /** The framework logs things to the console for internal testing. You can enable this if you wish for more developer logs. */
    bot_debug_mode?: boolean;
    /** If mentions act as a bot prefix */
    bot_mention_with_prefix?: boolean;
    /** Enables command error replays such as command not found and more logging... */
    bot_log_command_reply?: boolean;
    /** Optional providers for the bot client */
    providers: {
      /** The type of provider client */
      type: "mongodb" | "postgres" | "mysql" | "disabled";
      mongodb_connection_url?: string;
    };
  };
}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
export interface AkumaKodoContainerInterface {
  providers?: {
    type: "mongodb" | "postgres" | "mysql" | "disabled";
    mongodb?: AkumaKodoMongodbProvider;
  };
  utils: AkumaKodoUtilities;
  languageCollection: AkumaKodoCollection<bigint, string>;
  taskCollection: AkumaKodoCollection<string, AkumaKodoTask>;
  monitorCollection: AkumaKodoCollection<string, AkumaKodoMonitor>;
  runningTasks: _runningTaskInterface;
  commands: AkumaKodoCollection<string, AkumaKodoCommand>;
  defaultCooldown: cooldownInterface;
  ignoreCooldown: bigint[];
  logger: AkumaKodoLogger;
  fullyReady: boolean;
  prefix?: AkumaKodoPrefix;
  mentionWithPrefix: boolean;
}

/**
 * Utility interface for the bot.
 */
export interface AkumaKodoUtilities {
  /** Creates a command */
  createCommand(bot: AkumaKodoBotCore, command: AkumaKodoCommand): void | Promise<void>;
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
  /** Creates a Task */
  createTask(bot: AkumaKodoBotCore, task: AkumaKodoTask, callback?: () => any): void | Promise<void>;
  /** Deletes a Task */
  destroyTasks(bot: AkumaKodoBotCore, callback?: () => any): void | Promise<void>;
  /** Creates an Embed */
  createEmbed(options: AkumaKodoEmbedInterface): void;
  embed(): AkumaKodoEmbed;
}

export type Async<T> = PromiseLike<T> | T;

export type AkumaKodoPrefix =
  | string
  | string[]
  | ((
    message: DiscordenoMessage,
  ) => Async<string | string[]>);

export interface Events {
  [name: string]: (...args: any[]) => Promise<any> | any;
}
