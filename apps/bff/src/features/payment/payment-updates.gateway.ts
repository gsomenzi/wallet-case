import { Inject, Injectable } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { PaymentUpdatesBroadcaster } from "../../infrastructure/backend/payment-workflow/payment-updates-broadcaster.service";
import { PaymentStorage } from "../../infrastructure/persistence/payment-storage/payment-storage.interface";
import type { PaymentWorkflowEventPayload } from "./payment-workflow.events";

const PAYMENT_GATEWAY_NAMESPACE = "payments";
const PAYMENT_UPDATED_EVENT = "payment.updated";
const PAYMENT_SUBSCRIBE_EVENT = "payment.subscribe";

@Injectable()
@WebSocketGateway({
    namespace: PAYMENT_GATEWAY_NAMESPACE,
    cors: { origin: "*" },
})
export class PaymentUpdatesGateway implements OnGatewayInit {
    @WebSocketServer()
    private server!: Server;

    constructor(
        @Inject(PaymentStorage) private readonly paymentStorage: PaymentStorage,
        private readonly paymentUpdatesBroadcaster: PaymentUpdatesBroadcaster
    ) {}

    afterInit(): void {
        this.paymentUpdatesBroadcaster.registerHandler((event) => {
            this.server.to(this.getPaymentRoom(event.transactionId)).emit(PAYMENT_UPDATED_EVENT, event.payment);
        });
    }

    @SubscribeMessage(PAYMENT_SUBSCRIBE_EVENT)
    async handleSubscribe(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: PaymentWorkflowEventPayload
    ): Promise<void> {
        if (!payload?.transactionId) {
            client.emit("payment.error", { message: "transactionId is required" });
            return;
        }

        const room = this.getPaymentRoom(payload.transactionId);
        await client.join(room);

        const payment = await this.paymentStorage.findByTransactionId(payload.transactionId);
        if (payment) {
            client.emit(PAYMENT_UPDATED_EVENT, payment);
        }
    }

    private getPaymentRoom(transactionId: string): string {
        return `payment:${transactionId}`;
    }
}
