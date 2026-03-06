import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PaymentStatus } from "../../../features/payment/payment.entity";
import {
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";
import { PaymentWorkflowCoordinator } from "../payment-workflow/payment-workflow-coordinator.service";
import { PaymentProcessor, type PaymentProcessor as PaymentProcessorType } from "./payment-processor.interface";

@Injectable()
export class PaymentProcessingRequestedProcessor {
    constructor(
        @Inject(PaymentProcessor)
        private readonly paymentProcessor: PaymentProcessorType,
        private readonly paymentWorkflowCoordinator: PaymentWorkflowCoordinator
    ) {}

    @OnEvent(PaymentWorkflowEvent.PaymentProcessingRequested, { async: true })
    async handlePaymentProcessingRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.paymentWorkflowCoordinator.execute({
            event,
            step: "payment",
            statusInProgress: PaymentStatus.ProcessingPayment,
            action: () => this.paymentProcessor.process(),
            nextEvent: PaymentWorkflowEvent.NotificationRequested,
        });
    }
}
