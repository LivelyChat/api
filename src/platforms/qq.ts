import { NCWebsocket } from 'node-napcat-ts';
import type { Group, Message } from '../schemas.js';
import config from '../../config.json' with { type: 'json' };

export default class {
  napcat: NCWebsocket;
  chats = config.platforms.qq.chats;

  constructor(callback: (message: Message) => Promise<void>) {
    const { protocol, host, port } = config.platforms.qq;
    this.napcat = new NCWebsocket(
      {
        protocol: protocol === 'ws' ? 'ws' : 'wss',
        host,
        port,
        throwPromise: true,
        reconnection: {
          enable: true,
          attempts: 10,
          delay: 5000
        }
      },
      true
    );
    this.napcat.on('message', async (context) => {
      const message = {
        id: context.message_id.toString(),
        content: context.raw_message,
        elements: context.message,
        timestamp: context.time,
        sender: {
          id: context.sender.user_id.toString(),
          avatar: `https://q.qlogo.cn/headimg_dl?dst_uin=${context.sender.user_id}&spec=640`,
          username: context.sender.nickname,
          nickname: context.sender.card
        },
        platform: 'qq'
      };

      switch (context.message_type) {
        case 'group':
          if (!this.chats.some((chat) => chat.id === context.group_id.toString())) {
            return;
          }
          await callback({
            ...message,
            sender: {
              ...message.sender,
              role: context.sender.role
            },
            chatId: context.group_id.toString()
          });
          break;
        default: {
          const chatId = `private:${context.user_id}`;
          if (!this.chats.some((chat) => chat.id === chatId)) {
            return;
          }
          await callback({
            ...message,
            chatId
          });
          break;
        }
      }
    });

    this.napcat
      .connect()
      .then(() => {
        console.log('Successfully connected to QQ.');
      })
      .catch((error) => {
        console.error('Failed to connect to QQ:', error);
      });
  }

  async getGroupInfo(groupId: string): Promise<Group> {
    const result = await this.napcat.get_group_info({
      group_id: parseInt(groupId)
    });
    const id = result.group_id.toString();
    return {
      id,
      name: result.group_name,
      avatar: `http://p.qlogo.cn/gh/${id}/${id}/640`,
      memberCount: result.member_count
    };
  }
}
