import { BadRequestException, Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { CreateEcommpayPaymentDto } from './dto/ecommpay-payment.dto';
import { EcommpayService } from './services/ecommpay.service';
import { Response } from 'express';

@Controller('payments_api')
export class PaymentApiController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ecommpayService: EcommpayService
  ) {}

  @Post('/')
  @UseGuards(ApiKeyGuard)
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

  @Post('/ecommpay')
  @UseGuards(ApiKeyGuard)
  async createEcommpayPayment(@Res() res: Response, @Body() createEcommpayPaymentDto: CreateEcommpayPaymentDto) {
    try {
      const url = await this.ecommpayService.createEcommpayPayment(createEcommpayPaymentDto);
      console.log(`💡 ~ url:`, url);

      res.redirect(url);
    } catch (error) {
      console.error(`Payment creation failed: ${error.message}`);
      return res.status(500).json({ message: 'Creating payment failed', error: error.message });
    }
  }

  @Get('/ecommpay/callback')
  async callbackEcommpayPayment(@Query() queryParams: any, @Res() res: Response) {
    try {
      const { success_url } = queryParams;

      await this.ecommpayService.checkPaymentData(queryParams);

      res.redirect(success_url);
    } catch (error) {
      console.error(`Payment validation failed: ${error.message}`);
      return res.status(400).json({ message: 'Invalid payment data', error: error.message });
    }
  }
}
