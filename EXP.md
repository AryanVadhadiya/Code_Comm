# CodeShare — End-to-End System and Networking Explanation

This document explains how the application works from the moment a user opens the website to collaborative editing, realtime synchronization via sockets, and persistence to MongoDB. It also covers how the app maps onto computer networking concepts (HTTP, WebSockets, TCP, CORS, ports, proxies, and scaling).

## High-level architecture

- Client: React (Vite) SPA. UI built with CodeMirror 5 (editor), Material UI, Bootstrap, and PrimeReact. Uses Socket.IO client for realtime sync and Axios for HTTP.
- Server: Node.js + Express (REST) + Socket.IO (realtime). One REST endpoint to register users/rooms; socket events for joining rooms, sharing code, language mode, and presence.
- Database: MongoDB via Mongoose. Collection `rdata` stores one document per room: `{ roomid: string, code: string, username: string[] }`.
- Realtime channel: Socket.IO rooms keyed by `roomid` for publishing code/language updates to all participants.

Key ports and environment variables:
- Frontend dev server: `5173` (Vite default).
- Backend server: `PORT` (defaults to `3000`).
- Client → Server base URL: `VITE_BACKEND_URL` (e.g., `http://localhost:3000`).
- CORS origin: `FRONTEND_URL` on the server (set to your frontend origin in production; wildcard during dev if unset).
- MongoDB connection string: `MONGODB_URL` (required by `server/conn.js`).

## Data model (server/coll.js)

Mongoose schema:

```
{
  roomid: String,
  code: { type: String, default: "" },
  username: [String]
}
```

In-memory server state while users are connected (server/server.js):
- `usersocket[roomid]: string[]` — socket IDs in the room
- `usernames[roomid]: string[]` — usernames in the room
- `mapping[socketId]: roomid` — reverse index from socket to room
- `roomcode[roomid]: string` — current text buffer (last writer wins)
- `roomlanguage[roomid]: string` — current editor language/mode

## Lifecycle walkthrough (end-to-end)

### 1) Open the website

- In development, you visit `http://localhost:5173/`. Vite serves the SPA index.html over HTTP on port 5173. The browser downloads the JS bundles and mounts `App.jsx`.
- In production, your static files are served by a CDN or host over HTTPS/HTTP. DNS resolves your domain to an IP; the browser opens a TCP connection to port 443/80, negotiates TLS if HTTPS.

Networking concepts:
- Layering: HTTP(S) application layer over TCP (transport) over IP (network).
- The SPA uses the History API for routing; the server only needs to serve `index.html` (client-side routing handles paths like `/room/:roomid`).

### 2) Join a room (REST over HTTP)

- Component: `src/Components/Login/login.jsx`.
- User enters `Username` and `Room ID`. On submit:
  - The client stores `name` in `localStorage`.
  - Sends `POST {backend}/data` with JSON `{ name, roomId }` using Axios.

Server handling (Express in `server/server.js`):
- Middleware: `cors` permits cross-origin requests from `FRONTEND_URL` (or `*` in dev), `body-parser` parses JSON.
- Handler `POST /data`:
  - If a room exists and the username is not in `username[]`, push it and save.
  - If no room exists, create `{ roomid, username: [name], code: "" }`.
  - Respond `200` on success.

Networking concepts:
- HTTP/1.1 request with method `POST`, a JSON body, and CORS headers.
- If running on different origins (e.g., `5173` → `3000`), the browser may send a preflight `OPTIONS` request; the server replies with `Access-Control-Allow-*` headers.
- This HTTP request uses its own TCP connection (or connection pool) to the server.

### 3) Establish realtime connection (Socket.IO → WebSocket)

- Component: `src/Components/Dashboard/dash.jsx`.
- After navigation to `/room/:roomid`, the client creates a Socket.IO connection to `VITE_BACKEND_URL`:
  - Socket.IO starts with an HTTP handshake (`/socket.io/...`), then upgrades to a WebSocket if possible. If WebSocket is blocked, it can fall back to long polling.
- Immediately after connect, the client emits `Update_users` with `{ id: roomid, username }`.

