import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PaymentStatus } from "../../../features/payment/payment.entity";
import {
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";
import { PaymentWorkflowCoordinator } from "../payment-workflow/payment-workflow-coordinator.service";
import {
    AntiFraudValidator,
    type AntiFraudValidator as AntiFraudValidatorType,
} from "./anti-fraud-validator.interface";

@Injectable()
export class AntifraudValidationRequestedProcessor {
    constructor(
        @Inject(AntiFraudValidator)
        private readonly antiFraudValidator: AntiFraudValidatorType,
        private readonly paymentWorkflowCoordinator: PaymentWorkflowCoordinator
    ) {}

    @OnEvent(PaymentWorkflowEvent.AntifraudValidationRequested, { async: true })
    async handleAntifraudValidationRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.paymentWorkflowCoordinator.execute({
            event,
            step: "antifraud_validation",
            statusInProgress: PaymentStatus.ValidatingAntifraud,
            action: () => this.antiFraudValidator.validate(),
            nextEvent: PaymentWorkflowEvent.AcquirerProcessingRequested,
        });
    }
}
