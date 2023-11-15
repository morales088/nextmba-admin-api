import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GiftsService } from './services/gifts.service';

@Controller('gifts')
@UseGuards(AuthGuard('jwt'))
export class GiftsController {
    constructor(private readonly giftsService: GiftsService) {}
  
    @Get('/giftable/:StudentId')
    async getStudent(@Param('StudentId') StudentId: number) {
      return await this.giftsService.getGiftable(StudentId);
    }
}
