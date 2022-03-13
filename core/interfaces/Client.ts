import {
  BotWithCache,
  BotWithHelpersPlugin,
  CreateBotOptions,
  createGatewayManager,
  DiscordenoMessage,
} from "../../deps.ts";
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";
import { cooldownInterface, InteractionCommand, MessageCommand, ParentCommand } from "./Command.ts";
import { _runningTaskInterface, Task } from "./Task.ts";
import { Argument } from "./Arugment.ts";
import { InternalCacheController } from "../../internal/controllers/cache.ts";

/** Extends default options for the bot client */
export interface AkumaCreateBotOptions extends CreateBotOptions {
  /** The ID's of the bot owners */
  bot_owners_ids?: (bigint | string)[];
  /** The ID's of the bot supporters */
  bot_supporters_ids?: bigint[];
  /** The ID's of the bot staff */
  bot_staff_ids?: bigint[];
  bot_default_prefix?: string;
  /** The development server for your bot */
  bot_development_server_id?: bigint;
  /** Users who can bypass the bots cool-downs for commands*/
  bot_cooldown_bypass_ids?: bigint[];
  /** The framework logs things to the console for internal testing. You can enable this if you wish. */
  bot_internal_logs?: boolean;
}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
export interface AkumaKodoBotInterface extends BotWithCache<BotWithHelpersPlugin> {
  /** Allows access to the gateway manager */
  ws: ReturnType<typeof createGatewayManager>;
  /** Container for bot config options */
  container: AkumaCreateBotOptions;
  prefixCollection: AkumaKodoCollection<bigint, string>;
  languageCollection: AkumaKodoCollection<bigint, string>;
  argumentsCollection: AkumaKodoCollection<string, Argument>;
  inhibitorCollection: AkumaKodoCollection<
    string,
    <T extends ParentCommand = ParentCommand>(
      message: DiscordenoMessage,
      command: T,
      options: { memberId?: bigint; channelId: bigint; guildId?: bigint },
    ) => any
  >;
  taskCollection: AkumaKodoCollection<string, Task>;
  runningTasks: _runningTaskInterface;
  messageCommand: AkumaKodoCollection<string, MessageCommand<any>>;
  slashCommand: AkumaKodoCollection<string, InteractionCommand>;
  defaultCooldown: cooldownInterface;
  /** ID of users who bypass the cooldown */
  ignoreCooldown: bigint[];
  internalCacheController: InternalCacheController;
}
