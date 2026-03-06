import { Inject, Injectable } from "@nestjs/common";
import { CardValidationFailedError } from "src/application/application-errors/card-validation-error";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AppLogger } from "src/infrastructure/observability/app-logger/app-logger.interface";
import { TraceInstrumenter } from "src/infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { CardValidator } from "../card-validator.interface";

const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

@Injectable()
export class MockCardValidator implements CardValidator {
    constructor(
        @Inject(BooleanRandomizer) private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator,
        @Inject(TraceInstrumenter) private readonly traceInstrumenter: TraceInstrumenter,
        @Inject(AppLogger) private readonly appLogger: AppLogger
    ) {}

    async validate(): Promise<boolean> {
        return await this.traceInstrumenter.usingSpan("card-validation", {}, async () => {
            await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
            if (!this.booleanRandomizer.randomize()) {
                this.appLogger.error("Card validation failed", { context: "MockCardValidator" });
                throw new CardValidationFailedError({
                    minDelayMs: MIN_DELAY_MS,
                    maxDelayMs: MAX_DELAY_MS,
                });
            }
            this.appLogger.info("Card validation succeeded", { context: "MockCardValidator" });
            return true;
        });
    }
}
