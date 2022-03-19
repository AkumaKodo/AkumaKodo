import { AkumaKodoConfigurationInterface, AkumaKodoContainerInterface } from "../../interfaces/Client.ts";
import { AkumaKodoCommand } from "../../interfaces/Command.ts";
import {
  BotWithCache,
  CreateMessage,
  DiscordenoInteraction,
  EditGlobalApplicationCommand,
  InteractionApplicationCommandCallbackData,
  InteractionResponseTypes,
  MakeRequired,
  sendMessage,
  upsertApplicationCommands,
} from "../../../deps.ts";

export class AkumaKodoCommandModule {
  public container: AkumaKodoContainerInterface;
  public configuration: AkumaKodoConfigurationInterface;
  private readonly instance: BotWithCache;

  public constructor(
    bot: BotWithCache,
    container: AkumaKodoContainerInterface,
    config: AkumaKodoConfigurationInterface,
  ) {
    this.container = container;
    this.configuration = config;
    this.instance = bot;
  }

  /**
   * A quick util for a developer to send interaction command messages
   * @param interaction An interaction
   * @param context The interaction reply options
   */
  public async createCommandReply(
    interaction: DiscordenoInteraction,
    context?: InteractionApplicationCommandCallbackData,
    hidden = false,
    type?:
      | "Pong"
      | "ChannelMessageWithSource"
      | "DeferredChannelMessageWithSource"
      | "DeferredUpdateMessage"
      | "UpdateMessage"
      | "ApplicationCommandAutocompleteResult"
      | "Modal",
  ) {
    switch (type) {
      case "Pong":
        await this.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.Pong,
          private: hidden,
          data: context,
        });
        break;
      case "ChannelMessageWithSource":
        await this.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          private: hidden,
          data: context,
        });
        break;
      case "DeferredChannelMessageWithSource":
        await this.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.DeferredChannelMessageWithSource,
          private: hidden,
          data: context,
        });
        break;
      case "DeferredUpdateMessage":
        await this.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
          private: hidden,
          data: context,
        });
        break;
      case "UpdateMessage":
        await this.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.UpdateMessage,
          private: hidden,
          data: context,
        });
        break;
      case "ApplicationCommandAutocompleteResult":
        await this.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ApplicationCommandAutocompleteResult,
          private: hidden,
          data: context,
        });
        break;
      case "Modal":
        await this.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.Modal,
          private: hidden,
          data: context,
        });
        break;
      default:
        await this.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          private: hidden,
          data: context,
        });
        break;
    }
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

  /**
   * Sends the discord api an event to update all slash commands.
   * @param scope The scope of commands to upgrade
   */
  public async updateApplicationCommands(scope?: "Global" | "Development") {
    const globalCommands: MakeRequired<EditGlobalApplicationCommand, "name">[] = [];
    const developmentCommands: MakeRequired<EditGlobalApplicationCommand, "name">[] = [];

    for (const command of this.container.commands.values()) {
      if (scope === "Development") {
        if (command.scope === "Development") {
          developmentCommands.push({
            name: command.trigger,
            description: command.description || "No description provided",
            type: command.type,
            options: command.options ? command.options : undefined,
          });
        }
        /**
         * Update the development commands
         */
        if (developmentCommands.length && (scope === "Development" || scope === undefined)) {
          if (!this.configuration.optional.bot_development_server_id) {
            throw new Error("Development server id is not set in config options!");
          }
          upsertApplicationCommands(
            this.instance,
            developmentCommands,
            this.configuration.optional.bot_development_server_id,
          ).catch((e) => this.container.logger.create("error", "Update development commands Error", e));

          this.container.logger.create(
            "info",
            "Update development commands",
            "Updating Development Commands, this will only take a few seconds...",
          );
        }
      } else {
        if (command.scope === "Global") {
          globalCommands.push({
            name: command.trigger,
            description: command.description || "No description provided",
            type: command.type,
            options: command.options ? command.options : undefined,
          });
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
          this.container.logger.create(
            "info",
            "Update global commands",
            `Commands added: ${globalCommands.join(", ")}`,
          );
          await this.instance.helpers.upsertApplicationCommands(globalCommands).catch((e) =>
            this.container.logger.create("error", "Update global commands Error", e)
          );
        }
      }
    }
  }
}