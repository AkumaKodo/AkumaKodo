// Core lib exports

import {AkumaKodoLogger} from "./internal/logger.ts";

export * from "./core/lib/AkumaKodo.ts";

AkumaKodoLogger("debug", "compile", "AkumaKodo has compiled successfully.");
Deno.exit(0);
