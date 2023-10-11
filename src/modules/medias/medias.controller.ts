import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MediasService } from './services/medias.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Controller('medias')
@UseGuards(AuthGuard('jwt'))
export class MediasController {
    constructor(
        private readonly mediasService: MediasService,
      ) {}
      
      @Get('/')
      async getTopics() {
        return await this.mediasService.getMedias();
      }

      @Post('/')
      async createFiles(@Body() createMediaDto : CreateMediaDto) {
    
        const mediaDto = {
          ...createMediaDto,
        };
  
        return await this.mediasService.createMedia(mediaDto)
      }
  
      @Put('/:fileId')
      async updateFile(
        @Param('fileId') fileId: number,
        @Request() req: any, 
        @Body() updateMediaDto: UpdateMediaDto
        ) {
            return await this.mediasService.updateMedia(fileId, updateMediaDto)
      }
}
