import { Inject, Injectable } from "@nestjs/common";
import { AntiFraudValidationFailedError } from "src/application/application-errors/anti-fraud-validation-error";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AppLogger } from "src/infrastructure/observability/app-logger/app-logger.interface";
import { TraceInstrumenter } from "src/infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { AntiFraudValidator } from "../anti-fraud-validator.interface";

const MIN_DELAY_MS = 700;
const MAX_DELAY_MS = 1500;

@Injectable()
export class MockAntiFraudValidator implements AntiFraudValidator {
    constructor(
        @Inject(BooleanRandomizer)
        private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator,
        @Inject(TraceInstrumenter)
        private readonly traceInstrumenter: TraceInstrumenter,
        @Inject(AppLogger) private readonly appLogger: AppLogger
    ) {}

    async validate(): Promise<boolean> {
        return await this.traceInstrumenter.usingSpan("anti-fraud-validation", {}, async () => {
            await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
            if (!this.booleanRandomizer.randomize()) {
                this.appLogger.warn("Anti-fraud validation failed", {
                    event: "anti_fraud_validation_failed",
                    context: "MockAntiFraudValidator",
                });
                throw new AntiFraudValidationFailedError({
                    minDelayMs: MIN_DELAY_MS,
                    maxDelayMs: MAX_DELAY_MS,
                });
            }
            this.appLogger.info("Anti-fraud validation succeeded", {
                event: "anti_fraud_validation_succeeded",
                context: "MockAntiFraudValidator",
            });
            return true;
        });
    }
}
