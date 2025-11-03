import { elevenLabsService } from '../services/elevenLabsService.js';

export const agentController = {
  // Get all agents
  async getAgents(req, res) {
    const result = await elevenLabsService.getAgents();

    if (result.success) {
      res.json({ agents: result.agents });
    } else {
      res.status(500).json({
        error: result.error,
        details: result.details,
      });
    }
  },

  // Get phone configuration
  getPhoneConfig(req, res) {
    const config = elevenLabsService.getPhoneConfig();
    res.json(config);
  },
};
