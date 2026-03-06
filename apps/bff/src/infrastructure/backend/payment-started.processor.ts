import { Injectable } from "@nestjs/common";
import { PaymentWorkflowEvent, type PaymentWorkflowEventPayload } from "../../features/payment/payment-workflow.events";
import { PaymentWorkflowQueueService } from "./payment-workflow/payment-workflow-queue.service";

@Injectable()
export class PaymentStartedProcessor {
    constructor(private readonly paymentWorkflowQueueService: PaymentWorkflowQueueService) {}

    async handle(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.paymentWorkflowQueueService.enqueue(PaymentWorkflowEvent.AccountValidationRequested, {
            transactionId: event.transactionId,
        } satisfies PaymentWorkflowEventPayload);
    }
}
