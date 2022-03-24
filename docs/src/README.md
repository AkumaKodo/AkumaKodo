# Introduction

AkumaKodo (Pronounced: Ah-Ku-Ma Code Oh) is a discord deno bot framework written
in `TypeScript and deno`. It is designed to be a `modular and extensible` framework that
extends the functionality of the deno runtime. It is designed to be easy to use while
maintaining a high level of `performance`.

![AkumaKodo logo](images/misc/AkumaKodoLogo.png)

![GitHub commit activity](https://img.shields.io/github/commit-activity/y/AkumaKodo/AkumaKodo?style=for-the-badge)
![GitHub contributors](https://img.shields.io/github/contributors/AkumaKodo/AkumaKodo?style=for-the-badge)
![GitHub Repo stars](https://img.shields.io/github/stars/AkumaKodo/AkumaKodo?style=for-the-badge)
![Lines of code](https://img.shields.io/tokei/lines/github/AkumaKodo/AkumaKodo?style=for-the-badge)
![GitHub repo size](https://img.shields.io/github/repo-size/AkumaKodo/AkumaKodo?style=for-the-badge)
![Discord](https://img.shields.io/discord/837830514130812970?style=for-the-badge)

_The framework is build on discordeno version [13.0.0-rc18](https://deno.land/x/discordeno@13.0.0-rc18)_

### Inspiration

We took inspiration from these frameworks to help develop AkumaKodo into the tool it is today, thanks to all these great developers!

- [Natico](https://github.com/naticoo)
- [discord-akairo](https://discord-akairo.github.io/#/)
- [Amethyst](https://github.com/AmethystFramework)
- [discord.js-Commando](https://github.com/discordjs/Commando)

## Why use AkumaKodo

- Command driven framework
- Utilities to make development easier
- Internal framework debug mode
- Pre-built Database providers

## Why not use AkumaKodo

- You don't know javascript basics.
- Don't want to use the deno runtime.
- You like functional programming only.

## Installation

```
deno install https://deno.land/x/akumakodo@0.1.3/mod.ts
```

_akumakodo will be installed in your deno cache_

## Example bot

```typescript
import { AkumaKodoBotCore } from "https://deno.land/x/akumakodo@0.1.3/mod.ts";
import { config as dotEnvConfig } from "https://deno.land/x/dotenv@v3.1.0/mod.ts";

const env = dotEnvConfig({ export: true });
const TOKEN = env.DISCORD_BOT_TOKEN || "";

// Bot configuration
const Bot = new AkumaKodoBotCore(
  {
    botId: BigInt("your-bot-id"),
    events: {},
    intents: ["Guilds", "GuildMessages", "GuildMembers"],
    token: TOKEN,
  },
  {
    optional: {
      // False by default but we recommend using the built in logging system
      bot_debug_mode: false,
      providers: {
        type: "disabled",
      },
    },
    required: {
      bot_development_server_id: BigInt("your-guild-id"),
    },
  },
);

// Our own custom event handler
Bot.client.events.ready = (_, payload) => {
  Bot.container.logger.log("info", "ready", "Online and ready to work!");
};

// Creates a command
Bot.container.utils.createCommand(Bot, {
  trigger: "ping",
  description: "ping pong me!",
  scope: "Development",
  run: async (interaction) => {
    await Bot.container.utils.createCommandReply(
      Bot,
      interaction,
      {
        embeds: [
          Bot.container.utils.embed().setColor("random").setDescription("pong!"),
        ],
      },
      false,
    );
  },
});

// Creates ws connection and starts listening
await Bot.createBot();
```

Now simply run the script below to start your bot!

```
deno run -A ./<file>.ts
```
