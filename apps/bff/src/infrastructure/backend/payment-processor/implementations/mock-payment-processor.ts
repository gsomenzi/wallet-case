import { Inject, Injectable } from "@nestjs/common";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { PaymentProcessor } from "../payment-processor.interface";

const MIN_DELAY_MS = 800;
const MAX_DELAY_MS = 1250;

@Injectable()
export class MockPaymentProcessor implements PaymentProcessor {
    constructor(
        @Inject(BooleanRandomizer) private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator
    ) {}

    async process(): Promise<void> {
        await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
        if (!this.booleanRandomizer.randomize()) {
            throw new Error("Payment processing failed");
        }
    }
}
