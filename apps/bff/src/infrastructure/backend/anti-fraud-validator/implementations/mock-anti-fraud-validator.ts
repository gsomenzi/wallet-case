import { Inject, Injectable } from "@nestjs/common";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AntiFraudValidator } from "../anti-fraud-validator.interface";

const MIN_DELAY_MS = 700;
const MAX_DELAY_MS = 1500;

@Injectable()
export class MockAntiFraudValidator implements AntiFraudValidator {
    constructor(
        @Inject(BooleanRandomizer) private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator
    ) {}

    async validate(): Promise<boolean> {
        await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
        if (!this.booleanRandomizer.randomize()) {
            throw new Error("Anti-fraud validation failed");
        }
        return true;
    }
}
