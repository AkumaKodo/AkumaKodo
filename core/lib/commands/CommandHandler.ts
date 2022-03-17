import { AkumaKodoController } from "../../AkumaKodoController.ts";
import { AkumaKodoCollection } from "../utils/Collection.ts";
import {AkumaKodoCommand, AkumaKodoCommandHandlerOptions, AkumaKodoSubCommand} from "../../interfaces/Command.ts";
import {ArgOptions, prefixFn} from "../../interfaces/Argument.ts";
import {AkumaKodoInhibitorController} from "../inhibitors/controller.ts";
import {AkumaKodoBotCore} from "../../AkumaKodo.ts";
import {
  DiscordenoInteraction,
  DiscordenoMessage,
  EditGlobalApplicationCommand,
  InteractionTypes,
  MakeRequired,
  getMissingChannelPermissions
} from "../../../deps.ts";
import {CommandHandlerEvents} from "../../enums/constants.ts";

export class AkumaKodoCommandHandler<T extends AkumaKodoBotCore> extends AkumaKodoController<T> {
  declare pool: AkumaKodoCollection<string, AkumaKodoCommand | AkumaKodoSubCommand>;
  IgnoreCooldowns: bigint[];
  owners: bigint[];
  cooldown: number;
  superUsers: bigint[];
  guildOnly: boolean;
  prefix: prefixFn | string | string[];
  handleEdits: boolean;
  handleArgs: boolean;
  inhibitorHandler!: AkumaKodoInhibitorController<AkumaKodoBotCore>;
  generator: ArgumentGenerator;
  commandUtil: boolean;
  storeMessages: boolean;
  mentionPrefix: boolean;
  handleSlashCommands: boolean;
  ratelimit: number;
  cooldowns: AkumaKodoCollection<bigint, number>;
  /** If command is split into multiple files */
  subType: "single" | "multiple";

  public constructor(
      client: T,
      {
        dir = "./commands",
        prefix = undefined,
        IgnoreCooldowns = [],
        owners = [],
        cooldown = 5000,
        ratelimit = 3,
        superUsers = [],
        guildOnly = false,
        handleEdits = false,
        handleArgs = false,
        subType = "single",
        commandUtil = true,
        storeMessages = true,
        mentionPrefix = true,
        handleSlashCommands = false,
      }: AkumaKodoCommandHandlerOptions
  ) {
    super(client, dir);
    this.handleSlashCommands = handleSlashCommands;
    this.commandUtil = commandUtil;
    this.handleEdits = handleEdits;
    this.handleArgs = handleArgs;
    this.client = client;
    this.prefix = prefix;
    this.owners = owners;
    this.cooldown = cooldown;
    this.superUsers = [...owners, ...superUsers];
    this.IgnoreCooldowns = [...IgnoreCooldowns, ...this.superUsers];
    this.guildOnly = guildOnly;
    this.ratelimit = ratelimit;
    this.subType = subType;
    this.storeMessages = storeMessages;
    this.mentionPrefix = mentionPrefix;
    this.start();
  }

  public async init() {
    this.client.on("interactionCreate", async (data: SlashCommandInteraction) => {
      if (data.type === InteractionTypes.ApplicationCommand) return await this.handleSlashCommand(data);
    });
  }

  public get categories() {
    const categories = new AkumaKodoCollection<string, AkumaKodoCollection<string, AkumaKodoCommand>>();
    for (const data of this.modules.values()) {
      if (!(data instanceof AkumaKodoSubCommand)) {
        const exists = categories.get(data.category!);
        if (exists) exists.set(data.id, data);
        else {
          const cc = new AkumaKodoCollection<string, AkumaKodoCommand>();
          cc.set(data.id, data as NaticoCommand);

          categories.set(data.category!, cc);
        }
      }
    }
    return categories;
  }

