import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('/:paymentId')
  async getModule(@Param('paymentId') paymentId: number) {
    return await this.paymentsService.getPayment(paymentId);
  }

  @Get('/')
  async getModules() {
    return await this.paymentsService.getPayments();
  }

  @Post('/')
  async createModule(@Body() createPaymentDto: CreatePaymentDto) {
    const paymentData = {
      ...createPaymentDto,
    };

    return await this.paymentsService.createPayment(paymentData);
  }

//   @Put('/:moduleId')
//   async updateModule(
//     @Param('moduleId') moduleId: number,
//     @Request() req: any,
//     @Body() updateModuleDto: UpdateModuleDto
//   ) {
//     return await this.modulesService.updateModule(moduleId, updateModuleDto);
//   }
}
