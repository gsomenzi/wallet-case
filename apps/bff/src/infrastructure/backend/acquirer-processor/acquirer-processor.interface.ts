export interface AcquirerProcessor {
    process(): Promise<boolean>;
}

export const AcquirerProcessor = Symbol("AcquirerProcessor");
