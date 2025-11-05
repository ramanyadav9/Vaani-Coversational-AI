import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { liveCallsSocketService } from './services/liveCallsSocket.js';

// Import routes
import agentRoutes from './routes/agentRoutes.js';
import callRoutes from './routes/callRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/call', callRoutes);
app.use('/api/conversations', conversationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize WebSocket service for live calls
liveCallsSocketService.initialize(io);

// Start server
httpServer.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🤖 Conversational AI Backend Server      ║
║                                            ║
║  📡 Server: http://localhost:${config.port}         ║
║  🔌 WebSocket: ws://localhost:${config.port}        ║
║  📞 Phone: ${config.elevenLabs.phoneNumber}                  ║
║  🆔 Phone ID: ${config.elevenLabs.phoneNumberId.substring(0, 20)}... ║
║                                            ║
║  ✅ Ready to serve API & WebSocket!        ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
