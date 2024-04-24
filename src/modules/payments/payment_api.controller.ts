import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('payments_api')
@UseGuards(ApiKeyGuard)
export class PaymentApiController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('/')
  async createModule(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      const paymentData = {
        ...createPaymentDto,
      };

      return this.paymentsService.createPayment(paymentData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
