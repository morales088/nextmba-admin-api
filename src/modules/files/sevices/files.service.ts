import { Injectable } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repository';

@Injectable()
export class FilesService {
    constructor(
        private readonly fileRepository: FileRepository
      ) {}

    async getFiles(){
        return await this.fileRepository.find()
    }

    async createFile(data){
        return await this.fileRepository.insert(data)
    }

    async updateFile(id: number, data){
        return await this.fileRepository.updateFile(id, data)
    }
}
