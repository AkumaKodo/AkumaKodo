// Core lib exports
import { AkumaKodoLogger } from "./packages/internal/logger.ts";

export * from "./packages/core/lib/AkumaKodo.ts";

AkumaKodoLogger("debug", "compile", "AkumaKodo has compiled successfully.");
Deno.exit(0);
