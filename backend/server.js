const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const requestRoutes = require('./routes/requestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/workspace', workspaceRoutes);
app.use('/api/projects/:projectId/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('ICON API is running...');
});

const userCanAccessProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const isCreator = project.creator.toString() === userId.toString();
  const isMember = project.members.some(member => member.user.toString() === userId.toString());
  return isCreator || isMember ? project : null;
};

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_project', async (projectId) => {
    try {
      const project = await userCanAccessProject(projectId, socket.user._id);
      if (!project) return socket.emit('chat_error', { message: 'Not authorized for this project chat' });

      socket.join(projectId);
      console.log(`User joined project chat: ${projectId}`);
    } catch (error) {
      socket.emit('chat_error', { message: 'Could not join project chat' });
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const content = data.content?.trim();
      if (!content) return;

      const project = await userCanAccessProject(data.projectId, socket.user._id);
      if (!project) return socket.emit('chat_error', { message: 'Not authorized for this project chat' });

      const message = await Message.create({
        chatId: data.projectId,
        chatModel: 'Project',
        sender: socket.user._id,
        content
      });

      const populatedMessage = await message.populate('sender', 'username name profilePicture');
      io.to(data.projectId).emit('receive_message', populatedMessage);

      const recipientIds = project.members
        .map(member => member.user.toString())
        .filter(userId => userId !== socket.user._id.toString());

      await Notification.insertMany(recipientIds.map(userId => ({
        user: userId,
        content: `${socket.user.name} sent a message in ${project.name}`,
        type: 'Message',
        relatedId: message._id
      })), { ordered: false });
    } catch (error) {
      socket.emit('chat_error', { message: 'Message could not be sent' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
