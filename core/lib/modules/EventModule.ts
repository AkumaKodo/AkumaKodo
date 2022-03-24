import { botHasGuildPermissions, BotWithCache, InteractionTypes, validatePermissions } from "../../../deps.ts";
import { AkumaKodoConfigurationInterface, AkumaKodoContainerInterface } from "../../interfaces/Client.ts";
import { CommandScopeType } from "../../interfaces/Command.ts";
import { AkumaKodoCommandModule } from "./CommandModule.ts";

/**
 * Module to handle events
 */
export class AkumaKodoEventModule {
  private launcher: {
    command: AkumaKodoCommandModule;
  };
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
    this.launcher = {
      command: new AkumaKodoCommandModule(this.instance, this.container, this.configuration),
    };
  }

  /**
   * @description - Loads all internal event handlers for the bot client.
   * We handel Development scoped commands only by default. You can call this function again with your scope if you wish to use global commands.
   * @param scope - The scope of the command.
   */
  public async interactionCreateHandler(scope?: CommandScopeType) {
    try {
      if (this.container.fullyReady) {
        await this.launcher.command.updateApplicationCommands("Development").then(() => {
          this.container.logger.debug("info", "Development Commands", "Application commands updated!");
        });

        // Checks if user wants to init global commands
        if (scope === "Global") {
          if (this.configuration.optional.bot_debug_mode) {
            this.container.logger.debug(
              "warn",
              "initialize Internal Events",
              "Global scope not recommended while in development mode!",
            );
          }
          await this.launcher.command.updateApplicationCommands("Global").then(() => {
            this.container.logger.debug("info", "Global Commands", "Global Application commands updated!");
          });
        }
      } else {
        if (this.configuration.optional.bot_internal_events) {
          this.container.logger.debug(
            "warn",
            "initialize Internal Events",
            "Bot is not ready! Internal events will not be loaded.",
          );
        }
      }
    } catch (error) {
      this.container.logger.debug("error", "AkumaKodo Bot Core", "Failed to initialize application commands events.");
      this.container.logger.debug("error", "AkumaKodo Bot Core", error);
      // Only start listening for events after all slash commands are posted!
    } finally {
      // Runs the interactionCreate event for all active slash commands in the bot.
      this.instance.events.interactionCreate = (_, interaction) => {
        if (!interaction.data) return;

        switch (interaction.type) {
          case InteractionTypes.ApplicationCommand:
            try {
              // get the command then run out checks before execution
              const command = this.container.commands.get(interaction.data.name!);
              if (!command) return;

              // check if the user has the permission to run this command
              if (command.userPermissions) {
                const validUserPermissions = validatePermissions(
                  interaction.member?.permissions!,
                  command.userPermissions,
                );

                // If the permission check returns false, we cancel the command.
                if (!validUserPermissions) {
                  if (this.configuration.optional.bot_log_command_reply) {
                    return this.launcher.command.createCommandReply(interaction, {
                      content: `You do not have the required permissions to run this command! Missing: ${
                        command.userPermissions.join(", ")
                      }`,
                    }, true);
                  }
                  return;
                } else {
                  return command.run(interaction);
                }
              }
              if (command.botPermissions) {
                const validBotPermissions = botHasGuildPermissions(
                  this.instance,
                  this.instance.id,
                  command.botPermissions,
                );

                if (!validBotPermissions) {
                  if (this.configuration.optional.bot_log_command_reply) {
                    return this.launcher.command.createCommandReply(interaction, {
                      content: `I do not have the required permissions to run this command! Missing: ${
                        command.botPermissions?.join(", ")
                      }`,
                    }, true);
                  }
                  return;
                } else {
                  return command.run(interaction);
                }
              }
              return command.run(interaction);
            } catch (e) {
              this.container.logger.debug("error", "Interaction create", `Error while running command: ${e}`);
            }
            break;
        }
      };
    }
  }
}
