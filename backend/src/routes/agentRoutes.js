import express from 'express';
import { agentController } from '../controllers/agentController.js';

const router = express.Router();

// GET /api/agents - Get all agents with categories
router.get('/', agentController.getAgents);

// GET /api/phone-config - Get phone configuration
router.get('/phone-config', agentController.getPhoneConfig);

export default router;
