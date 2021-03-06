// deno-lint-ignore-file no-explicit-any
import {
    ButtonStyles,
    CreateBotOptions,
    DiscordenoInteraction,
    DiscordenoMessage,
    InteractionApplicationCommandCallbackData,
} from "../../deps.ts";
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";
import { AkumaKodoCommand, rateLimitInterface } from "./Command.ts";
import { _runningTaskInterface, AkumaKodoTask } from "./Task.ts";
import { AkumaKodoLogger } from "../../internal/logger.ts";
import { AkumaKodoMonitor } from "./Monitor.ts";
import { AkumaKodoEmbed, AkumaKodoEmbedInterface } from "../lib/utils/Embed.ts";
import { AkumaKodoBotCore } from "../AkumaKodo.ts";

// deno-lint-ignore no-empty-interface
export interface AkumaCreateBotOptions extends CreateBotOptions {}

/** Default options for client if non are passed */
export const defaultConfigOptions = {
    optional: {
        bot_owners_ids: undefined,
        bot_supporters_ids: undefined,
        bot_staff_ids: undefined,
        bot_default_prefix: undefined,
        bot_ratelimit_bypass_ids: undefined,
        bot_debug_mode: false,
        bot_mention_with_prefix: false,
        bot_log_command_reply: false,
        bot_fetch_owners: false,
        bot_internal_events: {
            interactionCreate: true,
            ready: true,
        },
        commands: {
            upsert: true,
        },
    },
    required: {
        bot_development_server_id: BigInt("0"),
    },
} as AkumaKodoConfigurationInterface;

export interface AkumaKodoConfigurationInterface {
    /** Optional options for client */
    optional: {
        /** The ID's of the bot owners */
        bot_owners_ids?: bigint[];
        /** The ID's of the bot supporters */
        bot_supporters_ids?: bigint[];
        /** The ID's of the bot staff */
        bot_staff_ids?: bigint[];
        /** The bot default prefix */
        bot_default_prefix?: AkumaKodoPrefix | undefined;
        /** Users who can bypass the bots cool-downs for commands*/
        bot_ratelimit_bypass_ids?: bigint[];
        /** The framework logs things to the console for internal testing. You can enable this if you wish for more developer logs. */
        bot_debug_mode?: boolean;
        /** If mentions act as a bot prefix */
        bot_mention_with_prefix?: boolean;
        /** Enables command error replays such as command not found and more logging... */
        bot_log_command_reply?: boolean;
        /** If the internal events are enabled or not...
         * Defaults to true
         */
        bot_internal_events?: {
            interactionCreate?: boolean;
        };
        /** Command config */
        commands?: {
            /** If slash commands should be upsert on each bot startup. defaults to true for development commands.*/
            upsert?: boolean;
        };
        /** If the bot should fetch all the bot owners on startup */
        bot_fetch_owners?: boolean;
    };
    /** Required for the config */
    required: {
        /** The development server for your bot. This is required for development scoped commands. */
        bot_development_server_id?: bigint;
    };
}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
export interface AkumaKodoContainerInterface {
    /** zc
     * The internal file system for AkumaKodo - used to load commands, handlers, and more in sub folders.
     */
    fs: {
        import: (bot: AkumaKodoBotCore, path: string) => Promise<void> | void;
        load: (bot: AkumaKodoBotCore) => Promise<void> | void;
        /** Load your subdirectories using this function.
         *  Keep in mind it uses your absolute path in your project. */
        fastLoader: (
            bot: AkumaKodoBotCore,
            /** An array of directories to import recursively. */
            paths: string[],
            /** A function that will run before recursively setting a part of `paths`.
             * `path` contains the path that will be imported, useful for logging
             */
            between?: (
                path: string,
                uniqueFilePathCounter: number,
                paths: string[],
            ) => void,
            /** A function that runs before **actually** importing all the files. */
            before?: (uniqueFilePathCounter: number, paths: string[]) => void,
        ) => Promise<void> | void;
    };
    utils: AkumaKodoUtilities;
    languageCollection: AkumaKodoCollection<bigint, string>;
    taskCollection: AkumaKodoCollection<string, AkumaKodoTask>;
    monitorCollection: AkumaKodoCollection<string, AkumaKodoMonitor>;
    runningTasks: _runningTaskInterface;
    commands: AkumaKodoCollection<string, AkumaKodoCommand>;
    defaultRateLimit: rateLimitInterface;
    ignoreRateLimit: bigint[];
    logger: AkumaKodoLogger;
    bot_owners_cache: Set<bigint>;
    bot_supporters_cache: Set<bigint>;
    fullyReady: boolean;
    prefix?: AkumaKodoPrefix;
    mentionWithPrefix: boolean;
}

/**
 * Utility interface for the bot.
 */
export interface AkumaKodoUtilities {
    /**
     * Creates a new command in the cache. This is used to preload commands
     * @param bot The bot object
     * @param command The command to create
     * @returns The created command
     */
    createCommand(
        bot: AkumaKodoBotCore,
        command: AkumaKodoCommand,
    ): any | Promise<any>;
    /**
     * A quick util for a developer to send interaction command messages
     * @param bot The bot object
     * @param interaction An interaction
     * @param context The interaction reply options
     * @param hidden Whether the interaction should be hidden
     * @param type The type of interaction
     */
    createCommandReply(
        bot: AkumaKodoBotCore,
        interaction: DiscordenoInteraction,
        context: InteractionApplicationCommandCallbackData,
        hidden: boolean,
        type?:
            | "Pong"
            | "ChannelMessageWithSource"
            | "DeferredChannelMessageWithSource"
            | "DeferredUpdateMessage"
            | "UpdateMessage"
            | "ApplicationCommandAutocompleteResult"
            | "Modal",
    ): any | Promise<any>;
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
    createTask(
        bot: AkumaKodoBotCore,
        task: AkumaKodoTask,
        callback?: () => any,
    ): any | Promise<any>;
    /** Deletes a Task */
    destroyTasks(
        bot: AkumaKodoBotCore,
        callback?: () => any,
    ): any | Promise<any>;
    /** Creates an Embed */
    createEmbed(options: AkumaKodoEmbedInterface): AkumaKodoEmbed;
    /** Access the AkumaKodoEmbed Method */
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
