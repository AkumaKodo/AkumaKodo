import { AkumaKodoCollection } from "../lib/utils/Collection.ts";

export interface collector<
    T,
    E,
    Z extends Record<string, any> | undefined = undefined,
> {
    key: E;
    expires?: number;
    state: Z;
    collectCondition?: (value: T) => boolean;
    resolveCondition?: (value: T) => boolean;
    resolve: (value: T) => void;
    // deno-lint-ignore no-explicit-any
    reject: (reason?: any) => void;
}
// deno-lint-ignore no-explicit-any
export type collectorStorage<
    T,
    E,
    Z extends Record<string, any> | undefined = undefined,
> = AkumaKodoCollection<
    E,
    collector<T, E, Z>
>;
