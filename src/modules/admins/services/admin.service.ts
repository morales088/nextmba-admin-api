import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { CreateAdminDTO, UpdateAdminDTO } from '../dto/admin.dto';
import { HashService } from 'src/common/utils/hash.service';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly hashService: HashService
  ) {}

  async findAllAdmin() {
    return this.adminRepository.findAllAdmin();
  }

  async createAdmin(createAdminDto: CreateAdminDTO) {
    const { password } = createAdminDto;
    const hashedPassword = await this.hashService.hashPassword(password);

    const adminData = {
      ...createAdminDto,
      password: hashedPassword,
    };

    return this.adminRepository.create(adminData);
  }

  async updateAdmin(adminId: number, updateAdminDto: UpdateAdminDTO) {
    const updateAdminData = {
      role: updateAdminDto.role,
      status: updateAdminDto.status
    }
    return this.adminRepository.update(adminId, updateAdminData)
  }

  async forgotPassword(id : number, forgotPasswordDTO: ForgotPasswordDTO) {
    const { old_password, new_password } = forgotPasswordDTO;
    const user = await this.adminRepository.find(id);
    
    if (user && (await this.hashService.comparePassword(old_password, user.password))) {
      
    const hashedPassword = await this.hashService.hashPassword(new_password);

    const adminData = {
      password: hashedPassword,
    };

    return this.adminRepository.update(id, adminData)

    }else{
      return {message : "Old password mismatch."}
    }
  }
}
