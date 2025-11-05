import { elevenLabsService } from '../services/elevenLabsService.js';

export const agentController = {
  // Get agents with optional pagination
  async getAgents(req, res) {
    try {
      const { limit, offset, page } = req.query;

      // Fetch all agents from ElevenLabs
      const result = await elevenLabsService.getAgents();

      if (!result.success) {
        return res.status(500).json({
          error: result.error,
          details: result.details,
        });
      }

      let agents = result.agents;
      const totalAgents = agents.length;

      // Apply pagination if requested
      if (limit) {
        const limitNum = parseInt(limit, 10);
        let offsetNum = 0;

        if (offset) {
          offsetNum = parseInt(offset, 10);
        } else if (page) {
          const pageNum = parseInt(page, 10);
          offsetNum = (pageNum - 1) * limitNum;
        }

        agents = agents.slice(offsetNum, offsetNum + limitNum);

        console.log(`Paginated agents: ${agents.length} of ${totalAgents} (limit: ${limitNum}, offset: ${offsetNum})`);

        return res.json({
          agents,
          pagination: {
            total: totalAgents,
            limit: limitNum,
            offset: offsetNum,
            page: page ? parseInt(page, 10) : Math.floor(offsetNum / limitNum) + 1,
            totalPages: Math.ceil(totalAgents / limitNum),
            hasMore: offsetNum + limitNum < totalAgents,
          }
        });
      }

      // No pagination - return all agents
      res.json({ agents, total: totalAgents });
    } catch (error) {
      console.error('Error in getAgents:', error);
      res.status(500).json({
        error: 'Failed to fetch agents',
        details: error.message,
      });
    }
  },

  // Get phone configuration
  getPhoneConfig(req, res) {
    const config = elevenLabsService.getPhoneConfig();
    res.json(config);
  },
};
