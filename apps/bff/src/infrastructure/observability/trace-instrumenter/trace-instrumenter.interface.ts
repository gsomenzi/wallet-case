export interface TraceInstrumenter {
    usingSpan<T>(
        name: string,
        attributes: Record<string, string | number | boolean | undefined>,
        fn: () => Promise<T> | T
    ): Promise<T>;
}

export const TraceInstrumenter = Symbol("TraceInstrumenter");
