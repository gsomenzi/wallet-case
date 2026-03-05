import { Inject, Injectable } from "@nestjs/common";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AntiFraudValidator } from "../anti-fraud-validator.interface";

const MIN_DELAY_MS = 700;
const MAX_DELAY_MS = 1500;

@Injectable()
export class MockAntiFraudValidator implements AntiFraudValidator {
    delaySimulator: DelaySimulator;
    constructor(@Inject(DelaySimulator) delaySimulator: DelaySimulator) {
        this.delaySimulator = delaySimulator;
    }

    async validate(): Promise<boolean> {
        return this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS).then(() => true);
    }
}
