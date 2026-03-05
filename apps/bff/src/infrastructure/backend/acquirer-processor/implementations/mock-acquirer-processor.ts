import { Inject, Injectable } from "@nestjs/common";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AcquirerProcessor } from "../acquirer-processor.interface";

const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 2500;

@Injectable()
export class MockAcquirerProcessor implements AcquirerProcessor {
    delaySimulator: DelaySimulator;
    booleanRandomizer: BooleanRandomizer;
    constructor(
        @Inject(BooleanRandomizer) booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) delaySimulator: DelaySimulator
    ) {
        this.booleanRandomizer = booleanRandomizer;
        this.delaySimulator = delaySimulator;
    }

    async process(): Promise<boolean> {
        await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
        if (!this.booleanRandomizer.randomize()) {
            throw new Error("Acquirer processing failed");
        }
        return true;
    }
}
