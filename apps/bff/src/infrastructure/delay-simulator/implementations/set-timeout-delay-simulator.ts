import { Injectable } from "@nestjs/common";
import { DelaySimulator } from "../delay-simulator.interface";

@Injectable()
export class SetTimeoutDelaySimulator implements DelaySimulator {
    async simulate(minTimeInMs: number, maxTimeInMs: number): Promise<void> {
        const delay = Math.floor(Math.random() * (maxTimeInMs - minTimeInMs + 1)) + minTimeInMs;
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
}
