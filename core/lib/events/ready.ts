import { AkumaKodoBot } from "../AkumaKodo.ts";
import { AkumaKodoLogger } from "../../../internal/logger.ts";

AkumaKodoBot.events.ready = (_, payload) => {
  if (payload.shardId + 1 === AkumaKodoBot.ws.maxShards) {
    init();
  }
};

function init() {
  // TODO Push slash commands

  AkumaKodoBot.fullyReady = true;

  AkumaKodoLogger("info", "EVENT READY", "AkumaKodo Framework is ready and online!");
}
