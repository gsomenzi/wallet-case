export interface BooleanRandomizer {
    randomize(): boolean;
}

export const BooleanRandomizer = Symbol("BooleanRandomizer");
