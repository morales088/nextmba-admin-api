import { Body, Controller, Get, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GiftsService } from './services/gifts.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { Response } from 'express';
import { UpdateGiftDto } from './dto/update-gift.dto';

@Controller('gifts')
// @UseGuards(AuthGuard('jwt'))
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get('/giftable/:StudentId')
  async getStudent(@Param('StudentId') StudentId: number) {
    return await this.giftsService.getGiftable(StudentId);
  }

  @Post('/send')
  async sendCourse(@Res() res: Response, @Body() createGiftDto: CreateGiftDto) {
    const { code, message } = await this.giftsService.sendCourse(createGiftDto);

    return res.status(code).json({ message });
  }

  @Put('/:giftId')
  async updateGift(@Param('giftId') giftId: number, @Body() updateGiftDto: UpdateGiftDto) {
    return await this.giftsService.updateGift(giftId, updateGiftDto);
  }
}
