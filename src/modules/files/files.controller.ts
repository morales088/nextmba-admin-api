import { Body, Controller, Get, Param, Post, Put, Request } from '@nestjs/common';
import { FilesService } from './sevices/files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Controller('files')
export class FilesController {
    constructor(
        private readonly filesService: FilesService,
      ) {}
      
      @Get('/')
      async getTopics() {
        return await this.filesService.getFiles();
      }
      
      @Post('/')
      async createFiles(@Body() createFileDto : CreateFileDto) {
    
        const fileData = {
          ...createFileDto,
        };
  
        return await this.filesService.createFile(fileData)
      }
  
      @Put('/:fileId')
      async updateFile(
        @Param('fileId') fileId: number,
        @Request() req: any, 
        @Body() updateFileDto: UpdateFileDto
        ) {
            return await this.filesService.updateFile(fileId, updateFileDto)
      }

}
