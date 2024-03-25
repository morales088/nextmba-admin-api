import { Test, TestingModule } from '@nestjs/testing';
import { CertificateApiController } from './certificate_api.controller';

describe('CertificateApiController', () => {
  let controller: CertificateApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificateApiController],
    }).compile();

    controller = module.get<CertificateApiController>(CertificateApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
