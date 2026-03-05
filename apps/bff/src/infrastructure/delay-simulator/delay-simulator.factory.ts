import { DelaySimulator } from "./delay-simulator.interface";
import { SetTimeoutDelaySimulator } from "./implementations/set-timeout-delay-simulator";

export enum DelaySimulatorType {
    SetTimeout = "setTimeout",
}

export function createDelaySimulator(type: DelaySimulatorType = DelaySimulatorType.SetTimeout): DelaySimulator {
    switch (type) {
        case DelaySimulatorType.SetTimeout:
            return new SetTimeoutDelaySimulator();
        default:
            throw new Error(`Unsupported delay simulator type: ${type}`);
    }
}
