import { elevenLabsService } from '../services/elevenLabsService.js';

export const conversationController = {
  // Get conversations with optional date filtering
  async getConversations(req, res) {
    try {
      const { dateFilter, startDate, endDate } = req.query;

      // Fetch all conversations from ElevenLabs
      const result = await elevenLabsService.getConversations();

      if (!result.success) {
        return res.status(500).json({
          error: result.error,
          details: result.details,
        });
      }

      let conversations = result.conversations;

      // Apply date filtering if requested
      if (dateFilter || startDate || endDate) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        conversations = conversations.filter(conv => {
          const convDate = new Date(conv.start_time_unix_secs * 1000);

          // Handle predefined date filters
          if (dateFilter === 'today') {
            return convDate >= todayStart;
          } else if (dateFilter === 'yesterday') {
            const yesterdayStart = new Date(todayStart);
            yesterdayStart.setDate(yesterdayStart.getDate() - 1);
            return convDate >= yesterdayStart && convDate < todayStart;
          } else if (dateFilter === 'last7days') {
            const sevenDaysAgo = new Date(todayStart);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return convDate >= sevenDaysAgo;
          } else if (dateFilter === 'last30days') {
            const thirtyDaysAgo = new Date(todayStart);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return convDate >= thirtyDaysAgo;
          }

          // Handle custom date range
          if (startDate) {
            const start = new Date(startDate);
            if (convDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (convDate > end) return false;
          }

          return true;
        });

        console.log(`Filtered conversations: ${conversations.length} of ${result.conversations.length} (filter: ${dateFilter || 'custom range'})`);
      }

      res.json({
        conversations,
        total: result.conversations.length,
        filtered: conversations.length,
        dateFilter: dateFilter || null
      });
    } catch (error) {
      console.error('Error in getConversations:', error);
      res.status(500).json({
        error: 'Failed to fetch conversations',
        details: error.message,
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
