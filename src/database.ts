import { Collection, MongoClient } from 'mongodb';
import type { Message, MessageList } from './schemas.js';
import config from '../config.json' with { type: 'json' };

interface DbMessage {
  id: string;
  content: string;
  elements: unknown[];
  metadata: {
    sender: {
      id: string;
      avatar: string;
      username: string;
      nickname: string;
      role?: string | undefined;
    };
    chatId: string;
    platform: string;
  };
  timestamp: Date;
}

export class Database {
  private client: MongoClient;
  private uri: string;
  private dbName: string;
  private connected: boolean = false;

  constructor() {
    this.uri = config.mongoDbUri;
    this.dbName = config.mongoDbName;
    this.client = new MongoClient(this.uri);
    this.connect();
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
      console.log('[MongoDB] Connected.');
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
      console.log('[MongoDB] Disconnected.');
    }
  }

  private transform(message: Message): DbMessage {
    const { timestamp, sender, chatId, platform, ...rest } = message;
    return {
      metadata: {
        sender,
        chatId,
        platform
      },
      timestamp: new Date(timestamp * 1000),
      ...rest
    };
  }

  private detransform(doc: DbMessage): Message {
    const { metadata, timestamp, ...rest } = doc;
    return {
      ...rest,
      timestamp: Math.floor(timestamp.getTime() / 1000),
      sender: metadata.sender,
      chatId: metadata.chatId,
      platform: metadata.platform
    };
  }

  private getCollection(name: string): Collection {
    return this.client.db(this.dbName).collection(name);
  }

  async countMessages(): Promise<number> {
    await this.connect();
    const collection = this.getCollection('messages');
    return collection.countDocuments();
  }

  async getMessages(
    platform: string,
    chatId: string,
    limit: number,
    before?: number | undefined
  ): Promise<MessageList> {
    await this.connect();
    const collection = this.getCollection('messages');

    const findQuery: Record<string, string | object> = {};

    if (platform) findQuery['metadata.platform'] = platform;
    if (chatId) findQuery['metadata.chatId'] = chatId;
    if (before) findQuery['timestamp'] = { $lt: new Date(before * 1000) };

    const total = await collection.countDocuments(findQuery);
    const messages = await collection
      .find(findQuery)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return {
      total,
      messages: messages.map((doc) => this.detransform(doc as unknown as DbMessage))
    };
  }

  async saveMessage(message: Message): Promise<void> {
    await this.connect();
    const collection = this.getCollection('messages');
    await collection.insertOne(this.transform(message));
  }
}

const db = new Database();
export default db;
