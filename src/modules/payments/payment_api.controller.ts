import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('payments_api')
@UseGuards(ApiKeyGuard)
export class PaymentApiController {
    
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('/')
  async createModule(@Body() createPaymentDto: CreatePaymentDto) {
    const paymentData = {
      ...createPaymentDto,
    };

    return await this.paymentsService.createPayment(paymentData);
  }
}
