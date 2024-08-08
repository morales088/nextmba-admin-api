import { Injectable } from '@nestjs/common';
import { StreamClient } from '@stream-io/node-sdk';
import { StreamChat } from 'stream-chat';

@Injectable()
export class StreamService {
  private client: StreamClient;
  private chatClient: StreamChat;
  private exp = Math.round(new Date().getTime() / 1000) + 60 * 60 * 24 * 3;

  constructor() {
    this.client = new StreamClient(process.env.GETSTREAM_API_KEY, process.env.GETSTREAM_API_SECRET);
    this.chatClient = StreamChat.getInstance(process.env.GETSTREAM_API_KEY, process.env.GETSTREAM_API_SECRET);
  }
  async createUser(userId: string) {
    const user = {
      id: userId,
      name: `User ${userId}`,
    };

    await this.client.upsertUsers({
      users: {
        [user.id]: user,
      },
    });
    const token = this.client.createToken(userId);
    return { user, token };
  }

  async createCall(callId: string, userId: string) {
    await this.createUser(userId)
    const call = this.client.video.call('default', callId);
    await call.create({
      data: {
        created_by_id: userId,
        members: [{ user_id: userId, role: 'admin' }],
        // settings_override: {
        //   backstage: {
        //     enabled: true,
        //     // join_ahead_time_seconds: 300,
        //   },
        // },
      },
    });

    // const addAdmin = await this.addUserToCall(callId, userId, 'admin')
    // const addUser = await this.addUserToCall(callId, 'neil')

    // console.log(addAdmin);
    // console.log(addUser);
    // console.log(call);
    // await this.enableBackstage(callId)

    const token = this.client.createToken(userId, this.exp); // Generate a token for the user
    return { callId: call.id, createdBy: userId, token };
  }

  async endCall(callId: string) {
    try {
      const call = this.client.video.call('default', callId);
      await call.endCall(); // Attempt to end the call

      // await this.stopLive(callId) // stop live  

      return { message: `Call ${callId} ended successfully` };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { message: `Call ${callId} does not exist` };
      } else {
        return { message: `Failed to end call ${callId}: ${error.message}` };
      }
    }
  }

  async addUserToCall(callId: string, userId: string, role: string = 'user') {
    const data = {
      user_id: userId,
      role: role,
    };
    const call = this.client.video.call('default', callId);
    await call.updateCallMembers({
      update_members: [data],
    });

    const token = this.client.createToken(userId, this.exp);
    return { callId: call.id, userId, role: role, token };
  }

  async enableBackstage(callId: string) {
    try {
      const call = this.client.video.call('default', callId);
      const update = await call.update({
        // settings_override: {
        //   backstage: {
        //     enabled: true,
        //     join_ahead_time_seconds: 300,
        //   },
        // },
      });
      
      // console.log(update);
      return { message: `Backstage enabled for call ${callId} successfully` };
    } catch (error) {
      return { message: `Failed to enable backstage for call ${callId}: ${error.message}` };
    }
  }

  async goLive(callId: string) {
    try {
      const call = this.client.video.call('default', callId);
      call.goLive();
      return { message: `Call ${callId} is now live` };
    } catch (error) {
      return { message: `Failed to start live for call ${callId}: ${error.message}` }
    }
  }

  async stopLive(callId: string) {
    try {
      const call = this.client.video.call('default', callId);
      await call.stopLive();
      return { message: `Call ${callId} is no longer live` };
    } catch (error) {
      return { message: `Failed to stop live for call ${callId}: ${error.message}` };
    }
  }

  async createChatChannel(channelId: string, userId: string, channelName: string) {
    try {
      const channel = this.chatClient.channel('messaging', channelId, {
        name : channelName,
        created_by_id: userId,
        members: [userId],
      });
      const chat = await channel.create();
      console.log(chat)
      return { message: `Channel ${channelId} created successfully`, channelId };
    } catch (error) {
      console.log(error)
      return { message: `Failed to create channel ${channelId}: ${error.message}` };
    }
  }

}
