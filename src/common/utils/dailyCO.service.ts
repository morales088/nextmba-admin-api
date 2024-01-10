import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DailycoService {
  private apiKey: string = process.env.DAILY_API;
  private url: string = 'https://api.daily.co/v1';

  async createMeetingRoom(roomName: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.url}/rooms`,
        {
          name: roomName,
          // privacy: 'private',
          "properties": {
            "enable_chat" : true,
            "enable_emoji_reactions" : true,
            "enable_advanced_chat" : true
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create meeting room: ${error.message}`);
    }
  }
  async deleteMeetingRoom(roomId: string): Promise<void> {
    console.log(`${this.url}/rooms/${roomId}`)
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
}
