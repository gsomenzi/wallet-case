import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PaymentStatus } from "../../../features/payment/payment-response.entity";
import {
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";
import { PaymentWorkflowCoordinator } from "../payment-workflow/payment-workflow-coordinator.service";
import { AccountValidator, type AccountValidator as AccountValidatorType } from "./account-validator.interface";

@Injectable()
export class AccountValidationRequestedProcessor {
    constructor(
        @Inject(AccountValidator) private readonly accountValidator: AccountValidatorType,
        private readonly paymentWorkflowCoordinator: PaymentWorkflowCoordinator
    ) {}

    @OnEvent(PaymentWorkflowEvent.AccountValidationRequested, { async: true })
    async handleAccountValidationRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.paymentWorkflowCoordinator.execute({
            event,
            step: "account_validation",
            statusInProgress: PaymentStatus.ValidatingAccount,
            action: () => this.accountValidator.validate(),
            nextEvent: PaymentWorkflowEvent.CardValidationRequested,
        });
    }
}
