import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('/:paymentId')
  async getPayment(@Param('paymentId') paymentId: number) {
    return await this.paymentsService.getPayment(paymentId);
  }

  @Get('/')
  async getPayments(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('page_number') page_number?: number,
    @Query('per_page') per_page?: number) {
      const user = req.user;
      const pageNumber = page_number ? page_number : 1;
      const perPage = per_page ? per_page : 10;
    return await this.paymentsService.getPayments(user,search, pageNumber, perPage);
  }

  @Post('/manual')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const paymentData = {
      ...createPaymentDto,
      payment_method : 2
    };
    return await this.paymentsService.createPayment(paymentData);
  }
  
  @Put('/manual/:paymentId')
  async updatePayment(
    @Param('paymentId') paymentId: number,
    @Body() updatePaymentDto: UpdatePaymentDto
  ) {
    const paymentData = {
      ...updatePaymentDto,
    };
    return await this.paymentsService.updatePayment(paymentId, paymentData);
  }
}
