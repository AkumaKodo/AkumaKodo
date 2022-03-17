import { PermissionStrings } from "../../deps.ts";
import {AkumaKodoModule} from "../AkumaKodoModule.ts";
import {AkumaKodoBotCore} from "../AkumaKodo.ts";
import {AkumaKodoCommandHandler} from "../lib/commands/CommandHandler.ts";
import {ArgOptions} from "./Argument.ts";

/** Base command interface. All commands have these options */
export interface e {
  /** The name of this command. */
  trigger: string;
  /** The command description */
  description?: string;
  /** Rate limits the command for users or the guild */
  cooldown?: cooldownInterface;
  /**A list of member and role ids that can bypass the command cooldown*/
  ignoreCooldown?: bigint[];
  /**Checks if the member has the necessary roles to run the command*/
  hasRoles?: bigint[];
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
  userChannelPermissions?: PermissionStrings[];
  /**The guild permissions needed by the member to execute the command*/
  userGuildPermissions?: PermissionStrings[];
  /**The channel permissions needed by the bot to execute the command*/
  botChannelPermissions?: PermissionStrings[];
  /**The guild permissions needed by the bot to execute the command*/
  botGuildPermissions?: PermissionStrings[];
  /** Runs the command function */
}

export interface cooldownInterface {
  /** How long the user needs to wait after the first execution until he can use the command again */
  seconds: number;
  /** How often the user is allowed to use the command until he is in cooldown */
  allowedUses: number;
}

export abstract class AkumaKodoCommand extends AkumaKodoModule {
  declare handler: AkumaKodoCommandHandler<AkumaKodoBotCore>;
  category = "default";
  trigger: string = this.id;
  aliases: string[] | undefined = [this.trigger];
  examples: string[] | undefined;
  ownerOnly: boolean | undefined;
  required: boolean | undefined;
  description: string | undefined;
  slash: boolean | undefined;
  enabled: boolean | undefined;
  superUserOnly: boolean | undefined;
  options?: ArgOptions[] | undefined;
  clientPermissions: PermissionStrings[] | undefined;
  userPermissions: PermissionStrings[] | undefined;
  cooldown?: number | undefined;
  ratelimit = 3;
}