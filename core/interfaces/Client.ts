import { CreateBotOptions, DiscordenoMessage } from "../../deps.ts";
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";
import { cooldownInterface, InteractionCommand } from "./Command.ts";
import { _runningTaskInterface, AkumaKodoTask } from "./Task.ts";
import { AkumaKodoLogger } from "../../internal/logger.ts";
import { AkumaKodoMonitor } from "./Monitor.ts";
import {AkumaKodoEmbed, AkumaKodoEmbedInterface} from "../lib/utils/Embed.ts";
import { AkumaKodoBotCore } from "../AkumaKodo.ts";

export interface AkumaCreateBotOptions extends CreateBotOptions {
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
    bot_internal_logs?: boolean;
    /** If mentions act as a bot prefix */
    bot_mention_with_prefix?: boolean;
  };
  /** Optional providers for the bot client */
  providers?: {
    /** The type of provider client */
    type: "mongodb" | "postgres" | "mysql";
    /** Enables the provider */
    enabled: boolean;
  };
}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
export interface AkumaKodoBotInterface {
  utils: AkumaKodoUtilities;
  languageCollection: AkumaKodoCollection<bigint, string>;
  taskCollection: AkumaKodoCollection<string, AkumaKodoTask>;
  monitorCollection: AkumaKodoCollection<string, AkumaKodoMonitor>;
  runningTasks: _runningTaskInterface;
  slashCommands: AkumaKodoCollection<string, InteractionCommand>;
  defaultCooldown: cooldownInterface;
  ignoreCooldown: bigint[];
  logger: AkumaKodoLogger;
  fullyReady: boolean;
  prefix?: AkumaKodoPrefix;
  mentionWithPrefix: boolean;
}

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
  embed(): AkumaKodoEmbed
}

export type Async<T> = PromiseLike<T> | T;

export type AkumaKodoPrefix =
  | string
  | string[]
  | ((
    message: DiscordenoMessage,
  ) => Async<string | string[]>);
