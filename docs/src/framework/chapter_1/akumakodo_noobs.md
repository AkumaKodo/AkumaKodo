# AkumaKodo - Chapter 1: The Basics

Now that you have your bot application from discord, we can get started creating your bot.

## Exported Classes

In AkumaKodo, everything is an extension of the `Bot` class. The bot class is exported from the `mod.ts` file in our repository as
`AkumaKodoBotCore`.

Exported AkuamKodo classes:

- <ins>AkumaKodoBotCore</ins> - The bot client and main access point of your application.
- <ins>AkumaKodoMongodbProvider</ins> - The mongodb functional controller class that handlers your database.
- <ins>AkumaKodoProvider</ins> - The base provider class if you wish to extend and make your own custom one.
- <ins>AkumaKodoCollection</ins> - The main cache system extended from the js Map class.
- <ins>AkumaKodoEmbed</ins> - The embed class.

## Creating a `mod.ts` file

Now create a file on your computer called `mod.ts` or whatever you like, this file will be your main program file for your bot. This file will container all the
startup functions, loaders, and any configurations you need.

The AkumaKodoBotClient is an extension of [Bot](https://deno.land/x/discordeno@13.0.0-rc18/src/bot.ts) from [discordeno](https://github.com/discordeno/discordeno) so all methods are available in the bot instance as well.

_mod.ts_

```typescript
import { AkumaKodoBotCore } from "https://deno.land/x/akumakodo@0.1.2/mod.ts";

const Bot = new AkumaKodoBotCore(
  // Required deno Options to start the bot
  {
    botId: BigInt("your-bot-id"),
    events: {},
    intents: ["Guilds", "GuildMessages", "GuildMembers"],
    token: "your-bot-token",
  },
  // AkumaKodo options
  {
    optional: {
      bot_debug_mode: true,
      providers: {
        type: "disabled",
      },
    },
    required: {
      bot_development_server_id: BigInt("your-dev-guild-id"),
    },
  },
);

Bot.createBot();
```

And with that your bot will login to the discord api and be online!

### Creating commands

Creating your first command in AkumaKodo is simple. On your `Bot` variable, simply access the `createCommand` function.

```ts
Bot.container.utils.createCommand();
```

This is a utility function to help you create slash commands using the discord api. Under the hood it uses discordeno's rest api to POST to
commands. You can read all the available options for a command [here](https://github.com/AkumaKodo/AkumaKodo/blob/alpha/core/interfaces/Command.ts)

The base options are here:

```ts
// the command trigger that runs the command
trigger:
string;
// The command description
description:
string;
// The command scope
scope:
CommandScopeType;
// Runs the command callback
run:
((data: DiscordenoInteraction) => unknown);
```

Using this interface we can build our command below.

```ts
Bot.container.utils.createCommand(Bot, {
  // The command name
  trigger: "ping",
  // The command description
  description: "Ping me!",
  // The scope - sets the slash command to global or guild only
  scope: "Development",
  // Command callback to run when called
  run: async (interaction) => {
    return await Bot.container.utils.createCommandReply(
      Bot,
      interaction,
      {
        embeds: [
          Bot.container.utils.embed().setColor("random").setDescription(
            `🏓Pong!`,
          ),
        ],
      },
      false,
    );
  },
});
```

### Simple Command explained

The first thing need to make a command is a `trigger`. You can think of this as a keyword AkumaKodo will use when creating your slash command.

The second param is the command description and it should be short and to the point. If you want a longer one, you can use the `extendedDescription`.

The third param is the `scope`. This controls if the command should be published as a global command or development only. As of version **0.1.2** this is required by default
but in the future we may enabled development by default for scopes.

The forth and most fun param is `run`! This function takes a type of **[DiscordenoInteraction](https://doc.deno.land/https://deno.land/x/discordeno@13.0.0-rc18/mod.ts/~/DiscordenoInteraction)** We use this interaction data to execute and respond to the command.

The framework has a built in utility function for responding to slash commands and its called `createCommandReply`. Simply fill out the options and send your response!

Keep in mind all the params above are required to run create any command, more addons can be found [here](https://github.com/AkumaKodo/AkumaKodo/blob/alpha/core/interfaces/Command.ts).

## Creating events

Events are simply to create. We simply use Discordeno's internal event handler. You can access it using:

```ts
Bot.instance.events.ready = (_, payload) => {
  // Do something...
};
```

## Template Bot

FYI - If you want to have a simple starter project out of the box, use our [template](https://github.com/AkumaKodo/templates)!

On the next page we will cover command handling and how you can create a more complex file structure for application.
