import { Inject, Injectable } from "@nestjs/common";
import { PaymentProcessingFailedError } from "src/application/application-errors/payment-processing-error";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { TraceInstrumenter } from "src/infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentProcessor } from "../payment-processor.interface";

const MIN_DELAY_MS = 800;
const MAX_DELAY_MS = 1250;

@Injectable()
export class MockPaymentProcessor implements PaymentProcessor {
    constructor(
        @Inject(BooleanRandomizer) private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator,
        @Inject(TraceInstrumenter) private readonly traceInstrumenter: TraceInstrumenter
    ) {}

    async process(): Promise<void> {
        return await this.traceInstrumenter.usingSpan("payment-processing", {}, async () => {
            await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
            if (!this.booleanRandomizer.randomize()) {
                throw new PaymentProcessingFailedError({
                    minDelayMs: MIN_DELAY_MS,
                    maxDelayMs: MAX_DELAY_MS,
                });
            }
        });
    }
}
