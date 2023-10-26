import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your AWS Access Key
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your AWS Secret Key
    });
  }

  getS3Instance(): AWS.S3 {
    return this.s3;
  }
}
