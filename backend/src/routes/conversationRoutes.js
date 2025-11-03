import express from 'express';
import { conversationController } from '../controllers/conversationController.js';

const router = express.Router();

// GET /api/conversations - Get all conversations
router.get('/', conversationController.getConversations);

// GET /api/conversations/:conversation_id - Get specific conversation
router.get('/:conversation_id', conversationController.getConversationById);

export default router;
