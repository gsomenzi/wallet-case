import { Inject, Injectable } from "@nestjs/common";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { PaymentProcessor } from "../payment-processor.interface";

const MIN_DELAY_MS = 800;
const MAX_DELAY_MS = 1250;

@Injectable()
export class MockPaymentProcessor implements PaymentProcessor {
    delaySimulator: DelaySimulator;
    constructor(@Inject(DelaySimulator) delaySimulator: DelaySimulator) {
        this.delaySimulator = delaySimulator;
    }

    async process(): Promise<void> {
        await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
    }
}
