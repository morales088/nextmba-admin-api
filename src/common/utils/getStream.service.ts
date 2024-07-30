import { Injectable } from '@nestjs/common';
import { StreamClient } from '@stream-io/node-sdk';

@Injectable()
export class StreamService {
  private client: StreamClient;
  private exp = Math.round(new Date().getTime() / 1000) + 60 * 60 * 24 * 3;

  constructor() {
    this.client = new StreamClient(process.env.GETSTREAM_API_KEY, process.env.GETSTREAM_API_SECRET);
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
    const call = this.client.video.call('default', callId);
    await call.create({
      data: {
        created_by_id: userId,
        custom: {
          // is_public: true,
        },
      },
    });

    // const addAdmin = await this.addUserToCall(callId, userId, 'admin')
    // const addUser = await this.addUserToCall(callId, 'neil')

    // console.log(addAdmin);
    // console.log(addUser);

    const token = this.client.createToken(userId, this.exp); // Generate a token for the user
    return { callId: call.id, createdBy: userId, token };
  }

  async endCall(callId: string) {
    const call = this.client.video.call('livestream', callId);
    await call.endCall(); // End the call
    return { message: `Call ${callId} ended successfully` };
  }

  async addUserToCall(callId: string, userId: string, role: string = 'user') {
    const data = {
      user_id: userId, role: role 
    }
    const call = this.client.video.call('livestream', callId);
    await call.updateCallMembers({
      update_members: [data],
    });

    const token = this.client.createToken(userId, this.exp);
    return { callId: call.id, userId, role: role, token };
  }
}
