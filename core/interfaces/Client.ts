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
import { cooldownInterface, InteractionCommand, MessageCommand, ParentCommand } from "./Command.ts";
import { _runningTaskInterface, AkumaKodoTask } from "./Task.ts";
import { AkumaKodoArgument } from "./Arugment.ts";
import { InternalCacheController } from "../../internal/controllers/cache.ts";
import { logger } from "../../internal/logger.ts";
import { AkumaKodoMonitor } from "./Monitor.ts";

/** Extends default options for the bot client */
export interface AkumaCreateBotOptions extends CreateBotOptions {
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
  /** The framework logs things to the console for internal testing. You can enable this if you wish. */
  bot_internal_logs?: boolean;
  bot_mention_with_prefix?: boolean;
}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
export interface AkumaKodoBotInterface extends BotWithCache<BotWithHelpersPlugin> {
  events: AkumaKodoEvents;
  /** Allows access to the gateway manager */
  ws: ReturnType<typeof createGatewayManager>;
  /** Container for bot config options */
  container: AkumaCreateBotOptions;
  prefixCollection: AkumaKodoCollection<bigint, string>;
  languageCollection: AkumaKodoCollection<bigint, string>;
  argumentsCollection: AkumaKodoCollection<string, AkumaKodoArgument>;
  inhibitorCollection: AkumaKodoCollection<
    string,
    <T extends ParentCommand = ParentCommand>(
      message: DiscordenoMessage,
      command: T,
      options: { memberId?: bigint; channelId: bigint; guildId?: bigint },
    ) => any
  >;
  taskCollection: AkumaKodoCollection<string, AkumaKodoTask>;
  monitorCollection: AkumaKodoCollection<string, AkumaKodoMonitor>;
  runningTasks: _runningTaskInterface;
  /** Access message command data */
  messageCommands: AkumaKodoCollection<string, MessageCommand<any>>;
  /** Access slash commands data */
  slashCommands: AkumaKodoCollection<string, InteractionCommand>;
  defaultCooldown: cooldownInterface;
  /** ID of users who bypass the cooldown */
  ignoreCooldown: bigint[];
  /** Controls cache functions in the framework */
  internalCacheController: InternalCacheController;
  /** Access to the client logger */
  logger: typeof logger;
  fullyReady: boolean;
  /** The bot prefix */
  prefix: AkumaKodoPrefix | undefined;
  mentionWithPrefix: boolean;
}

/**
 * Custom events for the framework
 */
export interface AkumaKodoEvents extends EventHandlers {
  commands: {
    error(
      data: {
        error: string | Error;
        data?: DiscordenoInteraction;
        message?: DiscordenoMessage;
      },
    ): unknown;
    create<C extends ParentCommand = ParentCommand>(
      command: C,
      dataOrMessage: DiscordenoInteraction | DiscordenoMessage,
    ): unknown;
    destroy<C extends ParentCommand = ParentCommand>(
      command: C,
      dataOrMessage: DiscordenoInteraction | DiscordenoMessage,
    ): unknown;
  };
}

export type Async<T> = PromiseLike<T> | T;

export type AkumaKodoPrefix = | string
    | string[]
    | ((
    message: DiscordenoMessage,
) => Async<string | string[]>);