import { BadRequestException, Body, Controller, Get, Logger, Post, Query, Res, UseGuards } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { CreateEcommpayPaymentDto } from './dto/ecommpay-payment.dto';
import { EcommpayService } from './services/ecommpay.service';
import { Response } from 'express';

@Controller('payments_api')
export class PaymentApiController {
  private readonly logger = new Logger(PaymentApiController.name);

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

      console.log('');
      this.logger.log(`Payment creation success: ${createEcommpayPaymentDto.email}`);

      res.status(200).json({ url });
    } catch (error) {
      this.logger.error(`Payment creation failed: ${error.message}`);
      return res.status(500).json({ message: 'Creating payment failed', error: error.message });
    }
  }

  @Get('/ecommpay/callback')
  async callbackEcommpayPayment(@Query() queryParams: any, @Res() res: Response) {
    const { success_url, email, customer_first_name, customer_last_name, product_code, payment_amount } = queryParams;

    try {
      const isValid = await this.ecommpayService.checkPayment(queryParams);

      if (isValid) {
        // Create student payment
        const paymentData = {
          name: `${customer_first_name} ${customer_last_name}`,
          email: email,
          product_code: product_code,
          price: payment_amount / 100,
        };
        await this.paymentsService.createPayment(paymentData);

        this.logger.log(`Payment success: ${email}`);
        res.redirect(success_url);
      }
    } catch (error) {
      this.logger.error(`Payment validation failed: ${error.message}`);
      this.logger.warn(`Customer email: ${email}`);
      return res.status(400).json({ message: 'Error occurred.', error: error.message });
    }
  }
}
