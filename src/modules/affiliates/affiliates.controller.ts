import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AffiliatesService } from './services/affiliates.service';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { UpdateWithdrawRequestDto } from './dto/update-withdraw-request.dto';

@Controller('affiliates')
@UseGuards(AuthGuard('jwt'))
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Get('/')
  async getAffiliates(@Query('page_number') page_number?: number, @Query('per_page') per_page?: number) {
    const pageNumber = page_number ? page_number : 1;
    const perPage = per_page ? per_page : 10;

    return this.affiliatesService.getAffiliates(pageNumber, perPage);
  }

  @Get('/withdraws')
  async getAffiliateWithdraws() {
    return this.affiliatesService.getAffiliateWithdraws();
  }

  @Get('/:affiliateId')
  async getAffiliate(@Param('affiliateId') affiliateId: number) {
    return this.affiliatesService.getAffiliate(affiliateId);
  }

  @Put('/:affiliateId')
  async updateAffiliate(@Param('affiliateId') affiliateId: number, @Body() updateAffiliateDto: UpdateAffiliateDto) {
    return this.affiliatesService.updateAffiliate(affiliateId, updateAffiliateDto);
  }

  @Get('/withdraws/:withdrawId')
  async getAffiliateWithdraw(@Param('withdrawId') withdrawId: number) {
    return this.affiliatesService.getAffiliateWithdraw(withdrawId);
  }

  @Put('withdraws/:withdrawId')
  async updateAffiliateWithdraw(
    @Param('withdrawId') withdrawId: number,
    @Body() updateWithdrawRequestDto: UpdateWithdrawRequestDto
  ) {
    return this.affiliatesService.updateAffiliateWithdraw(withdrawId, updateWithdrawRequestDto);
  }
}
