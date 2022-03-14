import { AkumaKodoBot } from "../AkumaKodo.ts";
import { AkumaKodoLogger } from "../../../internal/logger.ts";

AkumaKodoBot.events.debug = (d) => {
  AkumaKodoLogger("debug", "debug event", `${d ? d : "No data provided from debug event"}`);
};
