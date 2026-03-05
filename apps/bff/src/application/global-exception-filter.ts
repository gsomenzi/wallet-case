import { ArgumentsHost, Catch, ExceptionFilter, HttpException, InternalServerErrorException } from "@nestjs/common";
import { Request, Response } from "express";
import { ApplicationError } from "./application-error";
import { ApplicationErrorHttpMapper } from "./application-error-http-mapper";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const httpException =
            exception instanceof ApplicationError
                ? ApplicationErrorHttpMapper.toHttp(exception)
                : exception instanceof HttpException
                  ? exception
                  : new InternalServerErrorException({
                        code: "INTERNAL_ERROR",
                        message: "Unexpected error",
                    });

        const status = httpException.getStatus();
        const body = httpException.getResponse();

        response.status(status).json({
            ...(typeof body === "string" ? { message: body } : body),
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
