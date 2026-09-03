# Chat App

Username/password 1:1 chat app. React (Vite) frontend, Express backend, MongoDB, real-time messaging via Socket.IO.

## Structure

- `server/` — Express API + Socket.IO server
- `client/` — React frontend (Vite)

## Prerequisites

- Node.js 18+
- A running MongoDB instance. Options:
  - Local install: `brew install mongodb-community && brew services start mongodb-community`
  - Docker: `docker run -d -p 27017:27017 --name chat-mongo mongo`
  - [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster — update `MONGO_URI` in `server/.env`

## Running locally

```bash
# Terminal 1
cd server
npm install   # already installed
npm run dev

# Terminal 2
cd client
npm install   # already installed
npm run dev
```

Client runs at http://localhost:5173 and proxies `/api` and `/socket.io` to the server at http://localhost:5001 (see `client/vite.config.js`).

`server/.env` was generated with a random `JWT_SECRET` and `MESSAGE_ENCRYPTION_KEY`, and points `MONGO_URI` at `mongodb://127.0.0.1:27017/chat-app`. Edit it if your MongoDB runs elsewhere.

## Deployment

This app deploys as a **single service**: in production, Express serves the built React app as static files plus the API and Socket.IO from the same process/origin, so there's no CORS or cross-site cookie configuration to worry about.

1. Push this repo to GitHub (or your platform of choice's git remote) — it isn't a git repo yet, so run `git init`, commit, and add a remote first.
2. On your host (Render, Railway, Fly, a VPS, etc.), set:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
   - **Root directory:** repo root (the root `package.json` orchestrates installing/building `client` and installing `server`)
3. Set these environment variables on the host (mirror `server/.env.example`):
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET`, `MESSAGE_ENCRYPTION_KEY` — generate fresh ones for production, don't reuse your local dev values
   - `CLIENT_URL` — the app's own public URL (e.g. `https://your-app.onrender.com`). Socket.IO checks the request's `Origin` header against this even for same-origin requests, so it must match exactly.
   - `NODE_ENV=production` — required for secure cookies and to enable the static-file serving in `server/src/index.js`
   - `PORT` — most platforms inject this automatically; the server already honors `process.env.PORT`
4. In MongoDB Atlas, make sure the cluster's IP access list allows your host's outbound traffic (most PaaS platforms use dynamic IPs, so `0.0.0.0/0` is the usual pragmatic choice there).

## Features

- Sign up / log in with a unique username + password (bcrypt-hashed, JWT session in an httpOnly cookie)
- Search users by username
- Start a 1:1 conversation with any user (no groups)
- Real-time messaging over Socket.IO, with message history persisted in MongoDB
- Message text is encrypted at rest (AES-256-GCM) before it's written to MongoDB, and decrypted on read
- A user can have many separate conversations with different users
