import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentRequest } from "./payment-request.dto";

@Controller("v1/payments")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    async createPayment(@Body() paymentRequest: PaymentRequest) {
        return await this.paymentService.executePayment(paymentRequest);
    }

    @Get(":transactionId")
    async getPaymentByTransactionId(@Param("transactionId") transactionId: string) {
        return await this.paymentService.getByTransactionId(transactionId);
    }
}
