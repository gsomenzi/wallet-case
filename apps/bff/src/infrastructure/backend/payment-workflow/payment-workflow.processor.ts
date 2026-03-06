import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import {
    PAYMENT_WORKFLOW_QUEUE,
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";
import { AccountValidationRequestedProcessor } from "../account-validator/account-validation-requested.processor";
import { AcquirerProcessingRequestedProcessor } from "../acquirer-processor/acquirer-processing-requested.processor";
import { AntifraudValidationRequestedProcessor } from "../anti-fraud-validator/antifraud-validation-requested.processor";
import { CardValidationRequestedProcessor } from "../card-validator/card-validation-requested.processor";
import { NotificationRequestedProcessor } from "../notification-sender/notification-requested.processor";
import { PaymentProcessingRequestedProcessor } from "../payment-processor/payment-processing-requested.processor";
import { PaymentStartedProcessor } from "../payment-started.processor";

@Injectable()
@Processor(PAYMENT_WORKFLOW_QUEUE)
export class PaymentWorkflowProcessor extends WorkerHost {
    private readonly logger = new Logger(PaymentWorkflowProcessor.name);

    constructor(
        private readonly paymentStartedProcessor: PaymentStartedProcessor,
        private readonly accountValidationRequestedProcessor: AccountValidationRequestedProcessor,
        private readonly cardValidationRequestedProcessor: CardValidationRequestedProcessor,
        private readonly antifraudValidationRequestedProcessor: AntifraudValidationRequestedProcessor,
        private readonly acquirerProcessingRequestedProcessor: AcquirerProcessingRequestedProcessor,
        private readonly paymentProcessingRequestedProcessor: PaymentProcessingRequestedProcessor,
        private readonly notificationRequestedProcessor: NotificationRequestedProcessor
    ) {
        super();
    }

    async process(job: Job<PaymentWorkflowEventPayload, void, PaymentWorkflowEvent>): Promise<void> {
        const event = job.data;

        switch (job.name) {
            case PaymentWorkflowEvent.PaymentStarted:
                await this.paymentStartedProcessor.handle(event);
                return;
            case PaymentWorkflowEvent.AccountValidationRequested:
                await this.accountValidationRequestedProcessor.handle(event);
                return;
            case PaymentWorkflowEvent.CardValidationRequested:
                await this.cardValidationRequestedProcessor.handle(event);
                return;
            case PaymentWorkflowEvent.AntifraudValidationRequested:
                await this.antifraudValidationRequestedProcessor.handle(event);
                return;
            case PaymentWorkflowEvent.AcquirerProcessingRequested:
                await this.acquirerProcessingRequestedProcessor.handle(event);
                return;
            case PaymentWorkflowEvent.PaymentProcessingRequested:
                await this.paymentProcessingRequestedProcessor.handle(event);
                return;
            case PaymentWorkflowEvent.NotificationRequested:
                await this.notificationRequestedProcessor.handle(event);
                return;
            default:
                this.logger.warn(`Workflow event not mapped: ${job.name}`);
        }
    }
}
