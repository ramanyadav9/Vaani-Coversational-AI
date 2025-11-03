import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import agentRoutes from './routes/agentRoutes.js';
import callRoutes from './routes/callRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

const app = express();

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

// Start server
app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🤖 Conversational AI Backend Server      ║
║                                            ║
║  📡 Server: http://localhost:${config.port}         ║
║  📞 Phone: ${config.elevenLabs.phoneNumber}                  ║
║  🆔 Phone ID: ${config.elevenLabs.phoneNumberId.substring(0, 20)}... ║
║                                            ║
║  ✅ Ready to serve API requests!           ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
