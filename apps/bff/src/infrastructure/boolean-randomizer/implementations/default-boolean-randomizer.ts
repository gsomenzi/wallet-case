import { Injectable } from "@nestjs/common";
import { BooleanRandomizer } from "../boolean-randomizer.interface";

@Injectable()
export class DefaultBooleanRandomizer implements BooleanRandomizer {
    constructor(private readonly trueProbability: number = 0.5) {}

    randomize(): boolean {
        return Math.random() < this.trueProbability;
    }
}
