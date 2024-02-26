import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BillingsService } from './services/billings.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';

@Controller('billing')
@UseGuards(AuthGuard('jwt'))
export class BillingsController {
  constructor(private readonly billingsService: BillingsService) {}

  @Get('/')
  async getBillings() {
    return await this.billingsService.getBillings();
  }

  @Get('/:billingId')
  async getBilling(@Param('billingId') billingId: number) {
    return await this.billingsService.getBilling(billingId);
  }

  @Post('/')
  async createFiles(
    @Body() createBillingDto: CreateBillingDto,
  ) {
    const billingData = {
      ...createBillingDto,
    };

    return await this.billingsService.createBilling(billingData);
  }

  @Put('/:billingId')
  async updateFile(
    @Param('billingId') billingId: number,
    @Body() updateBillingDto: UpdateBillingDto,
  ) {
    const billingData = {
      ...updateBillingDto,
    };
    
    return await this.billingsService.updateBilling(billingId, billingData);
  }

}
