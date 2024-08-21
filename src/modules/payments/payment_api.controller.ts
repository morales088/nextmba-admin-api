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
      console.log('');
      console.log(`💡 ~ New Payment:`);
      const url = await this.ecommpayService.createEcommpayPayment(createEcommpayPaymentDto);
      console.log(`💡 ~ url:`, url);

      res.status(200).json({ url });
    } catch (error) {
      console.error(`Payment creation failed: ${error.message}`);
      return res.status(500).json({ message: 'Creating payment failed', error: error.message });
    }
  }

  @Get('/ecommpay/callback')
  async callbackEcommpayPayment(@Query() queryParams: any, @Res() res: Response) {
    try {
      const { success_url, email, customer_first_name, customer_last_name, product_code, payment_amount } = queryParams;

      await this.ecommpayService.checkPayment(queryParams);

      // Create student payment
      const paymentData = {
        name: `${customer_first_name} ${customer_last_name}`,
        email: email,
        product_code: product_code,
        price: payment_amount / 100,
      };
      console.log(`💡 ~ Customer Info:`, paymentData);

      await this.paymentsService.createPayment(paymentData);

      res.redirect(success_url);
    } catch (error) {
      console.error(`Payment validation failed: ${error.message}`);
      return res.status(400).json({ message: 'Error occurred.', error: error.message });
    }
  }
}
