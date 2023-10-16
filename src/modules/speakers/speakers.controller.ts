import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SpeakersService } from './services/speakers.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';

@Controller('speakers')
@UseGuards(AuthGuard('jwt'))
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Get('/:speakerId')
  async getSpeaker(@Param('speakerId') speakerId: number) {
    return await this.speakersService.getSpeaker(speakerId);
  }

  @Get('/')
  async getSpeakers() {
    return await this.speakersService.getSpeakers();
  }

  @Post('/')
  async createSpeaker(@Body() createSpeakerDto: CreateSpeakerDto) {
    const speakerData = {
      ...createSpeakerDto,
    };

    return await this.speakersService.createSpeaker(speakerData);
  }

  @Put('/:speakerId')
  async updateSpeaker(
    @Param('speakerId') speakerId: number,
    @Request() req: any,
    @Body() updateModuleDto: UpdateSpeakerDto
  ) {
    return await this.speakersService.updateSpeaker(speakerId, updateModuleDto);
  }
}
