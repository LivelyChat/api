# LivelyChat API

## Features

- **NapCatQQ integration**: Connected with NapCatQQ as a WebSocket server
- **Realtime connection**: Live broadcasts messages through SocketIO
- **Message persistency**: Stores chat messages in MongoDB

## Configuration

A template for `config.json` can be found at `./config.json.example`.

### QQ

You may define chats to monitor through `platforms.qq.chats`. A config item for a chat is as follows:

```jsonc
{
  "id": "1919810", // group number, or `private:{QQ number}` for private chats
  "aliases": ["my-chat", "another alias"], // optional aliases for the chat that will also serve as identifiers
  "secret": "your_secret" // an optional secret key that will be required to enter when accessing this chat
}
```

## Deployment

### Prerequisites

- [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/)
- [NapCatQQ](https://napneko.github.io/)

### Setup

1. In your MongoDB instance, create a database that has a [**time series**](https://www.mongodb.com/docs/manual/core/timeseries-collections/) collection `messages`.
2. In NapCatQQ, create a new WebSocket client.
3. Clone this repository.
4. Copy `config.json.example` to `config.json` and make necessary changes.
   - Remember to change `mongoDbName` to the name of the database you've just created!
5. Install dependencies via `pnpm i`.
6. Build the app with `pnpm build`.
7. Start a Node server with `pnpm start`.
   - The server will by default listen on port 3000.
   - If you want to run it on a different port, use `PORT={your port} pnpm start`.

## Development

Start a development server via `pnpm dev`.
