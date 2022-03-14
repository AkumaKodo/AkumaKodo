import { MessageCommand } from "../../interfaces/Command.ts";
import { ArgumentDefinition } from "../../interfaces/Arugment.ts";
import { AkumaKodoBot, AkumaKodoCollection, Milliseconds } from "../AkumaKodo.ts";
import { AkumaKodoLogger } from "../../../internal/logger.ts";
import { DiscordenoMessage } from "https://deno.land/x/discordeno@13.0.0-rc18/src/transformers/message.ts";
import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";

/**
 * Message Command creator for the AkumaKodo Bot
 * @param bot
 * @param command
 */
export function createMessageCommand<T extends readonly ArgumentDefinition[]>(
  bot: AkumaKodoBotInterface,
  // deno-lint-ignore no-explicit-any
  command: MessageCommand<any>,
) {
  bot.messageCommands.set(command.name, command as MessageCommand<any>);
  AkumaKodoLogger("info", "createMessageCommand", `Created message command ${command.name}`);
}

/*Creates a subcommand for a valid message command*/
export function createMessageSubcommand<
  T extends readonly ArgumentDefinition[],
>(
  bot: AkumaKodoBotInterface,
  commandName: string,
  subcommand: Omit<MessageCommand<T>, "category">,
  retries = 0,
) {
  const names = commandName.split("-");
  let command: MessageCommand<T> | typeof subcommand = bot.messageCommands.get(
    commandName,
  )! as MessageCommand<T>;

  if (names.length > 1) {
    for (const name of names) {
      const validCommand = command ? command.subcommands?.get(name) : bot.messageCommands.get(name);

      if (!validCommand) {
        if (retries === 20) break;
        setTimeout(
          () => createMessageSubcommand(bot, commandName, subcommand, retries++),
          Milliseconds.Second * 10,
        );
        return;
      }

      command = validCommand as MessageCommand<T>;
    }
  }

  if (!command) {
    // If 10 minutes have passed something must have been wrong
    if (retries === 20) {
      throw `The command with name "${command}" does not exist!`;
    }

    // Try again in 10 seconds in case this command file just has not been loaded yet.
    setTimeout(
      () => createMessageSubcommand(bot, commandName, subcommand, retries++),
      Milliseconds.Second * 10,
    );
    return;
  }

  if (!command.subcommands) {
    command.subcommands = new AkumaKodoCollection();
  }

  // log.debug("Creating subcommand", command.name, subcommand.name);
  command.subcommands.set(subcommand.name, subcommand);
}

async function executeCommand(
  bot: AkumaKodoBotInterface,
  message: DiscordenoMessage,
  // deno-lint-ignore no-explicit-any
  command: MessageCommand<any>,
  args: string[],
) {
  const Args = await parseArguments(bot, message, command, args);
  if (Args.value) {
    return bot.events.commands.error?.({
      message,
      error: Args as unknown as Error,
    });
  }
  const [argument] =
    // deno-lint-ignore no-explicit-any
    command.arguments?.filter((e: any) => e.type == "subcommand") || [];
  // console.log(argument);
  const subcommand = argument
    ? ((Args as { [key: string]: unknown })[
      argument.name
      // deno-lint-ignore no-explicit-any
    ] as MessageCommand<any>)
    : undefined;
  try {
    if (!argument || argument.type !== "subcommand" || !subcommand) {
      if (
        AkumaKodoBot.inhibitorCollection.some(
          (e) =>
            e(bot, command, {
              channelId: message.channelId,
              guildId: message.guildId,
              memberId: message.authorId,
            }) !== true,
        )
      ) {
        return bot.events.commands.error?.({
          message,
          error: "Inhibitor failed",
        });
      }
      // @ts-ignore -
      command.execute?.(bot, message, Args);
    } else if (
      ![subcommand?.name, ...(subcommand?.aliases || [])].includes(args[0])
    ) {
      await executeCommand(bot, message, subcommand!, args);
      AkumaKodoLogger("info", "executeCommand", `Executed Message Command ${subcommand?.name}`);
    } else {
      const subArgs = args.slice(1);
      await executeCommand(bot, message, subcommand!, subArgs);
      AkumaKodoLogger("info", "executeCommand", `Executed Message Subcommand Command ${subcommand?.name}`);
    }
  } catch (e) {
    if (bot.events.commands.error) {
      bot.events.commands.error({
        message,
        error: "Error running command!",
      });
    } else throw e;
  }
}

