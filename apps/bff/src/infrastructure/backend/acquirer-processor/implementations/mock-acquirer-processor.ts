import { Inject, Injectable } from "@nestjs/common";
import { AcquirerProcessingFailedError } from "src/application/application-errors/acquirer-processing-error";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AcquirerProcessor } from "../acquirer-processor.interface";

const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 2500;

@Injectable()
export class MockAcquirerProcessor implements AcquirerProcessor {
    constructor(
        @Inject(BooleanRandomizer) private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator
    ) {}

    async process(): Promise<boolean> {
        await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
        if (!this.booleanRandomizer.randomize()) {
            throw new AcquirerProcessingFailedError({
                minDelayMs: MIN_DELAY_MS,
                maxDelayMs: MAX_DELAY_MS,
            });
        }
        return true;
    }
}
