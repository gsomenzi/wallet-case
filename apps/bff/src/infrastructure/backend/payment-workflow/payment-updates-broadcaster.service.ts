import { Injectable } from "@nestjs/common";
import type { Payment } from "../../../features/payment/payment.entity";

export type PaymentUpdatedPayload = {
    transactionId: string;
    payment: Payment;
};

@Injectable()
export class PaymentUpdatesBroadcaster {
    private updateHandler?: (payload: PaymentUpdatedPayload) => void;

    registerHandler(handler: (payload: PaymentUpdatedPayload) => void): void {
        this.updateHandler = handler;
    }

    publish(payload: PaymentUpdatedPayload): void {
        this.updateHandler?.(payload);
    }
}
