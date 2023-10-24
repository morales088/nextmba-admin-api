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
        const password = data.password ?? this.generateRandomString(8);
        const hashedPassword = await this.hashService.hashPassword(password);

        const studentData = {
            ...data,
            password: hashedPassword
        }
        
      return this.studentRepository.insert(studentData);
    }
  
    async updateStudent(id: number, data) {
      return this.studentRepository.updateStudent(id, data);
    }

    generateRandomString(length: number): string {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
  
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
      }
  
      return randomString;
    }
}
