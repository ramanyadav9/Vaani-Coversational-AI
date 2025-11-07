import { elevenLabsService } from '../services/elevenLabsService.js';

export const conversationController = {
  // Get conversations with optional date filtering
  async getConversations(req, res) {
    try {
      const { dateFilter, startDate, endDate } = req.query;

      // Determine how many hours of data to fetch based on filter
      let hoursToFetch = 48; // Default: 2 days
      if (dateFilter === 'last7days' || dateFilter === 'last30days') {
        hoursToFetch = dateFilter === 'last7days' ? 168 : 720; // 7 days or 30 days
      } else if (startDate || endDate) {
        // For custom ranges, fetch 30 days to be safe
        hoursToFetch = 720;
      }

      // Fetch conversations from ElevenLabs with time filter
      const result = await elevenLabsService.getConversations(hoursToFetch);

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

  // End/terminate a conversation
  async endConversation(req, res) {
    try {
      const { conversation_id } = req.params;

      if (!conversation_id) {
        return res.status(400).json({
          error: 'conversation_id is required',
        });
      }

      console.log(`[Controller] Received request to end conversation: ${conversation_id}`);

      const result = await elevenLabsService.endConversation(conversation_id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('[Controller] Error in endConversation:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message,
      });
    }
  },
};
