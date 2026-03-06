import { Inject, Injectable } from "@nestjs/common";
import { PaymentStatus } from "../../../features/payment/payment.entity";
import {
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";
import { PaymentWorkflowCoordinator } from "../payment-workflow/payment-workflow-coordinator.service";
import { CardValidator, type CardValidator as CardValidatorType } from "./card-validator.interface";

@Injectable()
export class CardValidationRequestedProcessor {
    constructor(
        @Inject(CardValidator) private readonly cardValidator: CardValidatorType,
        private readonly paymentWorkflowCoordinator: PaymentWorkflowCoordinator
    ) {}

    async handle(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.paymentWorkflowCoordinator.execute({
            event,
            step: "card_validation",
            statusInProgress: PaymentStatus.ValidatingCard,
            action: () => this.cardValidator.validate(),
            nextEvent: PaymentWorkflowEvent.AntifraudValidationRequested,
        });
    }
}
