import { Inject, Injectable } from "@nestjs/common";
import { NotificationSendingFailedError } from "src/application/application-errors/notification-sending-error";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { TraceInstrumenter } from "src/infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { NotificationSender } from "../notification-sender.interface";

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;

@Injectable()
export class MockNotificationSender implements NotificationSender {
    constructor(
        @Inject(BooleanRandomizer) private readonly booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) private readonly delaySimulator: DelaySimulator,
        @Inject(TraceInstrumenter) private readonly traceInstrumenter: TraceInstrumenter
    ) {}

    async send(): Promise<void> {
        return await this.traceInstrumenter.usingSpan("notification-sending", {}, async () => {
            await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
            if (!this.booleanRandomizer.randomize()) {
                throw new NotificationSendingFailedError({
                    minDelayMs: MIN_DELAY_MS,
                    maxDelayMs: MAX_DELAY_MS,
                });
            }
        });
    }
}
