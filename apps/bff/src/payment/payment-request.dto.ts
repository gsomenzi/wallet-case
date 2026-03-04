import { Transform } from "class-transformer";
import { IsNumber, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";

const ONLY_DIGITS_REGEX = /^\d+$/;
const EXPIRATION_DATE_REGEX = /^(0[1-9]|1[0-2])\/(\d{2})$/;

export class PaymentRequest {
    @Transform(({ value }) => (typeof value === "string" ? value.replace(/\s+/g, "") : value))
    @IsString()
    @Matches(ONLY_DIGITS_REGEX)
    @MinLength(13)
    @MaxLength(19)
    cardNumber: string;

    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    @MinLength(3)
    @MaxLength(80)
    cardHolder: string;

    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    @Matches(EXPIRATION_DATE_REGEX)
    expirationDate: string;

    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    @Matches(ONLY_DIGITS_REGEX)
    @MinLength(3)
    @MaxLength(4)
    cvv: string;

    @Transform(({ value }) => Number(value))
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    amount: number;
}
