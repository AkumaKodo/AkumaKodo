import { AkumaKomoBot } from "../AkumaKodo.ts";
import { snowflakeToBigint } from "../utils/Helpers.ts";

AkumaKomoBot.argumentsCollection.set("...roles", {
  name: "...roles",
  execute: (_argument, params, message) => {
    if (!params.length) return;

    const guild = AkumaKomoBot.guilds.get(message.id);
    if (!guild) return;

    return params.map((word) => {
      const roleIdOrName = word.startsWith("<@&") ? word.substring(3, word.length - 1) : word.toLowerCase();

      const role = /^[\d+]{17,}$/.test(roleIdOrName)
        ? guild.roles.get(snowflakeToBigint(roleIdOrName))
        : guild.roles.find((r) => r.name.toLowerCase() === roleIdOrName);
      if (role) return role;
    });
  },
});

AkumaKomoBot.argumentsCollection.set("role", {
  name: "role",
  execute: (_argument, params, message) => {
    const [id] = params;
    if (!id) return;

    const guild = AkumaKomoBot.guilds.get(message.id);
    if (!guild) return;

    const roleIdOrName = id.startsWith("<@&") ? id.substring(3, id.length - 1) : id.toLowerCase();

    const role = /^[\d+]{17,}$/.test(roleIdOrName)
      ? guild.roles.get(snowflakeToBigint(roleIdOrName))
      : guild.roles.find((r) => r.name.toLowerCase() === roleIdOrName);
    if (role) return role;

    // No role was found, let's list roles for better user experience.
    const possibleRoles = guild.roles.filter((r) => r.name.toLowerCase().startsWith(roleIdOrName));
    if (!possibleRoles.size) return;

    return possibleRoles;
  },
});
