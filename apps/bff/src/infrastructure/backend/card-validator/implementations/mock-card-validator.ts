import { Inject, Injectable } from "@nestjs/common";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { CardValidator } from "../card-validator.interface";

const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

@Injectable()
export class MockCardValidator implements CardValidator {
    delaySimulator: DelaySimulator;
    constructor(@Inject(DelaySimulator) delaySimulator: DelaySimulator) {
        this.delaySimulator = delaySimulator;
    }

    async validate(): Promise<boolean> {
        return this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS).then(() => true);
    }
}
