import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PaymentStatus } from "../../../features/payment/payment-response.entity";
import {
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";
import { PaymentWorkflowCoordinator } from "../payment-workflow/payment-workflow-coordinator.service";
import { AcquirerProcessor, type AcquirerProcessor as AcquirerProcessorType } from "./acquirer-processor.interface";

@Injectable()
export class AcquirerProcessingRequestedProcessor {
    constructor(
        @Inject(AcquirerProcessor) private readonly acquirerProcessor: AcquirerProcessorType,
        private readonly paymentWorkflowCoordinator: PaymentWorkflowCoordinator
    ) {}

    @OnEvent(PaymentWorkflowEvent.AcquirerProcessingRequested, { async: true })
    async handleAcquirerProcessingRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.paymentWorkflowCoordinator.execute({
            event,
            step: "acquirer_processing",
            statusInProgress: PaymentStatus.ProcessingAcquirer,
            action: () => this.acquirerProcessor.process(),
            nextEvent: PaymentWorkflowEvent.PaymentProcessingRequested,
        });
    }
}
