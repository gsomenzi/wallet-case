import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { PaymentWorkflowEvent, type PaymentWorkflowEventPayload } from "../../features/payment/payment-workflow.events";

@Injectable()
export class PaymentStartedProcessor {
    constructor(private readonly eventEmitter: EventEmitter2) {}

    @OnEvent(PaymentWorkflowEvent.PaymentStarted, { async: true })
    async handlePaymentStarted(event: PaymentWorkflowEventPayload): Promise<void> {
        this.eventEmitter.emit(PaymentWorkflowEvent.AccountValidationRequested, {
            transactionId: event.transactionId,
        } satisfies PaymentWorkflowEventPayload);
    }
}
