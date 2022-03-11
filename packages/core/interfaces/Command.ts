/** Structure for our commands */
export interface Command {
  /** The name of this command. */
  name: string;
  /** The command aliases. Do not work with slash commands. */
  aliases?: string[];
  /** The command description */
  description?: string;
  /** Runs the command function */
  execute: () => unknown;
  /** The command type */
  type?: "simple" | "slash" | undefined;
  /** Rate limits the command for users or the guild */
  ratelimit: ratelimitInterface;
  /** If the command can only be used in a NSFW channel. */
  nsfw: boolean;
  /** If the command can only be executed in a guild */
  guildOnly: boolean;
  /** If the command can only be executed in a DM */
  dmOnly: boolean;
  /** If the command can only be executed by the bot developers. */
  devOnly: boolean;
  /** The command category */
  category: string[];
  /** Permissions the bot needs to run this command. */
  botPermissions: any[];
  /** Permissions the user executing the command, needs to run this command. */
  userPermissions: any[];
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
