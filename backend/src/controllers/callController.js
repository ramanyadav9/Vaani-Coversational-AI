import { elevenLabsService } from '../services/elevenLabsService.js';

export const callController = {
  // Initiate outbound call
  async initiateCall(req, res) {
    const { agent_id, to_number } = req.body;

    if (!agent_id || !to_number) {
      return res.status(400).json({
        success: false,
        error: 'agent_id and to_number are required',
      });
    }

    const result = await elevenLabsService.initiateCall(agent_id, to_number);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  },
};