async function parseArguments(
  bot: AkumaKodoBotInterface,
  message: DiscordenoMessage,
  // deno-lint-ignore no-explicit-any
  command: MessageCommand<any>,
  parameters: string[],
) {
  const args: { [key: string]: unknown } = {};
  if (!command?.arguments) return args;

  let missingRequiredArg = false;

  // Clone the parameters, so we can modify it without editing original array
  const params = [...parameters];

  const missedRequiredArgs = [];

  // Loop over each argument and validate
  for (const argument of command.arguments) {
    const resolver = bot.argumentsCollection?.get(argument.type || "string");
    if (!resolver) continue;

    const result = await resolver.execute(
      argument,
      params,
      message,
      command,
    );
    if (result !== undefined) {
      // Assign the valid argument
      args[argument.name] = result;
      // This will use up all args so immediately exist the loop.
      if (
        argument.type &&
        [
          "number",
          "emoji",
          "...emojis",
          "string",
          "...strings",
          "boolean",
          "subcommand",
          "member",
          "role",
          "...roles",
          "categorychannel",
          "newschannel",
          "guildtextchannel",
          "voicechannel",
          "command",
          "duration",
          "guild",
          "snowflake",
          "...snowflake",
          "nestedcommand",
        ].includes(argument.type)
      ) {
        break;
      }
      // Remove a param for the next argument
      params.shift();
      continue;
    }

    // Invalid arg provided.
    if (Object.prototype.hasOwnProperty.call(argument, "defaultValue")) {
      args[argument.name] = argument.defaultValue;
    } else if (argument.required !== false) {
      if (argument.missing) {
        missingRequiredArg = true;
        argument.missing?.(bot, message);
        break;
      }

      missedRequiredArgs.push(argument.name);
      missingRequiredArg = true;
      argument.missing?.(bot, message);
      break;
    }
  }

  // If an arg was missing then return false, so we can error out as an object {} will always be truthy
  return missingRequiredArg
    ? ({
      type: "MISSING_REQUIRED_ARGUMENTS",
      value: missedRequiredArgs[0],
    } as MissingRequiredArguments)
    : args;
}

interface MissingRequiredArguments {
  type: string;
  value: string;
}

export async function handleMessageCommands(
  bot: AkumaKodoBotInterface,
  message: DiscordenoMessage,
) {
  const messageContentParsePrefix = typeof AkumaKodoBot.prefix == "function"
    // @ts-ignore - Type error ignore
    ? await bot.prefix(message)
    : bot.prefix;
  let prefix = typeof messageContentParsePrefix == "string"
    ? messageContentParsePrefix
    : messageContentParsePrefix?.find((p: string) => message.content.startsWith(p));

  // Allows the bot to reply to command with a mention if enabled
  if (!prefix && bot.mentionWithPrefix) prefix = `<@${bot.id}>`;

  if (
    !prefix ||
    (typeof bot.prefix == "string" && !message.content.startsWith(prefix))
  ) {
    return;
  }

  const args = message.content.split(" ").filter((e) => Boolean(e.length));
  const commandName = args.shift()?.slice(prefix.length);
  const command = bot.messageCommands.find((cmd) =>
    Boolean(cmd.name == commandName || cmd.aliases?.includes(commandName!))
  );
  if (!command) return;
  if (message.guildId && !bot.members.has(message.authorId)) {
    bot.members.set(
      bot.transformers.snowflake(`${message.guildId}${message.guildId}`),
      message.member ??
        (await bot.helpers.getMember(message.guildId, message.authorId)),
    );
  }
  if (message.guildId && !bot.guilds.has(message.guildId)) {
    bot.guilds.set(
      message.guildId,
      await bot.helpers.getGuild(message.guildId, { counts: true }),
    );
  }
  if (!bot.channels.has(message.channelId)) {
    bot.channels.set(
      message.channelId,
      await bot.helpers.getChannel(message.channelId),
    );
  }
  bot.events.commands.create?.(command, message);
  await executeCommand(bot, message, command, args);
  bot.events.commands.destroy?.(command, message);
}
