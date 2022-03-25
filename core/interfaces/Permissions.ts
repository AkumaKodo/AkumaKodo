import { DiscordenoInteraction, Permission } from "../../deps.ts";
import { PermissionLevels } from "../enums/permissions.ts";

export interface PermissionKeyOptions {
    botServerPermissions?: Permission[];
    botChannelPermissions?: Permission[];
    userServerPermissions?: Permission[];
    userChannelPermissions?: Permission[];
    permissionLevels?: permissionLevel | Array<keyof typeof PermissionLevels>;
}
export type permissionLevel = (
    data: DiscordenoInteraction,
) => boolean | Promise<boolean>;
