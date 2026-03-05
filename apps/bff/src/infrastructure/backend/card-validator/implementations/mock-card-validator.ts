import { Inject, Injectable } from "@nestjs/common";
import { CardValidationFailedError } from "src/application/application-errors/card-validation-error";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { CardValidator } from "../card-validator.interface";

const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

@Injectable()
export class MockCardValidator implements CardValidator {
    constructor(
        @Inject(BooleanRandomizer) private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator
    ) {}

    async validate(): Promise<boolean> {
        await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
        if (!this.booleanRandomizer.randomize()) {
            throw new CardValidationFailedError({
                minDelayMs: MIN_DELAY_MS,
                maxDelayMs: MAX_DELAY_MS,
            });
        }
        return true;
    }
}
