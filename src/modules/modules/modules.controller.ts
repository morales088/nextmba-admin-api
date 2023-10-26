import { Body, Controller, Get, Param, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModulesService } from './services/modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('modules')
@UseGuards(AuthGuard('jwt'))
export class ModulesController {
  constructor(private readonly modulesService: ModulesService,private readonly awsS3Service: AwsS3Service) {}

  @Get('/:moduleId')
  async getModule(@Param('moduleId') moduleId: number) {
    return await this.modulesService.getModule(moduleId);
  }

  @Get('/')
  async getModules() {
    return await this.modulesService.getModules();
  }

  @Post('/')
  async createModule(@Body() createModuleDto: CreateModuleDto) {
    const moduleData = {
      ...createModuleDto,
    };

    return await this.modulesService.createModules(moduleData);
  }

  @Put('/:moduleId')
  async updateModule(
    @Param('moduleId') moduleId: number,
    @Request() req: any,
    @Body() updateModuleDto: UpdateModuleDto
  ) {
    return await this.modulesService.updateModule(moduleId, updateModuleDto);
  }
  
  @Post("/upload")
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {

    if (file.size > 100000000) { // more than 100mb
      const fileUrl = await this.awsS3Service.uploadBigfile(file);
      return { fileUrl };
    }else{
      const fileUrl = await this.awsS3Service.uploadFile(file);
      return { fileUrl };
    }

  }
}
