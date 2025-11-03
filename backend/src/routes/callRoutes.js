import express from 'express';
import { callController } from '../controllers/callController.js';

const router = express.Router();

// POST /api/call - Initiate outbound call
router.post('/', callController.initiateCall);

export default router;
