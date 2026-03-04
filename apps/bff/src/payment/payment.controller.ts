import { Body, Controller, Post } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentRequest } from "./payment-request.dto";

@Controller("v1/payments")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    async createPayment(@Body() paymentRequest: PaymentRequest) {
        return await this.paymentService.processPayment(paymentRequest);
    }
}
