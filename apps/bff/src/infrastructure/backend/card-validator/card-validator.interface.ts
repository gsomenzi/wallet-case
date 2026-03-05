export interface CardValidator {
    validate(): Promise<boolean>;
}

export const CardValidator = Symbol("CardValidator");
