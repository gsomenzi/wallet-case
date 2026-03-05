import { Inject, Injectable } from "@nestjs/common";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AcquirerProcessor } from "../acquirer-processor.interface";

const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 2500;

@Injectable()
export class MockAcquirerProcessor implements AcquirerProcessor {
    delaySimulator: DelaySimulator;
    constructor(@Inject(DelaySimulator) delaySimulator: DelaySimulator) {
        this.delaySimulator = delaySimulator;
    }

    async process(): Promise<boolean> {
        return this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS).then(() => true);
    }
}
