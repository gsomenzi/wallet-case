import { SetTimeoutDelaySimulator } from "./set-timeout-delay-simulator";

const MAX_TIME_TOLERANCE_IN_MS = 50;

describe("SetTimeoutDelaySimulator", () => {
    let delaySimulator: SetTimeoutDelaySimulator;

    beforeEach(() => {
        delaySimulator = new SetTimeoutDelaySimulator();
    });

    it("should simulate a delay within the specified range", async () => {
        const minTimeInMs = 100;
        const maxTimeInMs = 200;
        const startTime = Date.now();

        await delaySimulator.simulate(minTimeInMs, maxTimeInMs);

        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        expect(elapsedTime).toBeGreaterThanOrEqual(minTimeInMs);
        expect(elapsedTime).toBeLessThanOrEqual(maxTimeInMs + MAX_TIME_TOLERANCE_IN_MS);
    });
});
