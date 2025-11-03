import { elevenLabsService } from '../services/elevenLabsService.js';

export const conversationController = {
  // Get all conversations
  async getConversations(req, res) {
    const result = await elevenLabsService.getConversations();

    if (result.success) {
      res.json({ conversations: result.conversations });
    } else {
      res.status(500).json({
        error: result.error,
        details: result.details,
      });
    }
  },

  // Get specific conversation by ID
  async getConversationById(req, res) {
    const { conversation_id } = req.params;

    const result = await elevenLabsService.getConversationById(conversation_id);

    if (result.success) {
      res.json(result.conversation);
    } else {
      res.status(500).json({
        error: result.error,
        details: result.details,
      });
    }
  },
};
