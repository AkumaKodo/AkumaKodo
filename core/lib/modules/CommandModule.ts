import { AkumaKodoConfigurationInterface, AkumaKodoContainerInterface } from "../../interfaces/Client.ts";
import { AkumaKodoCommand } from "../../interfaces/Command.ts";
import { DiscordenoInteraction } from "https://deno.land/x/discordeno@13.0.0-rc18/src/transformers/interaction.ts";
import {
  InteractionResponseTypes,
} from "https://deno.land/x/discordeno@13.0.0-rc18/src/types/interactions/interactionResponseTypes.ts";
import { AkumaKodoBotCore } from "../../AkumaKodo.ts";
import { BotWithCache } from "https://deno.land/x/discordeno_cache_plugin@0.0.21/src/addCacheCollections.ts";
import { MakeRequired } from "https://deno.land/x/discordeno@13.0.0-rc18/src/types/util.ts";
import {
  EditGlobalApplicationCommand,
} from "https://deno.land/x/discordeno@13.0.0-rc18/src/types/interactions/commands/editGlobalApplicationCommand.ts";
import {
  upsertApplicationCommands,
} from "https://deno.land/x/discordeno@13.0.0-rc18/src/helpers/interactions/commands/upsertApplicationCommands.ts";

export class AkumaKodoCommandModule {
  public container: AkumaKodoContainerInterface;
  public configuration: AkumaKodoConfigurationInterface;
  private readonly instance: BotWithCache;
  constructor(bot: BotWithCache, container: AkumaKodoContainerInterface, config: AkumaKodoConfigurationInterface) {
    this.container = container;
    this.configuration = config;
    this.instance = bot;
  }

  /**
   * Creates a new command in the cache. This is used to preload commands
   * @param command The command to create
   * @returns The created command
   */
  public createCommand(command: AkumaKodoCommand): AkumaKodoCommand {
    // Check things before the command is set in cache
    AkumaKodoCommandModule.preCheck(command);
    this.container.commands.set(command.trigger.toLowerCase(), command);
    this.container.logger.create("info", "create command", `Created command ${command.trigger}`);
    return command;
  }

  /**
   * Checks if a command is valid before loading it into the collection.
   * @param command
   * @private
   */
  private static preCheck(command: AkumaKodoCommand) {
    if (command.trigger.length > 32) {
      throw new Error("Command trigger is too long! Max 32 characters" + `For command ${command.trigger}`);
    }
    if (command.trigger.length < 1) {
      throw new Error("Command trigger is too short! Min 1 character" + `For command ${command.trigger}`);
    }
    if (command.trigger.includes(" ")) {
      throw new Error("Command trigger cannot contain spaces!" + `For command ${command.trigger}`);
    }
    if (command.trigger.includes("@")) {
      throw new Error("Command trigger cannot contain @!" + `For command ${command.trigger}`);
    }
    if (command.trigger.includes("#")) {
      throw new Error("Command trigger cannot contain #!" + `For command ${command.trigger}`);
    }
  }

  /**
   * Gets a command by trigger and return its data.
   * You can use this to get command information such as category, description, usage, etc.
   * @param trigger
   */
  public getCommand(trigger: string): AkumaKodoCommand | undefined {
    const command: AkumaKodoCommand | undefined = this.container.commands.get(trigger);
    if (command) {
      return command;
    } else {
      return undefined;
    }
  }

  public async runCommand(interaction: DiscordenoInteraction) {
    const data = interaction.data;

    if (!data?.name) return;

    const command = this.getCommand(data.name);

    // if the command exist we run it, else ignore this function
    if (command) {
      try {
        // @ts-ignore - we know that the command is valid
        command.run(this, interaction);
        this.container.logger.create("info", "run command", `Command ${data?.name} was ran!`);
      } catch (error) {
        this.container.logger.create("error", "run command", `Command ${data?.name} failed to run!`);
        this.container.logger.create("error", "run command", error);
      }
    } else {
      // Check if command reply is enabled
      if (this.configuration.optional.bot_log_command_reply) {
        return await this.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          private: true,
          data: {
            content: `Command \`${data?.name}\` is not a valid command!`,
          },
        });
      }
    }
  }

  public async updateApplicationCommands(scope?: "Guild" | "Global" | "Development") {
    const globalCommands: MakeRequired<EditGlobalApplicationCommand, "name">[] = [];
    const perGuildCommands: MakeRequired<EditGlobalApplicationCommand, "name">[] = [];
    const developmentCommands: MakeRequired<EditGlobalApplicationCommand, "name">[] = [];

    for (const command of this.container.commands.values()) {
      if (command.scope) {
        if (command.scope === "Guild") {
          perGuildCommands.push({
            name: command.trigger,
            description: command.description || "No description provided",
            type: command.type,
            options: command.options ? command.options : undefined,
          });
        } else if (command.scope === "Global") {
          globalCommands.push({
            name: command.trigger,
            description: command.description || "No description provided",
            type: command.type,
            options: command.options ? command.options : undefined,
          });
        } else if (command.scope === "Development") {
          developmentCommands.push({
            name: command.trigger,
            description: command.description || "No description provided",
            type: command.type,
            options: command.options ? command.options : undefined,
          });
        }
      }
    }
    /**
     * Updates the global application commands
     */
    if (globalCommands.length && (scope === "Global" || scope === undefined)) {
      this.container.logger.create(
        "info",
        "Update global commands",
        "Updating Global Commands, this takes up to 1 hour to take effect...",
      );
      this.container.logger.create("info", "Update global commands", `Commands added: ${globalCommands.join(", ")}`);
      await this.instance.helpers.upsertApplicationCommands(globalCommands).catch((e) =>
        this.container.logger.create("error", "Update global commands Error", e)
      );
    }
    /**
     * Updates the guild application commands
     */
    if (perGuildCommands.length && (scope === "Guild" || scope === undefined)) {
      this.container.logger.create(
        "info",
        "Update guild commands",
        "Updating Guild Commands, this takes up to 1 minute to take effect...",
      );
      this.container.logger.create("info", "Update guild commands", `Commands added: ${perGuildCommands.join(", ")}`);
      this.instance.guilds.forEach((guild) => {
        upsertApplicationCommands(this.instance, perGuildCommands, guild.id);
      });
    }

    /**
     * Update the development commands
     */
    if (developmentCommands.length && (scope === "Development" || scope === undefined)) {
      this.container.logger.create(
        "info",
        "Update development commands",
        "Updating Development Commands, this takes up to 1 minute to take effect...",
      );
      upsertApplicationCommands(
        this.instance,
        developmentCommands,
        this.configuration.optional.bot_development_server_id,
      ).catch((e) => this.container.logger.create("error", "Update development commands Error", e));
    }
  }
}
