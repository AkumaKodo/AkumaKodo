import { AtLeastOne } from "../../../../deps.ts";
import { collector, collectorStorage } from "../../../interfaces/Collector.ts";

/**
 * The collector controller for components
 * @param key The key of the collector
 * @param storage The storage of the collector
 * @param options The options of the collector
 * @returns
 */
export function createComponentCollector<
    T,
    E extends any = never,
    Z extends Record<string, any> | undefined = undefined,
>(
    key: E,
    storage: collectorStorage<T, E, Z>,
    options?: AtLeastOne<{
        /** When the collector expires in ms.
         * @default 60s */
        ttl: number;
        collectCondition: collector<T, E, Z>["collectCondition"];
        resolveCondition: collector<T, E, Z>["resolveCondition"];
        collectorState: Z;
    }>,
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        storage.set(key, {
            key: key,
            expires: Date.now() + (options?.ttl ?? 60000),
            resolve,
            reject,
            collectCondition: options?.collectCondition,
            resolveCondition: options?.resolveCondition,
            // @ts-ignore 2322
            state: options?.collectorState,
        });
    });
}
