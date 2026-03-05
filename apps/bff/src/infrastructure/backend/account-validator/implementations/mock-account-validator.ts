import { Inject, Injectable } from "@nestjs/common";
import { DelaySimulator } from "src/infrastructure/delay-simulator/delay-simulator.interface";
import { AccountValidator } from "../account-validator.interface";

const MIN_DELAY_MS = 450;
const MAX_DELAY_MS = 730;

@Injectable()
export class MockAccountValidator implements AccountValidator {
    delaySimulator: DelaySimulator;
    constructor(@Inject(DelaySimulator) delaySimulator: DelaySimulator) {
        this.delaySimulator = delaySimulator;
    }

    async validate(): Promise<boolean> {
        return this.delaySimulator.simulate(MIN_DELAY_MS, MAX_DELAY_MS).then(() => true);
    }
}
