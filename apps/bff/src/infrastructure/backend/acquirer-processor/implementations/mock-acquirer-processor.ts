import { Inject, Injectable } from "@nestjs/common";
import { AcquirerProcessingFailedError } from "src/application/application-errors/acquirer-processing-error";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AppLogger } from "src/infrastructure/observability/app-logger/app-logger.interface";
import { TraceInstrumenter } from "src/infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { AcquirerProcessor } from "../acquirer-processor.interface";

const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 2500;

@Injectable()
export class MockAcquirerProcessor implements AcquirerProcessor {
    constructor(
        @Inject(BooleanRandomizer)
        private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator,
        @Inject(TraceInstrumenter)
        private readonly traceInstrumenter: TraceInstrumenter,
        @Inject(AppLogger) private readonly appLogger: AppLogger
    ) {}

    async process(): Promise<boolean> {
        return await this.traceInstrumenter.usingSpan("acquirer-processing", {}, async () => {
            await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
            if (!this.booleanRandomizer.randomize()) {
                this.appLogger.error("Acquirer processing failed", {
                    context: "MockAcquirerProcessor",
                });
                throw new AcquirerProcessingFailedError({
                    minDelayMs: MIN_DELAY_MS,
                    maxDelayMs: MAX_DELAY_MS,
                });
            }
            this.appLogger.info("Acquirer processing succeeded", {
                context: "MockAcquirerProcessor",
            });
            return true;
        });
    }
}
