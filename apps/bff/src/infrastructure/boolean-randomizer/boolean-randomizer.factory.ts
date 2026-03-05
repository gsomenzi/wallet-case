import { BooleanRandomizer } from "./boolean-randomizer.interface";
import { DefaultBooleanRandomizer } from "./implementations/default-boolean-randomizer";

export enum BooleanRandomizerType {
    Default = "default",
}

export type CreateBooleanRandomizerOptions = {
    type: BooleanRandomizerType.Default;
    trueProbability?: number;
};

export function createBooleanRandomizer(
    options: CreateBooleanRandomizerOptions = { type: BooleanRandomizerType.Default }
): BooleanRandomizer {
    switch (options.type) {
        case BooleanRandomizerType.Default:
            return new DefaultBooleanRandomizer(options.trueProbability);
        default:
            throw new Error(`Unsupported boolean randomizer type: ${options.type}`);
    }
}
