import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { JobsOptions, Queue } from "bullmq";
import {
    PAYMENT_WORKFLOW_QUEUE,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";

@Injectable()
export class PaymentWorkflowQueueService {
    constructor(
        @InjectQueue(PAYMENT_WORKFLOW_QUEUE)
        private readonly queue: Queue<PaymentWorkflowEventPayload>
    ) {}

    async enqueue(eventName: string, payload: PaymentWorkflowEventPayload, options?: JobsOptions): Promise<void> {
        await this.queue.add(eventName, payload, {
            removeOnComplete: 500,
            removeOnFail: 1000,
            ...options,
        });
    }
}
