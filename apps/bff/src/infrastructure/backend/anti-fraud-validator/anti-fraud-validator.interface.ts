export interface AntiFraudValidator {
    validate(): Promise<boolean>;
}

export const AntiFraudValidator = Symbol("AntiFraudValidator");
