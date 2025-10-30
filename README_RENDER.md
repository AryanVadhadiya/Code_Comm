Render deployment guide for CodeShare

This document explains how to deploy both the backend (Node + Socket.IO) and frontend (Vite React) to Render so the app is publicly reachable.

Overview
- Backend: Deploy as a Web Service
- Frontend: Deploy as a Static Site (recommended) or Web Service

Prerequisites
- A GitHub repo with this project pushed
- A Render account (https://render.com)
- A MongoDB Atlas connection string (MONGODB_URL)

Backend (Web Service)
1. Create a new "Web Service" on Render and connect your GitHub repo.
2. In the "Root Directory" set to `/server` (Render should run commands from the server folder).
3. Build & Start command:
   - Build: Leave empty (no build step required)
   - Start Command: `npm start`
4. Environment variables (add these on Render):
   - `MONGODB_URL` = your MongoDB Atlas connection string
   - `FRONTEND_URL` = the URL where your frontend will be hosted (for CORS). You can update this after frontend deployment. Example: `https://your-frontend.onrender.com`
   - `PORT` = `8080` (Render will override with its own PORT env, but keeping 8080 is fine)
5. Deploy. After deployment note the backend URL Render gives (e.g. `https://your-backend.onrender.com`).

Frontend (Static Site)
1. Create a new "Static Site" on Render and connect your GitHub repo.
2. Root directory: `/` (project root) or `/` depending on your repo layout.
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Environment variables (set on Render):
   - `VITE_BACKEND_URL` = `https://your-backend.onrender.com` (use the backend URL from backend deploy)
6. Deploy. After deploy, note the frontend URL.

After both deploys are ready
- Update the backend `FRONTEND_URL` environment variable to the real frontend URL (if you set it earlier).
- Restart the backend so CORS picks up the final frontend URL (Render provides controls to redeploy/restart).

Notes & Tips
- Socket.IO: Render supports WebSockets and should work out of the box for Socket.IO.
- If you run multiple backend instances in the future, configure a Socket.IO Redis adapter and set sticky sessions/load balancing appropriately.
- For a single-developer app Render free tier is usually sufficient for demos.

Local demo with stable URLs
- If you want a stable development URL without deploying, consider ngrok paid reserved domains or a Render deploy.

If you'd like, I can:
- Create a `render.yaml` for you (Render can use it for infra-as-code) or
- Prepare the exact env values and start commands and test a dry run deploy checklist.