Server handling:
- `io.on('connection', socket => { ... })` registers listeners.
- On `Update_users`:
  - `socket.join(roomid)` — join a Socket.IO “room” (server-side group, not a network room).
  - Save `socket.username` for presence messages.
  - `socket.broadcast.to(roomid).emit('New user joined', username)`.
  - If this room was newly seen in-memory, load persisted `code` from MongoDB into `roomcode[roomid]`.
  - Track `usersocket`, `usernames`, and `mapping` for this room.
  - Unicast to the new user:
    - `Code for new user` with the string buffer
    - If known, `Language for new user` and `mode for new user`
  - Broadcast to the room: `User list for frontend` with the usernames array.

Networking concepts:
- WebSocket upgrades an HTTP connection to a persistent, full-duplex TCP channel.
- Socket.IO adds an event-based messaging layer, heartbeats (ping/pong), reconnection logic, rooms (server-side broadcast groups), and optional transport fallback.
- The WebSocket has its own TCP connection separate from the HTTP REST connection.

### 4) Realtime code editing

- Component: `src/Components/Dashboard/code.jsx`.
- CodeMirror initializes with language mode and theme `darcula`. On every keyup, the component updates local state and triggers an emit:
  - `Updated code for backend` with `{ codetopass, line, ch }` where `line/ch` are the sender’s cursor position.

Server on code updates:
- On `Updated code for backend`, server updates `roomcode[roomid] = codetopass` and emits to the room:
  - `Updated code for users` with `{ codetopass, line, ch }`.

Other clients on receipt:
- `editor.setValue(codetopass)` then `editor.setCursor({ line, ch })`.

Notes:
- This is a broadcast of the whole buffer on every keyup (no diff). Last writer wins.
- Recipients’ cursors jump to the sender’s cursor (no multi-caret support).

Networking concepts:
- Each keystroke is a Socket.IO message (small payload JSON) over WebSocket/TCP. Delivery is best-effort per connection; ordering is preserved for messages on the same socket, but not across reconnect gaps.
- Latency depends on RTT; jitter may cause momentary ordering/visual anomalies if multiple users type simultaneously.

### 5) Language/mode synchronization

- Component: `src/Components/Dashboard/selectlang.jsx`.
- When a user selects a language, it emits two events:
  - `Updated langauge for backend` (typo in name) with the string (e.g., `"javascript"`, `"cpp"`).
  - `Updated mode for backend` with the same value.

Server handling:
- On `Updated langauge for backend`, server stores `roomlanguage[roomid]` and broadcasts `Updated language for users`.
- On `Updated mode for backend`, server broadcasts `Updated mode for users`.

Clients:
- Update dropdown and set CodeMirror mode. For `c/cpp/c++` the mode is `text/x-csrc`; otherwise the mode equals the language string.
- New users also receive `Language for new user` and `mode for new user` during bootstrap.

### 6) Presence and notifications

- On join: room receives `New user joined` (toast in UI).
- On leave (`disconnect`): room receives `User left the room`. Server re-emits `User list for frontend` with updated list.

Networking concepts:
- Disconnection can happen due to network loss, tab close, or server restart. Socket.IO tries to reconnect with exponential backoff; during downtime, messages may be lost.

### 7) Persistence and cleanup (MongoDB write)

- On `disconnect`, server updates in-memory state. If there are no sockets remaining globally (note: global, not per-room), it persists the last buffer for the room:
  - `findOneAndUpdate({ roomid }, { code }, { upsert: true })`.
  - Clears in-memory data for that room.

Implications:
- The current implementation saves when `Object.keys(mapping).length === 0` (no sockets connected at all). If another room still has users, the room that just emptied is not saved immediately. Consider changing this to "no users in this room" to persist per-room.

Networking concepts:
- MongoDB uses a persistent TCP connection (with pooling) on port 27017 to the database host. Mongoose handles reconnection and backoff.
- Write acknowledgements: default is acknowledged write (`w:1`); latency depends on DB host RTT and load.

## API and events (contract)

HTTP (client → server):
- `POST /data` JSON `{ name: string, roomId: string }` → `200` on success. Registers room and user.

Socket.IO events:
- Client → Server
  - `Update_users`: `{ id: string, username: string }`
  - `Updated code for backend`: `{ codetopass: string, line: number, ch: number }`
  - `Updated langauge for backend`: `string` (language)
  - `Updated mode for backend`: `string` (language)
