import { Inject, Injectable } from "@nestjs/common";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AccountValidator } from "../account-validator.interface";

const MIN_DELAY_MS = 450;
const MAX_DELAY_MS = 730;

@Injectable()
export class MockAccountValidator implements AccountValidator {
    delaySimulator: DelaySimulator;
    booleanRandomizer: BooleanRandomizer;
    constructor(
        @Inject(BooleanRandomizer) booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) delaySimulator: DelaySimulator
    ) {
        this.booleanRandomizer = booleanRandomizer;
        this.delaySimulator = delaySimulator;
    }

    async validate(): Promise<boolean> {
        await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
        if (!this.booleanRandomizer.randomize()) {
            throw new Error("Account validation failed");
        }
        return true;
    }
}
