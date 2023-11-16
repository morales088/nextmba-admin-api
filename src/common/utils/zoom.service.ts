import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ZoomService {
  private accId = process.env.ZOOM_ACC_ID;
  private apiSecret = process.env.ZOOM_API_SECRET;
  private baseUrl = process.env.ZOOM_URL;

  private async getZoomAccessToken(): Promise<string> {
    const url = 'https://zoom.us/oauth/token';
    const data = {
      grant_type: 'client_credentials',
      client_id: this.accId,
      client_secret: this.apiSecret,
    };

    const response = await axios.post(url, null, {
      params: data,
    });
    
    return response.data.access_token;
  }

  async createMeeting(topic: string, type: number = 1): Promise<any> {
    const url = this.baseUrl + 'users/me/meetings';
    const data = {
      topic,
      type: type, // 1 for instant meeting
    };
    
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${await this.getZoomAccessToken()}`,
      },
    });
    
    return response.data;
  }

  async getMeetings(){
    const url = this.baseUrl + 'users/{userId}/meetings';
    // const data = {
    //   grant_type: 'client_credentials',
    //   client_id: this.apiKey,
    //   client_secret: this.apiSecret,
    // };
        
    const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${await this.getZoomAccessToken()}`,
        },
      });
  }

}
