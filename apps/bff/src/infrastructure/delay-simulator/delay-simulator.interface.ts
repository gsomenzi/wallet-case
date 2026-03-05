export interface DelaySimulator {
    simulate(minMs: number, maxMs: number): Promise<void>;
}

export const DelaySimulator = Symbol("DelaySimulator");
