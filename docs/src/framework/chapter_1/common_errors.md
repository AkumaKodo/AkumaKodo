# Common Errors

When developing in any technology we often come across some hardships, well here is a list of possible errors you may see in our framework
when developing and how you can possibly fix them.

Remember, you can always ask more questions at our [@discord]() server if nothing here helps.

## Framework Errors

### Authorization token 403

```
[403] The Authorization token you passed did not have permission to the resource.
at Object.runMethod
(https://deno.land/x/discordeno@13.0.0-rc18/src/rest/runMethod.ts:21:9)
at upsertApplicationCommands
(https://deno.land/x/discordeno@13.0.0-rc18/src/helpers/interactions/commands/upsertApplicationCommands.ts:19:33)
```

If you have seen this error on start-up of your bot it could mean a few things:

1. You don't have permissions to upload slash commands in this server. In discord, a bot needs to be in the server to upload slash commands.
   So make sure your development guild id in your bot configuration is correct. [Review](akumakodo_noobs.md) this page for the first steps.

   Also keep in mind that discordeno uses type [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) over number so make sure you entered your application id as `BigInt("your-id")`.
   This goes for your guild id to.

2. Another reason for this error may be your bot was not invited with the `application.commands` scope. Make sure your bots invite url has
   this scope, kick the bot and reinvite it.

   Example url: _https://discord.com/api/oauth2/authorize?client_id=your-id&permissions=0&scope=bot%20`applications.commands`_

### Owner Only Commands

In AkumaKodo command have the param `devOnly`. The command handler checks the cache for the list of bot owners by id on each command with this param.
If your the bot owner make sure you have:

```ts
bot_owners_ids: [BigInt("your-id")],
```

in your bot configuration. At startup, the bot will save this Array of BitInt ID's. If you want you can also fetch all bot application owners from the discord
api. You can enabled `bot_fetch_owners: true`.
