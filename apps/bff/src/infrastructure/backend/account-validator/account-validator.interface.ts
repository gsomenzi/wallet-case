export interface AccountValidator {
    validate(): Promise<boolean>;
}

export const AccountValidator = Symbol("AccountValidator");
