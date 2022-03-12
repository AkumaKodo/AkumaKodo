import { AkumaKomoBot } from "../AkumaKodo.ts";
import { Milliseconds } from "../utils/Helpers.ts";

const membersInCooldown = new Map<string, Cooldown>();

export interface Cooldown {
  used: number;
  timestamp: number;
}

AkumaKomoBot.inhibitorCollection.set("cooldown", (message, command, options) => {
  const commandCooldown = command.cooldown || AkumaKomoBot.defaultCooldown;
  if (
    !commandCooldown ||
    (options?.memberId &&
      (AkumaKomoBot.ignoreCooldown?.includes(options?.memberId) ||
        command.ignoreCooldown?.includes(options.memberId)))
  ) {
    return true;
  }

  const key = `${options!.memberId!}-${command.name}`;
  const cooldown = membersInCooldown.get(key);
  if (cooldown) {
    if (cooldown.used >= (commandCooldown.allowedUses || 1)) {
      const now = Date.now();
      if (cooldown.timestamp > now) {
        return {
          type: "cooldown",
          value: {
            expiresAt: Date.now() + commandCooldown.seconds * 1000,
            executedAt: Date.now(),
          },
        };
      } else {
        cooldown.used = 0;
      }
    }

    membersInCooldown.set(key, {
      used: cooldown.used + 1,
      timestamp: Date.now() + commandCooldown.seconds * 1000,
    });
    return {
      type: "cooldown",
      value: {
        expiresAt: Date.now() + commandCooldown.seconds * 1000,
        executedAt: Date.now(),
      },
    };
  }

  membersInCooldown.set(key, {
    used: 1,
    timestamp: Date.now() + commandCooldown.seconds * 1000,
  });
  return true;
});

setInterval(() => {
  const now = Date.now();

  membersInCooldown.forEach((cooldown, key) => {
    if (cooldown.timestamp > now) return;
    membersInCooldown.delete(key);
  });
}, Milliseconds.Second * 30);
