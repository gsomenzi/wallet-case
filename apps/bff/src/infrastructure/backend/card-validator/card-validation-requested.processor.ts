import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PaymentStatus } from "../../../features/payment/payment-response.entity";
import {
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";
import { PaymentWorkflowCoordinator } from "../payment-workflow-coordinator.service";
import { CardValidator, type CardValidator as CardValidatorType } from "./card-validator.interface";

@Injectable()
export class CardValidationRequestedProcessor {
    constructor(
        @Inject(CardValidator) private readonly cardValidator: CardValidatorType,
        private readonly paymentWorkflowCoordinator: PaymentWorkflowCoordinator
    ) {}

    @OnEvent(PaymentWorkflowEvent.CardValidationRequested, { async: true })
    async handleCardValidationRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.paymentWorkflowCoordinator.execute({
            event,
            step: "card_validation",
            statusInProgress: PaymentStatus.ValidatingCard,
            action: () => this.cardValidator.validate(),
            nextEvent: PaymentWorkflowEvent.AntifraudValidationRequested,
        });
    }
}
