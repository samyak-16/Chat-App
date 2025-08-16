# Chat App - Full Stack Real-time Messaging

A modern, full-stack chat application built with React frontend and Node.js backend, featuring real-time messaging, file sharing, and group chat functionality.

## 🚀 Features

### Frontend (React + Vite)
- **Modern UI** - Built with React 18, Vite, and Tailwind CSS
- **Real-time Messaging** - Socket.IO integration for instant message delivery
- **Responsive Design** - Works on desktop, tablet, and mobile
- **File Upload** - Support for images, videos, audio, and documents
- **Message Status** - Read receipts and delivery confirmation
- **User Management** - Nicknames, online status, and preferences

### Backend (Node.js + Express)
- **RESTful API** - Complete CRUD operations for chats and messages
- **Socket.IO Server** - Real-time bidirectional communication
- **JWT Authentication** - Secure token-based authentication
- **File Upload** - Multer middleware with Cloudinary integration
- **MongoDB** - Scalable NoSQL database with Mongoose ODM
- **Redis** - Session management and caching

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time engine
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload middleware
- **Cloudinary** - Cloud file storage
- **Redis** - Session store

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB (local or Atlas)
- Redis (optional, for session management)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd chat-app
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env)**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
REDIS_URL=redis://localhost:6379
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

4. **Start the development servers**
```bash
npm run dev
```

This will start both backend (port 3000) and frontend (port 5173) simultaneously.

## 🏗️ Project Structure

```
chat-app/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── sockets/        # Socket.IO handlers
│   ├── uploads/            # Temporary file storage
│   └── index.js           # Server entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API and socket services
│   │   └── App.jsx        # Main application
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Chats
- `GET /api/chats` - Get all chats for user
- `POST /api/chats/private` - Start private chat
- `POST /api/chats/group` - Create group chat
- `GET /api/chats/:chatId` - Get chat details
- `DELETE /api/chats/:chatId/leave` - Leave group chat

### Messages
- `GET /api/messages/:chatId` - Get messages in chat
- `POST /api/messages/send` - Send message
- `POST /api/messages/:msgId/seen` - Mark as seen
- `POST /api/messages/:msgId/delete` - Delete message

### User Preferences
- `GET /api/user/me` - Get user profile
- `POST /api/user/nickname` - Update nickname
- `POST /api/user/mute/:chatId` - Mute/unmute chat

## 🔄 Real-time Events

### Socket.IO Events
- `new_message` - New message received
- `user_status_change` - User online/offline status
- `typing` - Typing indicators
- `join_chat` - Join chat room
- `leave_chat` - Leave chat room

## 🎨 Customization

### Styling
The frontend uses Tailwind CSS with custom components. You can customize:
- Color scheme in `frontend/tailwind.config.js`
- Component styles in `frontend/src/index.css`
- Responsive breakpoints

### Adding Features
1. **New API endpoints** - Add to `backend/src/routes/`
2. **New components** - Add to `frontend/src/components/`
3. **New socket events** - Add to `backend/src/sockets/`
4. **Database models** - Add to `backend/src/models/`

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Vercel, or your preferred platform

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to Netlify, Vercel, or your preferred platform

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service is running
   - Verify connection string in `.env`

2. **Socket Connection Issues**
   - Ensure backend is running on correct port
   - Check CORS settings

3. **File Upload Fails**
   - Verify Cloudinary credentials
   - Check file size limits

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Socket.IO for real-time functionality
- Tailwind CSS for styling
- Cloudinary for file storage
- MongoDB for database
