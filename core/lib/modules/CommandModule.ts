import {
  AkumaKodoConfigurationInterface,
  AkumaKodoContainerInterface
} from "../../interfaces/Client.ts";
import { AkumaKodoCommand } from "../../interfaces/Command.ts";
import { DiscordenoInteraction } from "https://deno.land/x/discordeno@13.0.0-rc18/src/transformers/interaction.ts";
import {
  InteractionResponseTypes,
} from "https://deno.land/x/discordeno@13.0.0-rc18/src/types/interactions/interactionResponseTypes.ts";
import {AkumaKodoBotCore} from "../../AkumaKodo.ts";
import {BotWithCache} from "https://deno.land/x/discordeno_cache_plugin@0.0.21/src/addCacheCollections.ts";

export class AkumaKodoCommandModule {
  public container: AkumaKodoContainerInterface
  public configuration: AkumaKodoConfigurationInterface
  private instance: BotWithCache
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
}
