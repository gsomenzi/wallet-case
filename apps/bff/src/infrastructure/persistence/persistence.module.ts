import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentRecord } from "./payment-storage/implementations/typeorm/payment-record.entity";
import { SqlitePaymentStorage } from "./payment-storage/implementations/typeorm/sqlite-payment-storage";
import { PaymentStorage } from "./payment-storage/payment-storage.interface";

const sqliteFilePath = resolve(process.cwd(), process.env.SQLITE_DB_PATH ?? "data/wallet-case.sqlite");
mkdirSync(dirname(sqliteFilePath), { recursive: true });

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: sqliteFilePath,
            entities: [PaymentRecord],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([PaymentRecord]),
    ],
    providers: [
        {
            provide: PaymentStorage,
            useClass: SqlitePaymentStorage,
        },
    ],
    exports: [PaymentStorage],
})
export class PersistenceModule {}
