import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModulesService } from './services/modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('modules')
@UseGuards(AuthGuard('jwt'))
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Get('/:moduleId')
  async getModule(@Param('moduleId') moduleId: number) {
    return await this.modulesService.getModule(moduleId);
  }

  @Get('/')
  async getModules(
    @Query('search') search?: string,
    @Query('course') course?: number,
    @Query('status') status?: number,
    @Query('page_number') page_number?: number,
    @Query('per_page') per_page?: number
  ) {
    const pageNumber = page_number ? page_number : 1;
    const perPage = per_page ? per_page : 10;

    const filterData = {
      search,
      course,
      status,
    };
    console.log(filterData)
    return await this.modulesService.getModules(filterData, pageNumber, perPage);
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

  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      })
    )
    file: Express.Multer.File
  ) {
    const path = 'images/courses_cover';

    if (file.size > 100000000) {
      // more than 100mb
      const fileUrl = await this.awsS3Service.uploadBigfile(path, file);
      return { fileUrl };
    } else {
      const fileUrl = await this.awsS3Service.uploadSmallFile(path, file);
      return { fileUrl };
    }
  }
}
