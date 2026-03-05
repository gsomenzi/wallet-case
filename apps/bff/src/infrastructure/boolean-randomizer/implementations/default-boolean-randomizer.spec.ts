import { DefaultBooleanRandomizer } from "./default-boolean-randomizer";

describe("DefaultBooleanRandomizer", () => {
    let randomizer: DefaultBooleanRandomizer;

    beforeEach(() => {
        randomizer = new DefaultBooleanRandomizer();
    });

    it("should return a boolean value", () => {
        const result = randomizer.randomize();
        expect(typeof result).toBe("boolean");
    });

    it("should return true approximately 50% of the time", () => {
        const trials = 10000;
        let trueCount = 0;

        for (let i = 0; i < trials; i++) {
            if (randomizer.randomize()) {
                trueCount++;
            }
        }

        const truePercentage = (trueCount / trials) * 100;
        expect(truePercentage).toBeGreaterThan(40);
        expect(truePercentage).toBeLessThan(60);
    });
});
