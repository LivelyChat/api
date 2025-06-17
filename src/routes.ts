import { createRoute, z } from '@hono/zod-openapi';
import {
  ErrorSchema,
  GroupSchema,
  MessageListSchema,
  MessageSchema,
  QuerySchema
} from './schemas.js';

export const NewMessage = createRoute({
  method: 'post',
  path: '/messages/new',
  request: {
    body: {
      content: {
        'application/json': {
          schema: MessageSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Creates a new message'
    }
  }
});

export const GetMessages = createRoute({
  method: 'get',
  path: '/messages',
  request: {
    query: QuerySchema
  },
  responses: {
    200: {
      description: 'Fetches messages',
      content: {
        'application/json': {
          schema: MessageListSchema
        }
      }
    },
    403: {
      description: 'Invalid secret',
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      }
    },
    404: {
      description: 'Chat not found',
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      }
    }
  }
});

export const GetQqGroupInfo = createRoute({
  method: 'get',
  path: '/qq/group/{groupId}',
  request: {
    params: z.object({
      groupId: z.string().openapi({
        description: 'QQ group ID',
        example: '12345678'
      })
    }),
    query: z.object({
      secret: z.string().optional().openapi({
        description: 'Secret for authentication',
        example: 'my-secret'
      })
    })
  },
  responses: {
    200: {
      description: 'Gets information about a QQ group',
      content: {
        'application/json': {
          schema: GroupSchema
        }
      }
    },
    403: {
      description: 'Invalid secret',
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      }
    },
    404: {
      description: 'Chat not found',
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      }
    }
  }
});

export const Overview = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      description: 'Overview of the API',
      content: {
        'application/json': {
          schema: z.object({
            messageCount: z.number().openapi({
              description: 'Total number of messages',
              example: 1000
            }),
            chatCount: z.number().openapi({
              description: 'Total number of chats',
              example: 50
            })
          })
        }
      }
    }
  }
});
