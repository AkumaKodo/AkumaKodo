import { PermissionStrings } from "https://deno.land/x/discordeno@13.0.0-rc18/src/types/permissions/permissionStrings.ts";
import {
    ApplicationCommandOption,
    ApplicationCommandTypes,
    DiscordenoInteraction,
} from "../../deps.ts";
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";

export interface AkumaKodoCommand {
    /**The command trigger that runs the command */
    trigger: string;
    /**The command description */
    description: string;
    /** The command scope */
    scope: CommandScopeType;
    /** A longer description of the command */
    extendedDescription?: string;
    /** The command usage and examples */
    usage?: string[];
    /**The category that can be used to organize commands*/
    category?: string;
    /** Rate limit for the command */
    rateLimit?: rateLimitInterface;
    /**Whether the command is allowed to run in non-nsfw channels*/
    nsfw?: boolean;
    /**Whether the command can only be used by the bots owners*/
    ownerOnly?: boolean;
    /** If the command can only be run in a development guild. */
    devOnly?: boolean;
    /**If the command can only be used in guilds*/
    guildOnly?: true;
    /**If the command can only be used in dms*/
    dmOnly?: boolean;
    /** If the command can only be used by the bot support team. */
    supportOnly?: boolean;
    /**A list of member and role ids that can bypass the command cooldown*/
    ignoreRateLimit?: bigint[];
    /**The bot permissions needed by the bot to execute the command*/
    botPermissions?: PermissionStrings[];
    /**The user permissions needed by the user to execute the command*/
    userPermissions?: PermissionStrings[];
    /**Whether the command is enabled by default when the app is added to a guild*/
    defaultPermission?: boolean;
    /**The application command type (context menus/input command)*/
    type?: ApplicationCommandTypes;
    /**A list of options for the command*/
    options?: ApplicationCommandOption[];
    /**A collection of */
    subcommands?: AkumaKodoCollection<
        string,
        SlashSubcommandGroup | AkumaKodoSubcommand
    >;
    /** The function that is executed when the command is run */
    run: (data: DiscordenoInteraction) => unknown;
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
    subcommands?: AkumaKodoCollection<string, AkumaKodoSubcommand>;
}

/**The interface for slash subcommands*/
export interface AkumaKodoSubcommand extends AkumaKodoCommand {
    /**A list of options for the subcommand*/
    options?: ApplicationCommandOption[];
    /**The subcommand type*/
    SubcommandType?: "subcommand";
}

export interface rateLimitInterface {
    /** The amount of time in seconds (ms) to wait before the user can run the command again */
    duration: number;
    /** The amount of times the user can run the command in the duration */
    limit: number;
}
export type CommandScopeType = "Global" | "Development";
