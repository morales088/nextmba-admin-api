import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './services/admin.service';
import { CreateAdminDTO, UpdateAdminDTO } from './dto/admin.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';

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
  
  @Put('forgot-password')
  async forgotPassword(@Request() req: any, @Body() forgotPasswordDTO: ForgotPasswordDTO) {
    const user = req.user;
    return this.adminService.forgotPassword(user.userId, forgotPasswordDTO);
  }

  @Put('/:id')
  async updateUpdate(@Param('id') adminId: number, @Body() updateAdminDto: UpdateAdminDTO) {
    return this.adminService.updateAdmin(adminId, updateAdminDto);
  }

}
