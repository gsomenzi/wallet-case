import { Inject, Injectable } from "@nestjs/common";
import { AccountValidationFailedError } from "src/application/application-errors/account-validation-error";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AppLogger } from "src/infrastructure/observability/app-logger/app-logger.interface";
import { TraceInstrumenter } from "src/infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { AccountValidator } from "../account-validator.interface";

const MIN_DELAY_MS = 450;
const MAX_DELAY_MS = 730;

@Injectable()
export class MockAccountValidator implements AccountValidator {
    constructor(
        @Inject(BooleanRandomizer)
        private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator,
        @Inject(TraceInstrumenter)
        private readonly traceInstrumenter: TraceInstrumenter,
        @Inject(AppLogger) private readonly appLogger: AppLogger
    ) {}

    async validate(): Promise<boolean> {
        return await this.traceInstrumenter.usingSpan("account-validation", {}, async () => {
            await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
            if (!this.booleanRandomizer.randomize()) {
                this.appLogger.error("Account validation failed", {
                    event: "account_validation_failed",
                    context: "MockAccountValidator",
                });
                throw new AccountValidationFailedError({
                    minDelayMs: MIN_DELAY_MS,
                    maxDelayMs: MAX_DELAY_MS,
                });
            }
            this.appLogger.info("Account validation succeeded", {
                event: "account_validation_succeeded",
                context: "MockAccountValidator",
            });
            return true;
        });
    }
}
