import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './services/admin.service';
import { HashService } from '../../common/utils/hash.service';
import { CreateAdminDTO, UpdateAdminDTO } from './dto/create-admin.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/')
  async fetchAllAdmin() {
    return this.adminService.findAllAdmin();
  }

  @Post('/')
  async createAdmin(@Body() createAdminDto: CreateAdminDTO) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Put('/:id')
  async updateUpdate(@Param('id') adminId: number, @Body() updateAdminDto: UpdateAdminDTO) {
    return this.adminService.updateAdmin(adminId, updateAdminDto);
  }
}
