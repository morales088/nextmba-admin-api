import { Body, Controller, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AffiliatesService } from './services/affiliates.service';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { UpdateAffiliateWithdrawDto } from './dto/update-affiliateWithdraw.dto';

@Controller('affiliates')
@UseGuards(AuthGuard('jwt'))
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Get('/')
  async getAffiliates() {
    return await this.affiliatesService.getAffiliates();
  }

  @Get('withdraws')
  async getAffiliateWithdraws() {
    return await this.affiliatesService.getAffiliateWithdraws();
  }

  @Get('/:affiliateId')
  async getAffiliate(@Param('affiliateId') affiliateId: number) {
    return await this.affiliatesService.getAffiliate(affiliateId);
  }

  @Put('/:affiliateId')
  async updateAffiliate(
    @Param('affiliateId') affiliateId: number,
    @Request() req: any,
    @Body() updateAffiliateDto: UpdateAffiliateDto
  ) {
    return await this.affiliatesService.updateAffiliate(affiliateId, updateAffiliateDto);
  }

  @Get('/withdraws/:affiliateWithdrawId')
  async getAffiliateWithdraw(@Param('affiliateWithdrawId') affiliateWithdrawId: number) {
    return await this.affiliatesService.getAffiliateWithdraw(affiliateWithdrawId);
  }
  
  @Put('withdraws/:affiliateWithdrawId')
  async updateAffiliateWithdraw(
    @Param('affiliateWithdrawId') affiliateWithdrawId: number,
    @Request() req: any,
    @Body() UpdateAffiliateWithdrawDto: UpdateAffiliateWithdrawDto
  ) {
    return await this.affiliatesService.updateAffiliateWithdraw(affiliateWithdrawId, UpdateAffiliateWithdrawDto);
  }
}