- Server → Client
  - `New user joined`: `string` (username)
  - `User left the room`: `string` (username)
  - `User list for frontend`: `string[]`
  - `Code for new user`: `string` (unicast)
  - `Language for new user`: `string` (unicast)
  - `mode for new user`: `string` (unicast)
  - `Updated code for users`: `{ codetopass: string, line: number, ch: number }`
  - `Updated language for users`: `string`
  - `Updated mode for users`: `string`

## Computer networking concepts — deep dive

### Protocol stack and flows

- HTTP/1.1 for REST (`POST /data`). Runs over TCP (3-way handshake, congestion control) and may reuse persistent connections (keep-alive).
- WebSocket for realtime: starts with HTTP handshake (`Upgrade: websocket`) then frames over the same TCP connection. Socket.IO layers events, rooms, pings/pongs, and auto-reconnect. If upgrade fails, Socket.IO can use long-polling (HTTP) as a fallback.
- MongoDB uses BSON over TCP to port 27017. Mongoose maintains a pooled set of connections.

### CORS and preflight

- Because frontend and backend may be on different origins (`5173` vs `3000`), the browser enforces the same-origin policy. The server adds `Access-Control-Allow-Origin` (from `FRONTEND_URL` or `*`), `Access-Control-Allow-Credentials`, etc.
- Some requests trigger an `OPTIONS` preflight which the server handles with `app.options('*', cors(...))`.

### Ports, NAT, and proxies

- Local dev: client to `localhost:3000` for API/WebSocket; `localhost:5173` for frontend static files.
- Production: typically behind a load balancer or CDN. TLS terminates at the edge (port 443). Proxies must support WebSocket upgrades (HTTP/1.1 `Connection: Upgrade`). If you horizontally scale the Node server, use sticky sessions and a shared Socket.IO adapter (Redis) to preserve room broadcasts across instances.

### Ordering, reliability, and backpressure

- Message ordering is preserved per TCP connection. During reconnects, there may be a gap; the app does not re-request missed operations, so some edits can be lost. The system is "last writer wins" and always sends full-buffer updates.
- There is no explicit backpressure management. On very fast typing or high latency, the event rate can grow; consider debouncing or batching.

### Security

- CORS is not authentication. Currently, anyone who knows a `roomid` and backend URL can connect and edit.
- Recommendations: add authentication (JWT), authorize room membership, use HTTPS everywhere, validate payload sizes, and rate-limit endpoints.
- Socket.IO supports auth via connection params or middleware.

### Performance and scalability

- Optimization candidates:
  - Debounce editor emits (e.g., 50–150ms), or send incremental diffs instead of full text.
  - Use an OT/CRDT algorithm (e.g., Yjs) to resolve concurrent edits without cursor jumps.
  - Persist per-room on last-room-member disconnect rather than global empty mapping.
  - For multi-instance deployments, use `@socket.io/redis-adapter` and LB sticky sessions.

## Dev setup and running

Environment variables:
- Client: `VITE_BACKEND_URL=http://localhost:3000`
- Server: `PORT=3000`, `FRONTEND_URL=http://localhost:5173`, `MONGODB_URL=<your mongo uri>`

Run locally (example):
- Start MongoDB (local or cloud URL).
- In `server/`: `npm install` then `npm run dev` (nodemon) or `npm start`.
- In project root (frontend): `npm install` then `npm run dev`.
- Open `http://localhost:5173`, join a room, and test with two browser windows.

Troubleshooting:
- CORS errors: ensure `FRONTEND_URL` matches the exact origin (scheme, host, port).
- Port in use: free `5173` or `3000` or change ports.
- Mongo error: `MONGODB_URL` must be set; the server exits early if missing.
- WebSocket blocked: check proxies/LB support for `Connection: Upgrade`.

## Future improvements

- Persist code per-room on last member disconnect.
- Fix dropdown entry where label "java" has value `javascript`.
- Debounce editor events and/or send incremental diffs.
- Add authentication and access control for rooms.
- Adopt CRDT (e.g., Yjs) for conflict-free multi-user editing and cursor awareness.
- Store language per room persistently along with code.
