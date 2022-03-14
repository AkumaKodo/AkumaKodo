import { MessageCommand } from "../interfaces/Command.ts";
import { ArgumentDefinition } from "../interfaces/Arugment.ts";
import { AkumaKodoBot, AkumaKodoCollection, Milliseconds } from "./AkumaKodo.ts";
import { AkumaKodoLogger } from "../../internal/logger.ts";
import { DiscordenoMessage } from "https://deno.land/x/discordeno@13.0.0-rc18/src/transformers/message.ts";

/**
 * Message Command creator for the AkumaKodo Bot
 * @param command
 */
export function createMessageCommand<T extends readonly ArgumentDefinition[]>(
  // deno-lint-ignore no-explicit-any
  command: MessageCommand<any>,
) {
  AkumaKodoBot.messageCommands.set(command.name, command as MessageCommand<any>);
  AkumaKodoLogger("info", "createMessageCommand", `Created message command ${command.name}`);
}

/*Creates a subcommand for a valid message command*/
export function createMessageSubcommand<
  T extends readonly ArgumentDefinition[],
>(
  commandName: string,
  subcommand: Omit<MessageCommand<T>, "category">,
  retries = 0,
) {
  const names = commandName.split("-");
  let command: MessageCommand<T> | typeof subcommand = AkumaKodoBot.messageCommands.get(
    commandName,
  )! as MessageCommand<T>;

  if (names.length > 1) {
    for (const name of names) {
      const validCommand = command ? command.subcommands?.get(name) : AkumaKodoBot.messageCommands.get(name);

      if (!validCommand) {
        if (retries === 20) break;
        setTimeout(
          () => createMessageSubcommand(commandName, subcommand, retries++),
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
      () => createMessageSubcommand(commandName, subcommand, retries++),
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
  message: DiscordenoMessage,
  // deno-lint-ignore no-explicit-any
  command: MessageCommand<any>,
  args: string[],
) {
  const Args = await parseArguments(message, command, args);
  if (Args.value) {
    return AkumaKodoBot.events.commands.error?.({
      message,
      error: Args as unknown as Error,
    });
  }
  const [argument] =
    // deno-lint-ignore no-explicit-any
    command.arguments?.filter((e: any) => e.type == "subcommand") || [];
  console.log(argument);
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
            e(message, command, {
              channelId: message.channelId,
              guildId: message.guildId,
              memberId: message.authorId,
            }) !== true,
        )
      ) {
        return AkumaKodoBot.events.commands.error?.({
          message,
          error: "Inhibitor failed",
        });
      }
      // @ts-ignore -
      command.execute?.(AkumaKodoBot, message, Args);
    } else if (
      ![subcommand?.name, ...(subcommand?.aliases || [])].includes(args[0])
    ) {
      await executeCommand(message, subcommand!, args);
      AkumaKodoLogger("info", "executeCommand", `Executed Message Command ${subcommand?.name}`);
    } else {
      const subArgs = args.slice(1);
      await executeCommand(message, subcommand!, subArgs);
      AkumaKodoLogger("info", "executeCommand", `Executed Message Subcommand Command ${subcommand?.name}`);
    }
  } catch (e) {
    if (AkumaKodoBot.events.commands.error) {
      AkumaKodoBot.events.commands.error({
        message,
        error: "Error running command!",
      });
    } else throw e;
  }
}

async function parseArguments(
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
    const resolver = AkumaKodoBot.argumentsCollection?.get(argument.type || "string");
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
        argument.missing?.(AkumaKodoBot, message);
        break;
      }

      missedRequiredArgs.push(argument.name);
      missingRequiredArg = true;
      argument.missing?.(AkumaKodoBot, message);
      break;
    }
  }

  // If an arg was missing then return false so we can error out as an object {} will always be truthy
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
  message: DiscordenoMessage,
) {
  const messageContentParsePrefix = typeof AkumaKodoBot.prefix == "function"
    ? await AkumaKodoBot.prefix(message)
    : AkumaKodoBot.prefix;
  let prefix = typeof messageContentParsePrefix == "string"
    ? messageContentParsePrefix
    : messageContentParsePrefix?.find((p) => message.content.startsWith(p));

  // Allows the bot to reply to command with a mention if enabled
  if (!prefix && AkumaKodoBot.mentionWithPrefix) prefix = `<@${AkumaKodoBot.id}>`;

  if (
    !prefix ||
    (typeof AkumaKodoBot.prefix == "string" && !message.content.startsWith(prefix))
  ) {
    return;
  }

  const args = message.content.split(" ").filter((e) => Boolean(e.length));
  const commandName = args.shift()?.slice(prefix.length);
  const command = AkumaKodoBot.messageCommands.find((cmd) =>
    Boolean(cmd.name == commandName || cmd.aliases?.includes(commandName!))
  );
  if (!command) return;
  if (message.guildId && !AkumaKodoBot.members.has(message.authorId)) {
    AkumaKodoBot.members.set(
      AkumaKodoBot.transformers.snowflake(`${message.guildId}${message.guildId}`),
      message.member ??
        (await AkumaKodoBot.helpers.getMember(message.guildId, message.authorId)),
    );
  }
  if (message.guildId && !AkumaKodoBot.guilds.has(message.guildId)) {
    AkumaKodoBot.guilds.set(
      message.guildId,
      await AkumaKodoBot.helpers.getGuild(message.guildId, { counts: true }),
    );
  }
  if (!AkumaKodoBot.channels.has(message.channelId)) {
    AkumaKodoBot.channels.set(
      message.channelId,
      await AkumaKodoBot.helpers.getChannel(message.channelId),
    );
  }
  AkumaKodoBot.events.commands.create?.(command, message);
  executeCommand(message, command, args);
  AkumaKodoBot.events.commands.destroy?.(command, message);
}
