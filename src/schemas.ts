import { z } from '@hono/zod-openapi';

export const QuerySchema = z
  .object({
    platform: z
      .string()
      .transform((val) => val.toLowerCase())
      .openapi({
        description: 'Filter messages by platform',
        example: 'qq'
      }),
    chat: z.string().openapi({
      description: 'Filter messages by chat ID or alias',
      example: '12345678'
    }),
    secret: z.string().optional().openapi({
      description: 'Secret for authentication',
      example: 'my-secret'
    }),
    before: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : undefined))
      .pipe(z.number().int().optional())
      .openapi({
        description: 'Fetch messages before this timestamp'
      }),
    limit: z
      .string()
      .transform((val) => parseInt(val))
      .pipe(z.number().int().min(1).max(100))
      .default('20')
      .openapi({
        description: 'Number of items per page',
        example: '20'
      })
  })
  .openapi('Query');

export const UserSchema = z
  .object({
    id: z.string().openapi({
      example: '12345678'
    }),
    avatar: z.string().openapi({
      example: 'https://example.com/avatar.jpg'
    }),
    username: z.string().openapi({
      example: 'John Doe'
    }),
    nickname: z.string().openapi({
      example: 'JD'
    }),
    role: z.string().optional().openapi({
      example: 'admin',
      description: 'User role in the chat'
    })
  })
  .openapi('User');

export const MessageSchema = z.object({
  id: z.string().openapi({
    example: '123'
  }),
  content: z.string().openapi({
    example: 'Hello, world!'
  }),
  elements: z.array(z.any()).openapi({
    description: 'List of message elements'
  }),
  timestamp: z.number().openapi({
    example: 1633072800
  }),
  sender: UserSchema,
  chatId: z.string().openapi({
    example: '12345678'
  }),
  platform: z.string().openapi({
    example: 'qq'
  })
});

export const MessageListSchema = z
  .object({
    total: z.number().openapi({
      description: 'Total number of messages',
      example: 100
    }),
    messages: z.array(MessageSchema).openapi({
      description: 'List of messages'
    })
  })
  .openapi('MessageList');

export const GroupSchema = z.object({
  id: z.string().openapi({
    description: 'Group ID',
    example: '12345678'
  }),
  name: z.string().openapi({
    description: 'Group name',
    example: 'My Group'
  }),
  avatar: z.string().openapi({
    description: 'Group avatar URL',
    example: 'https://example.com/group-avatar.jpg'
  }),
  memberCount: z.number().openapi({
    description: 'Number of members in the group',
    example: 100
  })
});

export const ErrorSchema = z.object({
  error: z.string().openapi({
    description: 'Error message'
  })
});

export type Query = z.infer<typeof QuerySchema>;
export type Message = z.infer<typeof MessageSchema>;
export type MessageList = z.infer<typeof MessageListSchema>;
export type Group = z.infer<typeof GroupSchema>;
