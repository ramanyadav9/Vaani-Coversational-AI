import { elevenLabsService } from '../services/elevenLabsService.js';
import { getVoiceId } from '../utils/voiceMapper.js';

export const callController = {
  // Initiate outbound call
  async initiateCall(req, res) {
    const {
      agent_id,
      to_number,
      language,           // Language preference (optional) - goes to agent overrides
      custom_variables,   // All dynamic variables from agent-specific form
    } = req.body;

    if (!agent_id || !to_number) {
      return res.status(400).json({
        success: false,
        error: 'agent_id and to_number are required',
      });
    }

    // Build session config from custom_variables
    // Frontend builds custom_variables based on agent requirements from agent-variables.json
    let sessionConfig = null;

    if (custom_variables && typeof custom_variables === 'object' && Object.keys(custom_variables).length > 0) {
      sessionConfig = {
        dynamicVariables: custom_variables,  // Use custom_variables directly
      };

      // Extract userId from custom_variables if available
      // Common patterns: customer_id, user_id, account_id
      const userId = custom_variables.customer_id
        || custom_variables.user_id
        || custom_variables.account_id
        || null;

      if (userId) {
        sessionConfig.userId = userId;
      }

      // Add language override to agent config (not dynamic_variables)
      if (language) {
        sessionConfig.agentOverrides = {
          language: language === 'Hindi' ? 'hi' : 'en',
        };
      }

      console.log('[CONTROLLER] Session config built from custom_variables:', JSON.stringify(sessionConfig, null, 2));
    } else {
      console.log('[CONTROLLER] No custom_variables provided, proceeding with basic call');
    }

    const result = await elevenLabsService.initiateCall(agent_id, to_number, sessionConfig);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  },
};
