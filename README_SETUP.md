This file explains the minimal local setup to run the project (backend + frontend) locally.

Backend (server)
- cd server
- Create a file named `.env` (use `server/.env.example` as a template) and set:
  - FRONTEND_URL (e.g. http://localhost:5173)
  - PORT (e.g. 3000)
  - MONGODB_URL (your MongoDB connection string)
- Install dependencies: `npm install`
- Start server: `npm run start` (or use `nodemon server.js` if you prefer live reload)

Notes:
- Do NOT commit your real `.env` file to version control. Use the `.env.example` files as templates.
- If the server exits with an error about `MONGODB_URL`, set that env var correctly and restart.

Frontend
- From project root run `npm install` (this will install frontend dependencies at root package.json)
- Start the dev server: `npm run dev` (if using Vite) or check the frontend README if present.

Common
- The backend expects the frontend to be served from the origin in `FRONTEND_URL` for CORS.
- The default values in `.env.example` work for running both on localhost (frontend typically at 5173, backend 3000).
