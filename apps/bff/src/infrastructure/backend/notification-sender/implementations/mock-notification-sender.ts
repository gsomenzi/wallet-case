import { Inject, Injectable } from "@nestjs/common";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { NotificationSender } from "../notification-sender.interface";

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;

@Injectable()
export class MockNotificationSender implements NotificationSender {
    delaySimulator: DelaySimulator;
    constructor(@Inject(DelaySimulator) delaySimulator: DelaySimulator) {
        this.delaySimulator = delaySimulator;
    }

    async send(): Promise<void> {
        await this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS);
    }
}
