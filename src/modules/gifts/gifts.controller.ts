import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GiftsService } from './services/gifts.service';
import { CreateGiftDto } from './dto/gift.dto';

@Controller('gifts')
@UseGuards(AuthGuard('jwt'))
export class GiftsController {
    constructor(private readonly giftsService: GiftsService) {}
  
    @Get('/giftable/:StudentId')
    async getStudent(@Param('StudentId') StudentId: number) {
      return await this.giftsService.getGiftable(StudentId);
    }
  
    @Post('/send')
    async sendCourse(@Body() createGiftDto: CreateGiftDto) {
      return await this.giftsService.sendCourse(createGiftDto);
    }
}
