import { Injectable } from '@nestjs/common';
import { StudentRepository } from '../repositories/student.repository';
import { HashService } from 'src/common/utils/hash.service';

@Injectable()
export class StudentsService {
    
    constructor(
        private readonly hashService: HashService,
        private readonly studentRepository: StudentRepository
      ) {}
  
      async getStudent(id:number) {
        return this.studentRepository.findById(id);
      }
      
    async getStudents() {
      return this.studentRepository.find();
    }
      
    async createStudent(data) {

        const hashedPassword = await this.hashService.hashPassword(data.password);

        const studentData = {
            ...data,
            password: hashedPassword
        }
        
      return this.studentRepository.insert(studentData);
    }
  
    // async updateStudent(id: number, data) {
    //   return this.studentRepository.updateStudent(id, data);
    // }
}
