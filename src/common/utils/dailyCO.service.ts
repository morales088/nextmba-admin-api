import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DailycoService {
  private apiKey: string = process.env.DAILY_API;
  private url: string = 'https://api.daily.co/v1';

  #awsS3;
  private bucket: string = process.env.AWS_BUCKET;
  private region: string = process.env.AWS_DEFAULT_REGION;

  async createMeetingRoom(roomName: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.url}/rooms`,
        {
          name: roomName,
          // privacy: 'private',
          properties: {
            enable_chat: true,
            enable_emoji_reactions: true,
            enable_advanced_chat: true,
            // "enable_recording" : "cloud",
            enable_recording: 'raw-tracks',
            // recordings_bucket: {
            //   bucket_name: 'next-mba-live-recordings',
            //   bucket_region: 'this.region',
            //   assume_role_arn: 'arn:aws:iam::339626983134:role/raw-tracks',
            //   allow_api_access: true,
            // },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      console.log('1', response.data);
      const roomConfig = await this.roomConfig(roomName);
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create meeting room: ${error.message}`);
    }
  }

  async deleteMeetingRoom(roomId: string): Promise<void> {
    console.log(`${this.url}/rooms/${roomId}`);
    try {
      await axios.delete(`${this.url}/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete meeting room: ${error.message}`);
    }
  }

  async roomConfig(roomId: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.url}/rooms/${roomId}`,
        {
          properties: {
            recordings_bucket: {
              bucket_name: 'next-mba-live-recordings',
              bucket_region: this.region,
              assume_role_arn: 'arn:aws:iam::339626983134:role/raw-tracks',
              allow_api_access: true,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );
      console.log('2', response.data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add config to meeting room: ${error.message}`);
    }
  }
}
