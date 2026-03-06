import type { PaymentFailure, PaymentStatus, StepResponse } from "src/features/payment/payment.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "payments" })
export class PaymentRecord {
    @PrimaryColumn({ type: "text" })
    transactionId!: string;

    @Column({ type: "text" })
    status!: PaymentStatus;

    @Column({ type: "integer" })
    totalTimeMs!: number;

    @Column({ type: "simple-json" })
    steps!: StepResponse[];

    @Column({ type: "simple-json", nullable: true })
    failure?: PaymentFailure;
}
