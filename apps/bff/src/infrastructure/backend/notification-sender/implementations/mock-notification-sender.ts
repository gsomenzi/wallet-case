import { Inject, Injectable } from "@nestjs/common";
import { BooleanRandomizer } from "src/infrastructure/boolean-randomizer/boolean-randomizer.interface";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { NotificationSender } from "../notification-sender.interface";

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;

@Injectable()
export class MockNotificationSender implements NotificationSender {
    delaySimulator: DelaySimulator;
    booleanRandomizer: BooleanRandomizer;
    constructor(
        @Inject(BooleanRandomizer) booleanRandomizer: BooleanRandomizer,
        @Inject(DelaySimulator) delaySimulator: DelaySimulator
    ) {
        this.booleanRandomizer = booleanRandomizer;
        this.delaySimulator = delaySimulator;
    }

    async send(): Promise<void> {
        await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
        if (!this.booleanRandomizer.randomize()) {
            throw new Error("Notification sending failed");
        }
    }
}
