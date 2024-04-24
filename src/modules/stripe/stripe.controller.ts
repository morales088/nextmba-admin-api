import { Body, Controller, Get } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CheckoutDataDTO } from './dto/stripe.dto';

@Controller('checkout')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('/create-session')
  async createCheckoutSession(@Body() checkoutDataDto: CheckoutDataDTO) {
    const session = await this.stripeService.createCheckoutSession(checkoutDataDto);

    return { url: session.url };
  }
}
