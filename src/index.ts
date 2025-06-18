import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { Server } from 'socket.io';
import { GetMessages, GetQqGroupInfo, NewMessage, Overview } from './routes.js';
import db from './database.js';
import Platforms from './platforms/index.js';
import type { Message } from './schemas.js';
import { getChatCount, getConfig, truncate, validate } from './utils.js';

type ErrorCode = 403 | 404;

const receiveMessage = async (message: Message) => {
  await db.saveMessage(message);
  const addr = `${message.platform}/${message.chatId}`;
  io.to(addr).emit('message', message);
  console.log(`Received message from ${addr}:`, truncate(message.content));
};

const platforms = new Platforms(receiveMessage);
const app = new OpenAPIHono();

app.use('/*', cors());

app.openapi(NewMessage, async (c) => {
  const message = c.req.valid('json');
  await receiveMessage(message);
  return c.newResponse(null, 201);
});

app.openapi(GetMessages, async (c) => {
  const query = c.req.valid('query');
  const v = validate(query.platform, query.chatId, query.secret);
  if (v) {
    return c.json({ error: v.error }, v.status as ErrorCode);
  }
  const result = await db.getMessages(query);
  return c.json(result, 200);
});

app.openapi(GetQqGroupInfo, async (c) => {
  const { groupId } = c.req.valid('param');
  const { secret } = c.req.valid('query');
  const v = validate('qq', groupId, secret);
  if (v) {
    return c.json({ error: v.error }, v.status as ErrorCode);
  }
  return c.json(await platforms.qq.getGroupInfo(groupId), 200);
});

app.doc('/openapi', {
  openapi: '1.0.0',
  info: {
    version: '1.0.0',
    title: 'LivelyChat API'
  }
});

app.openapi(Overview, async (c) => {
  const chatCount = getChatCount();
  const messageCount = await db.countMessages();
  return c.json({ chatCount, messageCount }, 200);
});

const server = serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}.`);
  }
);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  const joinedRooms = new Set<string>();

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected.`);
    joinedRooms.forEach((room) => {
      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
      io.to(room).emit('left', socket.id, roomSize);
    });
  });

  socket.on('join', (platform, chat, secret) => {
    const room = `${platform}/${chat}`;
    const chatConfig = getConfig(platform, chat);
    if (!chatConfig) socket.emit('error', 'Chat not found');
    if (chatConfig?.secret && chatConfig.secret !== secret) {
      socket.emit('error', 'Invalid secret');
      return;
    }
    socket.join(room);
    joinedRooms.add(room);
    console.log(`Socket ${socket.id} joined ${room}.`);
    io.to(room).emit('joined', socket.id, io.sockets.adapter.rooms.get(room)?.size || 0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  io.disconnectSockets(true);
  await db.disconnect();
  server.close();
  console.log('Process exited.');
  process.exit(0);
});
