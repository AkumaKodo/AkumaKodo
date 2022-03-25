import { DiscordenoInteraction, MessageComponents } from "../../../../deps.ts";
import { collector } from "../../../interfaces/Collector.ts";
import { AkumaKodoCollection } from "../Collection.ts";
import { createComponentCollector } from "./mod.ts";

export const modalCollectors = new AkumaKodoCollection<
    string,
    modalCollector
>();
export function createModalCollector(
    options:
        & Partial<{
            /** @default 60s */
            expires: number;
            collectCondition: modalCollector["collectCondition"];
        }>
        & {
            /** custom id of the modal */
            id: string;
        },
) {
    return createComponentCollector(options.id, modalCollectors, {
        ttl: options?.expires,
        collectCondition: options?.collectCondition,
        collectorState: undefined,
    });
}
type modalCollector = collector<
    {
        components: MessageComponents;
        interaction: DiscordenoInteraction;
    },
    string
>;
