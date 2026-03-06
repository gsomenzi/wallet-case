import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { shutdownTelemetry, startTelemetry } from "./infrastructure/observability/telemetry-bootstrap";

async function bootstrap() {
    await startTelemetry();

    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );
    await app.listen(process.env.PORT ?? 3000);

    const close = async () => {
        await app.close();
        await shutdownTelemetry();
    };

    process.on("SIGINT", close);
    process.on("SIGTERM", close);
}
bootstrap();
