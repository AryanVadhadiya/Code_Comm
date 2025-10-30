# CodeShare - Real-Time Collaborative Code Editor

<p align="center">
  <img src="https://res.cloudinary.com/dl2rrnqxi/image/upload/v1707290185/Yash/CodeShareLogo.png" alt="CodeShare Logo" width="180" height="120">
</p>

<p align="center">
  <strong>A real-time collaborative code editor for seamless team coding</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="./EXP.md">Technical Documentation</a>
</p>

---

## 📖 About The Project

![CodeShare](https://res.cloudinary.com/dl2rrnqxi/image/upload/v1707287547/Yash/CodeShare.png)

CodeShare is a collaborative software platform that enables multiple developers to write, edit, and share code together in real-time. Built with modern web technologies, it provides a seamless experience for pair programming, code reviews, technical interviews, and remote team collaboration.

## ✨ Features

- **Real-Time Collaboration**: Multiple users can edit code simultaneously with instant synchronization
- **Multi-Language Support**: Built-in syntax highlighting for JavaScript, Python, C/C++, Java, HTML, CSS, and more
- **Live Cursor Sync**: See where other users are typing in real-time
- **Persistent Rooms**: Code is automatically saved when all users leave and restored when they return
- **User Presence**: Visual indicators showing active users in the room
- **Room-Based Sessions**: Create unique rooms with custom IDs for private collaboration
- **Instant Notifications**: Toast alerts when users join or leave the session
- **Dark Theme Editor**: Professional CodeMirror editor with Darcula theme

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Socket.IO Client** - Real-time communication
- **CodeMirror 5** - Code editor
- **Material UI** - UI components
- **Axios** - HTTP client
- **React Router** - Navigation
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin support

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yr004-yash/Code_Share.git
   cd Code_Share
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create a `.env` file in the `server/` directory:
   ```env
   PORT=3000
   MONGODB_URL=your_mongodb_connection_string
   FRONTEND_URL=http://localhost:5173
   ```

   Create a `.env` file in the root directory:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

   **MongoDB Setup:**
   - For local MongoDB: `mongodb://localhost:27017/codeshare`
   - For MongoDB Atlas: Get your connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

5. **Start the application**

   **Option 1: Run both servers separately**

   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

   **Option 2: Using npm scripts**

   Backend:
   ```bash
   cd server
   npm start
   ```

   Frontend:
   ```bash
   npm run dev
   ```

6. **Access the application**

   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## 📱 Usage

1. **Create or Join a Room**
   - Enter your username
   - Enter a unique room ID (create new or use existing)
   - Click "Submit"

2. **Start Coding**
   - Write code in the editor
   - Changes sync automatically to all users in the room
   - Select programming language from the dropdown

3. **Collaborate**
   - Share the room ID with teammates
   - See active users in the sidebar
   - Watch live cursor movements and edits

4. **Persistent Sessions**
   - Your code is automatically saved
   - Return to the same room later to continue

## 🌐 Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017/codeshare` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |

### Frontend (`.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:3000` |

## 📂 Project Structure

```
Code_Share/
├── src/                    # Frontend source code
│   ├── Components/
│   │   ├── Dashboard/     # Main editor components
│   │   │   ├── dash.jsx   # Dashboard layout
│   │   │   ├── code.jsx   # CodeMirror editor
│   │   │   ├── selectlang.jsx  # Language selector
│   │   │   └── users.jsx  # User avatars
│   │   └── Login/         # Login page
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── server/                # Backend source code
│   ├── server.js          # Express + Socket.IO server
│   ├── conn.js            # MongoDB connection
│   ├── coll.js            # Mongoose schema
│   └── package.json       # Backend dependencies
├── public/                # Static assets
├── package.json           # Frontend dependencies
└── README.md             # This file
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
lsof -ti :3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti :5173 | xargs kill -9
```

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend origin exactly
- Check that both servers are running

### MongoDB Connection Failed
- Verify `MONGODB_URL` is correct
- Ensure MongoDB is running (if using local installation)
- Check network access in MongoDB Atlas (if using cloud)

### WebSocket Connection Issues
- Verify `VITE_BACKEND_URL` points to the correct backend
- Check firewall settings
- Ensure backend server is running

## 📚 Documentation

For detailed technical documentation including:
- End-to-end application flow
- Socket.IO event lifecycle
- Database schema and operations
- Computer networking concepts
- Architecture deep dive

**👉 See [EXP.md](./EXP.md)**

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available for educational and commercial use.

## ⭐ Show your support

Give a ⭐️ if this project helped you!

---

<p align="center">Made with ❤️ by developers, for developers</p>
