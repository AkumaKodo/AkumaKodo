import {AkumaKomoBot} from "../AkumaKodo.ts";
import {MessageCommand} from "../../interfaces/Command.ts";

AkumaKomoBot.argumentsCollection.set('subcommand', {
  name: "subcommand",
  execute: (argument, params, message, command) => {
      const [subcommandName] = params;

      const sub = command.subcommands?.find(
          (sub) => sub.name === subcommandName || Boolean(sub.aliases?.includes(subcommandName))
      );
      if (sub) return sub;

      return typeof argument.defaultValue === "string" ? command.subcommands?.get(argument.defaultValue) : undefined;
  },
})

AkumaKomoBot.argumentsCollection.set('nestedcommand', {
  name: "nestedcommand",
  execute: (_argument, params) => {
      let command = AkumaKomoBot.messageCommand.get(params.join("\n").toLowerCase());
      if (command) return command;

      for (const word of params) {
          // deno-lint-ignore no-explicit-any
          const isCommand: MessageCommand<any> | undefined = command
              ? // IF A COMMAND WAS FOUND WE SEARCH FOR ITS SUBCOMMANDS
              command.subcommands?.get(word)
              : // ELSE FIND THE VALID COMMAND OR COMMAND BY ITS ALIAS
              AkumaKomoBot.messageCommand.get(word) || AkumaKomoBot.messageCommand.find((cmd) => Boolean(cmd.aliases?.includes(word)));
          if (!isCommand) continue;

          command = isCommand;
      }

      return command;
  },
})

AkumaKomoBot.argumentsCollection.set('command', {
    name: "command",
    execute: (_argument, params) => {
        const [name] = params;
        if (!name) return;

        const commandName = name.toLowerCase();
        const command = AkumaKomoBot.messageCommand.get(commandName);
        if (command) return command;

        // Check if it's an alias
        return AkumaKomoBot.messageCommand.find((cmd) => Boolean(cmd.aliases?.includes(commandName)));
    },
})

AkumaKomoBot.argumentsCollection.set('', {
    name: "",
    execute: (_argument, params, message) => {

    },
})