  public runCooldowns(message: DiscordenoMessage, command: AkumaKodoCommand) {
    const id = message.authorId;
    if (this.IgnoreCD.includes(message.authorId)) return false;

    const time = command.cooldown != null ? command.cooldown : this.cooldown;
    if (!time) return false;

    const endTime = message.timestamp + time;

    if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});

    if (!this.cooldowns.get(id)[command.id]) {
      this.cooldowns.get(id)[command.id] = {
        timer: setTimeout(() => {
          if (this.cooldowns.get(id)[command.id]) {
            clearTimeout(this.cooldowns.get(id)[command.id].timer);
          }
          this.cooldowns.get(id)[command.id] = null;

          if (!Object.keys(this.cooldowns.get(id)).length) {
            this.cooldowns.delete(id);
          }
        }, time),
        end: endTime,
        uses: 0,
      };
    }

    const entry = this.cooldowns.get(id)[command.id];

    if (entry.uses >= command.ratelimit) {
      const end = this.cooldowns.get(id)[command.id].end;
      const diff = end - message.timestamp;

      this.emit(CommandHandlerEvents.COOLDOWN, message, command, diff);
      return true;
    }

    entry.uses++;
    return false;
  }

  public async commandChecks(command: NaticoCommand, message: DiscordenoMessage, args: string | undefined) {
    if (this.inhibitorHandler) {
      if (await this.inhibitorHandler.runChecks(message, command)) return true;
    }

    const authorId = message.authorId.toString();
    if (!this.superusers.includes(message.authorId)) {
      //Otherwise, you would get on cooldown
      if (!(command instanceof AkumaKodoCommand))
        if (this.cooldowns.has(authorId)) {
          if (!this.IgnoreCD.includes(message.authorId)) {
            this.emit(CommandHandlerEvents.COOLDOWN, message, command, args);
            return true;
          }
        }

      if (this.guildonly) {
        if (!message.guildId) {
          this.emit(CommandHandlerEvents.GUILDONLY, message, command, args);
          return true;
        }
      }

      if (command.userPermissions) {
        const missingPermissions = await this.client.helpers.getMissingChannelPermissions(
            this.client,
            message!.channelId,
            message.authorId,
            command.userPermissions
        );
        if (missingPermissions[0]) {
          this.emit(CommandHandlerEvents.USERPERMISSIONS, message, command, args, missingPermissions);
          return true;
        }
      }
      if (command.clientPermissions) {
        const missingPermissions = getMissingChannelPermissions(
            this.client,
            message!.channelId,
            this.client.id,
            command.clientPermissions
        );
        if (missingPermissions[0]) {
          this.emit(CommandHandlerEvents.CLIENTPERMISSIONS, message, command, args, missingPermissions);
          return true;
        }
      }
    }
    if (this.runCooldowns(message, command)) {
      return true;
    }
    if (command.ownerOnly) {
      if (!this.owners.includes(message.authorId)) {
        this.emit(CommandHandlerEvents.OWNERONLY, message, command, args);
        return true;
      }
    }

    if (command.superUserOnly) {
      if (!this.superusers.includes(message.authorId)) {
        this.emit(CommandHandlerEvents.SUPERUSERRONLY, message, command, args);
        return true;
      }
    }
    return false;
  }

  /**
   *
   * @param command - Command that gets executed
   * @param message - Message object to be passed through
   * @param args - arguments to be passed though
   * @returns - What the ran command returned
   */
  public async runCommand(command: NaticoCommand, message: DiscordenoMessage, args?: string) {
    if (await this.commandChecks(command, message, args)) return false;

    try {
      let sub: string | null = null;
      let savedOptions: ArgOptions[] | undefined = undefined;

      if (command?.options && args) {
        if (command?.options[0]?.type == ApplicationCommandOptionTypes.SubCommand) {
          //Thing needs to be defined to not cause mutation
          const thing = args.split(" ")[0].toLowerCase();

          for (const option of command.options) {
            if (option.name === thing) {
              if (this.subType == "multiple") {
                args = args.split(" ").slice(1).join(" ");
                sub = option.name;
                savedOptions = command.options as ArgOptions[];
                command.options = option.options;
              } else {
                const mod = this.modules.find((mod) => {
                  return mod instanceof AkumaKodoSubCommand && mod.subOf == command.name && mod.name == option.name;

                });
                if (mod) {
                  await this.runCommand(mod, message, args.split(" ").slice(1).join(" "));
                  return;
                }
              }
            }
          }
        }
      }
      let data = await this.generator.handleArgs(command, message, args);

      if (this.handleArgs && command.options)
        data = (await this.generator.handleMissingArgs(message, command, data)) as Arguments;

      if (!data) return this.emit("commandEnded", message, command, {}, null);

      if (savedOptions) command.options = savedOptions;

      this.emit("commandStarted", message, command, data);

      const res = sub
          ? //@ts-ignore -
          await command[sub](message, data)
          : await command.exec(message, data);
      this.emit("commandEnded", message, command, data, res);
      /**
       * Adding the user to a set and deleting them later!
       */
    } catch (e: unknown) {
      this.emit("commandError", message, command, e);
    }
  }

  public async handleCommand(message: DiscordenoMessage) {
    if (!message?.content) return;
    if (message.isBot) return;

    const prefixes = typeof this.prefix == "function" ? await this.prefix(message) : this.prefix;
    const parsedPrefixes = [];

    if (Array.isArray(prefixes)) parsedPrefixes.push(...prefixes);
    else parsedPrefixes.push(prefixes);
    if (this.mentionPrefix) parsedPrefixes.push(`<@!${this.client.id}>`, `<@${this.client.id}>`);

    for (const prefix of parsedPrefixes) {
      if (await this.prefixCheck(prefix, message)) return;
    }
  }
  async prefixCheck(prefix: string, message: DiscordenoMessage) {
    if (message.content.toLowerCase().startsWith(prefix)) {
      const commandName = message.content.toLowerCase().slice(prefix.length).trim().split(" ")[0];
      const command = this.findCommand(commandName);
      if (command) {
        if (this.commandUtil) {
          if (this.commandUtils.has(message.id)) {
            message.util = this.commandUtils.get(message.id)!;
          } else {
            message.util = new NaticoCommandUtil(this, message);
            this.commandUtils.set(message.id, message.util);
          }
        }
        message.util?.setParsed({ prefix, alias: commandName });
        const args = message.content.slice(prefix.length).trim().slice(commandName.length).trim();
        await this.runCommand(command, message, args);
        return true;
      }
    }
  }

  /**
   * Simple function to find a command could be useful outside of the handler
   * @param command - Command you want to search for
   * @returns Command object or undefined
   */
  public findCommand(command: string | undefined): NaticoCommand | undefined {
    return this.modules.find((cmd) => {
      if (cmd instanceof NaticoSubCommand) return false;
      if (cmd.name == command) {
        return true;
      }
      if (cmd.aliases) {
        if (cmd.aliases.includes(<string>command)) {
          return true;
        }
      }
      return false;
    });
  }
  /**
   * Check if commands have slash data and if they do it will activete it
   * be carefull to no accidentally enable them globally,
   * first searches if the command is already enabled and if it changed since and edit it accordingly otherwise creates a command
   * also deletes unused slash commands
   * @param guildID - Specific guild to enable slash commands on
   * @returns - List of enabled commands
   */
  public async enableSlash(guildID?: bigint) {
    const slashed = this.slashed();
    await this.client.helpers.upsertApplicationCommands(slashed, guildID);
    return slashed;
  }
  public slashed(): any {
    const commands: EditGlobalApplicationCommand[] = [];
    const data = this.modules.filter((command) => command.slash || false);
    data.forEach((command: NaticoCommand) => {
      const slashdata: MakeRequired<EditGlobalApplicationCommand, "name"> = {
        name: command.name || command.id,
        description: command.description || "no description",
      };
      const options: ArgOptions[] = [];
      if (command.options) {
        command.options.forEach((option) => {
          options.push({
            name: option.name,
            description: option.description,
            choices: option.choices,
            options: option.options,
            type: option.type,
            required: option.required,
            channel_types: option.channel_types,
            min_value: option.min_value,
            max_value: option.max_value,
            autocomplete: option.autocomplete,
          });
        });
      }
      if (command.options) slashdata["options"] = options;
      commands.push(slashdata);
    });
    return commands;
  }
  public async handleSlashCommand(interaction: DiscordenoInteraction) {
    const args: ConvertedOptions = {};
    if (interaction?.data?.options)
      for (const option of interaction.data?.options) {
        if (option?.value) {
          args[option.name] = option.value;
        }
      }
    const command = this.findCommand(interaction?.data?.name);
    if (!command) return;
    let sub: string | null = null;
    if (command?.options) {
      if (command?.options[0]?.type == ApplicationCommandOptionTypes.SubCommand) {
        sub = interaction?.data?.options?.[0]?.name!;
        if (interaction?.data?.options?.[0]?.options)
          for (const option of interaction.data?.options[0]?.options) {
            if (option?.value) {
              args[option.name] = option.value;
            }
          }
        for (const option of command.options) {
          if (option.name === sub) {
            if (this.subType == "multiple") {
              command.options = option.options;
            } else {
              const mod = this.modules.find((mod) => {
                if (mod instanceof NaticoSubCommand && mod.subOf == command.name && mod.name == option.name) {
                  return true;
                }
                return false;
              });
              if (mod) {
                try {
                  this.emit("commandStarted", interaction, command, args);
                  const res = await mod.exec(interaction, args);
                  this.emit("commandEnded", interaction, command, args, res);
                  return;
                } catch (e) {
                  this.emit("commandError", interaction, command, e);
                }
              }
            }
          }
        }
      }
    }
    try {
      this.emit("commandStarted", interaction, command, args);
      //@ts-ignore -
      const res = sub ? await command[sub](interaction, args) : await command.exec(interaction, args);
      this.emit("commandEnded", interaction, command, args, res);
    } catch (e) {
      this.emit("commandError", interaction, command, e);
    }
  }
  public setInhibitorHandler(inhibitorHandler: NaticoInhibitorHandler) {
    this.inhibitorHandler = inhibitorHandler;
  }
}
