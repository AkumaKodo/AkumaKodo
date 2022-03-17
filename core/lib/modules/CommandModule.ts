import { AkumaCreateBotOptions } from "../../interfaces/Client.ts";
import { AkumaKodoModule } from "./mod.ts";
import { AkumaKodoCommand } from "../../interfaces/Command.ts";

export class AkumaKodoCommandModule extends AkumaKodoModule {
  public constructor(config: AkumaCreateBotOptions) {
    super(config);
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
    const command: AkumaKodoCommand | undefined = this.container.commands.get(trigger)
    if(command) {
      return command;
    } else {
      return undefined;
    }
  }

  
}
