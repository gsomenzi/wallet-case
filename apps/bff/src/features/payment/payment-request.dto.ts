import { Transform } from "class-transformer";
import { IsNumber, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";

const ONLY_DIGITS_REGEX = /^\d+$/;
const EXPIRATION_DATE_REGEX = /^(0[1-9]|1[0-2])\/(\d{2})$/;

export class PaymentRequest {
    @Transform(({ value }) => (typeof value === "string" ? value.replace(/\s+/g, "") : value))
    @IsString()
    @Matches(ONLY_DIGITS_REGEX, {
        message: "O número do cartão deve conter apenas dígitos",
    })
    @MinLength(13, {
        message: "O número do cartão deve ter no mínimo 13 dígitos",
    })
    @MaxLength(19, {
        message: "O número do cartão deve ter no máximo 19 dígitos",
    })
    cardNumber: string;

    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    @MinLength(3, {
        message: "O nome do titular do cartão deve ter no mínimo 3 caracteres",
    })
    @MaxLength(80, {
        message: "O nome do titular do cartão deve ter no máximo 80 caracteres",
    })
    cardHolder: string;

    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    @Matches(EXPIRATION_DATE_REGEX, {
        message: "A data de expiração deve estar no formato MM/AA",
    })
    expirationDate: string;

    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    @Matches(ONLY_DIGITS_REGEX, { message: "O CVV deve conter apenas dígitos" })
    @MinLength(3, { message: "O CVV deve ter no mínimo 3 dígitos" })
    @MaxLength(4, { message: "O CVV deve ter no máximo 4 dígitos" })
    cvv: string;

    @Transform(({ value }) => Number(value))
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01, { message: "O valor do pagamento deve ser no mínimo 0,01" })
    amount: number;
}
