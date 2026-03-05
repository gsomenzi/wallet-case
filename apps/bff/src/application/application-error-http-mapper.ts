import {
    BadRequestException,
    HttpException,
    InternalServerErrorException,
    UnauthorizedException,
} from "@nestjs/common";
import { ApplicationError } from "./application-error";

type MapperFn = (error: ApplicationError) => HttpException;

const mapByCode: Record<string, MapperFn> = {
    ACCOUNT_VALIDATION_FAILED: (e) =>
        new UnauthorizedException({
            code: e.code,
            message: e.message,
            details: e.details,
        }),
    CARD_VALIDATION_FAILED: (e) =>
        new BadRequestException({
            code: e.code,
            message: e.message,
            details: e.details,
        }),
    ANTI_FRAUD_VALIDATION_FAILED: (e) =>
        new BadRequestException({
            code: e.code,
            message: e.message,
            details: e.details,
        }),
    ACQUIRER_PROCESSING_FAILED: (e) =>
        new BadRequestException({
            code: e.code,
            message: e.message,
            details: e.details,
        }),
    PAYMENT_PROCESSING_FAILED: (e) =>
        new BadRequestException({
            code: e.code,
            message: e.message,
            details: e.details,
        }),
    NOTIFICATION_SENDING_FAILED: (e) =>
        new BadRequestException({
            code: e.code,
            message: e.message,
            details: e.details,
        }),
};

export class ApplicationErrorHttpMapper {
    static toHttp(error: ApplicationError): HttpException {
        const mapper = mapByCode[error.code];
        if (mapper) return mapper(error);

        return new InternalServerErrorException({
            code: error.code ?? "UNKNOWN_APPLICATION_ERROR",
            message: error.message ?? "Erro desconhecido",
            details: error.details,
        });
    }
}
