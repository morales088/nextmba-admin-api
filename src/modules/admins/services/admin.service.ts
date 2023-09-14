import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { CreateAdminDTO, UpdateAdminDTO } from '../dto/create-admin.dto';
import { HashService } from 'src/common/utils/hash.service';

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
}
