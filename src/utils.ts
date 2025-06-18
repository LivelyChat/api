import config from '../config.json' with { type: 'json' };

export const getConfig = (platform: string, chat: string) =>
  config.platforms[platform as keyof typeof config.platforms].chats.find((c) => c.id === chat);

export const validate = (platform: string, chat: string, secret?: string) => {
  const chatConfig = getConfig(platform, chat);
  if (!chatConfig) return { status: 404, error: 'Chat not found' };
  if (chatConfig?.secret && chatConfig.secret !== secret) {
    return { status: 403, error: 'Invalid secret' };
  }
};

export const getChatCount = () => {
  let chatCount = 0;
  Object.keys(config.platforms).forEach((platform) => {
    chatCount += config.platforms[platform as keyof typeof config.platforms].chats.length;
  });
  return chatCount;
};

export const truncate = (str: string, length: number = 65) => {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
};
