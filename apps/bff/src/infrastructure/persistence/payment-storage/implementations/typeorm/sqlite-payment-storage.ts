import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "src/features/payment/payment.entity";
import { Repository } from "typeorm";
import { PaymentStorage } from "../../payment-storage.interface";
import { PaymentRecord } from "./payment-record.entity";

@Injectable()
export class SqlitePaymentStorage implements PaymentStorage {
    constructor(
        @InjectRepository(PaymentRecord)
        private readonly paymentRepository: Repository<PaymentRecord>
    ) {}

    async save(payment: Payment): Promise<void> {
        await this.paymentRepository.save({
            transactionId: payment.transactionId,
            status: payment.status,
            totalTimeMs: payment.totalTimeMs,
            steps: payment.steps,
            failure: payment.failure,
        });
    }

    async findByTransactionId(transactionId: string): Promise<Payment | null> {
        const record = await this.paymentRepository.findOneBy({ transactionId });

        if (!record) {
            return null;
        }

        return new Payment(record.status, record.transactionId, record.totalTimeMs, record.steps, record.failure);
    }
}
