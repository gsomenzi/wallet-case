import { Controller, Post } from "@nestjs/common";
import { PaymentService } from "./payment.service";

@Controller("v1/payments")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    async createPayment() {
        return await this.paymentService.processPayment();
    }
}
