import axios from 'axios';
import { config } from '../config/config.js';

const headers = {
  'xi-api-key': config.elevenLabs.apiKey,
  'Content-Type': 'application/json',
};

// Intelligent category determination based on agent name keywords
function determineAgentCategory(agentName) {
  const nameLower = agentName.toLowerCase();

  // Banking & Finance keywords
  if (nameLower.includes('bank') || nameLower.includes('emi') ||
      nameLower.includes('loan') || nameLower.includes('paymitra') ||
      nameLower.includes('payment')) {
    return 'Banking';
  }

  // Finance (non-banking)
  if (nameLower.includes('finance') || nameLower.includes('investment') ||
      nameLower.includes('wealth')) {
    return 'Finance';
  }

  // Healthcare keywords
  if (nameLower.includes('health') || nameLower.includes('doctor') ||
      nameLower.includes('medical') || nameLower.includes('hospital') ||
      nameLower.includes('clinic') || nameLower.includes('appointment')) {
    return 'Healthcare';
  }

  // Traffic & Challan keywords
  if (nameLower.includes('traffic') || nameLower.includes('challan') ||
      nameLower.includes('e-challan') || nameLower.includes('echallan')) {
    return 'Traffic';
  }

  // Municipal & Government keywords
  if (nameLower.includes('municipal') || nameLower.includes('nmc') ||
      nameLower.includes('mahapalika') || nameLower.includes('corporation') ||
      nameLower.includes('civic') || nameLower.includes('lda')) {
    return 'Municipal';
  }

  // Security & Cyber keywords
  if (nameLower.includes('security') || nameLower.includes('cyber') ||
      nameLower.includes('sentinel') || nameLower.includes('police')) {
    return 'Security';
  }

  // Customer Support keywords
  if (nameLower.includes('support') || nameLower.includes('customer') ||
      nameLower.includes('service') || nameLower.includes('helpdesk')) {
    return 'Support';
  }

  // Real Estate keywords
  if (nameLower.includes('real estate') || nameLower.includes('property') ||
      nameLower.includes('realty')) {
    return 'Real Estate';
  }

  // Hospitality keywords
  if (nameLower.includes('hospitality') || nameLower.includes('hotel') ||
      nameLower.includes('restaurant') || nameLower.includes('booking')) {
    return 'Hospitality';
  }

  // Environment keywords
  if (nameLower.includes('environment') || nameLower.includes('vasundhara') ||
      nameLower.includes('eco') || nameLower.includes('green')) {
    return 'Environment';
  }

  // Technology keywords
  if (nameLower.includes('tech') || nameLower.includes('ai') ||
      nameLower.includes('bot') || nameLower.includes('digital')) {
    return 'Technology';
  }

  // Education keywords
  if (nameLower.includes('education') || nameLower.includes('school') ||
      nameLower.includes('learning') || nameLower.includes('training')) {
    return 'Education';
  }

  // E-commerce keywords
  if (nameLower.includes('ecommerce') || nameLower.includes('shop') ||
      nameLower.includes('store') || nameLower.includes('retail')) {
    return 'E-commerce';
  }

  // Travel keywords
  if (nameLower.includes('travel') || nameLower.includes('tourism') ||
      nameLower.includes('booking') || nameLower.includes('trip')) {
    return 'Travel';
  }

  // Default category
  return 'General';
}

// Generate intelligent description based on agent name
function generateAgentDescription(agentName, category) {
  const nameLower = agentName.toLowerCase();

  // Check for language indicators
  const isHindi = nameLower.includes('hindi');
  const isEnglish = nameLower.includes('english');
  const isFemale = nameLower.includes('female');
  const isMale = nameLower.includes('male') && !isFemale;

  // Build voice description
  let voiceDesc = '';
  if (isHindi && isFemale) {
    voiceDesc = 'Hindi-speaking female ';
  } else if (isHindi && isMale) {
    voiceDesc = 'Hindi-speaking male ';
  } else if (isHindi) {
    voiceDesc = 'Hindi-speaking ';
  } else if (isEnglish && isFemale) {
    voiceDesc = 'English-speaking female ';
  } else if (isEnglish && isMale) {
    voiceDesc = 'English-speaking male ';
  } else if (isFemale) {
    voiceDesc = 'Female ';
  } else if (isMale) {
    voiceDesc = 'Male ';
  }

  // Specific agent descriptions based on name patterns
  if (nameLower.includes('emi') && nameLower.includes('reminder')) {
    return `${voiceDesc}Automated EMI payment reminder and follow-up service`;
  }
  if (nameLower.includes('banking') && nameLower.includes('agent')) {
    return `${voiceDesc}Banking assistant for account queries and transactions`;
  }
  if (nameLower.includes('doctor') && nameLower.includes('appointment')) {
    return `${voiceDesc}Medical appointment scheduling and healthcare assistance`;
  }
  if (nameLower.includes('traffic') || nameLower.includes('challan')) {
    return `${voiceDesc}Traffic e-challan information and payment assistance`;
  }
  if (nameLower.includes('paymitra')) {
    return `${voiceDesc}Payment processing and financial transaction assistant`;
  }
  if (nameLower.includes('cyber') && nameLower.includes('sentinel')) {
    return `${voiceDesc}Cybersecurity awareness and reporting assistant`;
  }
  if (nameLower.includes('hospitality')) {
    return `${voiceDesc}Hospitality service and guest assistance agent`;
  }
  if (nameLower.includes('real estate')) {
    return `${voiceDesc}Real estate property inquiry and consultation assistant`;
  }
  if (nameLower.includes('nmc') || nameLower.includes('mahapalika')) {
    return `${voiceDesc}Municipal services and civic complaint management`;
  }
  if (nameLower.includes('vasundhara')) {
    return `${voiceDesc}Environmental services and sustainability assistant`;
  }
  if (nameLower.includes('lda')) {
    return `${voiceDesc}Development authority services and information assistant`;
  }

  // Generic descriptions based on category
  switch (category) {
    case 'Banking':
      return `${voiceDesc}Banking and financial services assistant`;
    case 'Finance':
      return `${voiceDesc}Financial advisory and transaction assistant`;
    case 'Healthcare':
      return `${voiceDesc}Healthcare services and medical assistance`;
    case 'Traffic':
      return `${voiceDesc}Traffic management and violation assistance`;
    case 'Municipal':
      return `${voiceDesc}Municipal services and civic assistance`;
    case 'Security':
      return `${voiceDesc}Security and safety assistance service`;
    case 'Support':
      return `${voiceDesc}Customer support and service assistant`;
    case 'Real Estate':
      return `${voiceDesc}Real estate consultation and property assistance`;
    case 'Hospitality':
      return `${voiceDesc}Hospitality and guest services assistant`;
    case 'Environment':
      return `${voiceDesc}Environmental services and eco-assistance`;
    case 'Technology':
      return `${voiceDesc}Technology support and digital assistant`;
    case 'Education':
      return `${voiceDesc}Educational assistance and learning support`;
    case 'E-commerce':
      return `${voiceDesc}E-commerce and shopping assistance`;
    case 'Travel':
      return `${voiceDesc}Travel booking and tourism assistance`;
    default:
      return `${voiceDesc}AI conversational assistant for ${category.toLowerCase()} services`;
  }
}

export const elevenLabsService = {
  // Get voice details from ElevenLabs API
  async getVoiceDetails(voiceId) {
    try {
      const response = await axios.get(
        `${config.elevenLabs.baseUrl}/v1/voices/${voiceId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching voice ${voiceId}:`, error.message);
      return null;
    }
  },

  // Determine voice gender from voice data
  determineVoiceGender(voiceData, agentName) {
    if (!voiceData) {
      // Fallback to name-based detection
      const nameLower = agentName.toLowerCase();
      if (nameLower.includes('female')) return 'female';
      if (nameLower.includes('male') && !nameLower.includes('female')) return 'male';
      return 'neutral';
    }

    // Check voice labels for gender
    const labels = voiceData.labels || {};
    if (labels.gender) {
      return labels.gender.toLowerCase();
    }

    // Check voice category or description
    const category = (labels.use_case || '').toLowerCase();
    const description = (voiceData.description || '').toLowerCase();
    const name = (voiceData.name || '').toLowerCase();

    // Look for gender keywords
    if (category.includes('female') || description.includes('female') || name.includes('female')) {
      return 'female';
    }
    if (category.includes('male') || description.includes('male') || name.includes('male')) {
      return 'male';
    }

    // Fallback to name-based detection
    const agentNameLower = agentName.toLowerCase();
    if (agentNameLower.includes('female')) return 'female';
    if (agentNameLower.includes('male') && !agentNameLower.includes('female')) return 'male';

    return 'neutral';
  },

  // Get all agents with categories and enhanced details
  async getAgents() {
    try {
      const response = await axios.get(
        `${config.elevenLabs.baseUrl}/v1/convai/agents`,
        { headers }
      );

      const agents = response.data.agents || [];
      console.log(`\n[AGENT ANALYSIS] Found ${agents.length} agents from ElevenLabs`);

      // Add enhanced details to agents
      const enhancedAgents = await Promise.all(agents.map(async agent => {
        // Use intelligent category determination
        const category = determineAgentCategory(agent.name);
        console.log(`[AGENT ANALYSIS] Agent: "${agent.name}" -> Category: "${category}"`);

        // Get voice ID from agent configuration
        const voiceId = agent.conversation_config?.agent?.first_message?.voice_id
          || agent.conversation_config?.tts?.voice_id;

        // Fetch voice details from ElevenLabs API
        let voiceGender = 'neutral';
        let voiceLanguage = 'English (US)';

        if (voiceId) {
          const voiceData = await this.getVoiceDetails(voiceId);
          voiceGender = this.determineVoiceGender(voiceData, agent.name);

          // Get language from voice data or agent config
          if (voiceData && voiceData.labels && voiceData.labels.language) {
            voiceLanguage = voiceData.labels.language;
          }
        }

        // Also check agent configuration for language
        const agentLang = agent.conversation_config?.agent?.language;
        if (agentLang === 'en') {
          voiceLanguage = 'English (US)';
        } else if (agentLang === 'hi') {
          voiceLanguage = 'Hindi';
        } else if (agentLang) {
          voiceLanguage = agentLang.toUpperCase();
        }

        // Try to extract description from system prompt
        let description = null;
        if (agent.conversation_config?.agent?.prompt?.prompt) {
          const systemPrompt = agent.conversation_config.agent.prompt.prompt;
          // Take first meaningful sentence (up to first period, or first 150 chars)
          let firstSentence = systemPrompt.split(/\.\s+/)[0]; // Split on period + whitespace

          // Clean up common prompt prefixes
          firstSentence = firstSentence
            .replace(/^(You are|You're|This is|Hello,?|Hi,?|Welcome,?)\s*/i, '')
            .trim();

          // Use it if it's meaningful (between 20-150 chars)
          if (firstSentence.length > 150) {
            description = firstSentence.substring(0, 147) + '...';
          } else if (firstSentence.length > 20) {
            description = firstSentence;
          }
        }

        // If no good description from prompt, generate intelligent one
        if (!description) {
          description = generateAgentDescription(agent.name, category);
          console.log(`[AGENT ANALYSIS] Generated description: "${description}"`);
        } else {
          console.log(`[AGENT ANALYSIS] Using prompt description: "${description}"`);
        }

        console.log(`[AGENT ANALYSIS] Agent "${agent.name}": voice=${voiceId}, gender=${voiceGender}, lang=${voiceLanguage}, category=${category}`);

        return {
          ...agent,
          category,
          voiceGender,
          voiceLanguage,
          description
        };
      }));

      console.log(`[AGENT ANALYSIS] Successfully processed ${enhancedAgents.length} agents\n`);
      return { success: true, agents: enhancedAgents };
    } catch (error) {
      console.error('Error fetching agents:', error.message);
      return {
        success: false,
        error: 'Failed to fetch agents',
        details: error.response?.data || error.message,
      };
    }
  },

  // Initiate outbound call
  async initiateCall(agentId, toNumber) {
    try {
      console.log(`[PHONE FORMAT DEBUG] Original input: "${toNumber}"`);

      // Format phone number - use length-based detection to avoid false positives
      let cleanNumber = toNumber.trim().replace(/\D/g, ''); // Remove all non-digits
      console.log(`[PHONE FORMAT DEBUG] After removing non-digits: "${cleanNumber}" (length: ${cleanNumber.length})`);

      let formattedNumber;

      // Determine format based on length - BULLETPROOF logic
      if (cleanNumber.length === 10) {
        // 10 digits: Indian mobile number without country code
        // Examples: 9168498570, 8765432109
        formattedNumber = `+91${cleanNumber}`;
        console.log(`[PHONE FORMAT DEBUG] 10-digit number detected -> adding +91 prefix`);
      } else if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
        // 12 digits starting with 91: Already has country code (91 + 10 digits)
        // Example: 919168498570
        formattedNumber = `+${cleanNumber}`;
        console.log(`[PHONE FORMAT DEBUG] 12-digit number with 91 prefix detected -> adding + only`);
      } else if (cleanNumber.length === 11 && cleanNumber.startsWith('91')) {
        // 11 digits starting with 91: Likely incomplete number (91 + 9 digits)
        // This is an ERROR case - should be 91 + 10 digits
        console.log(`[PHONE FORMAT DEBUG] WARNING: 11-digit number starting with 91 - incomplete! Adding +91 prefix to make it 13 digits`);
        formattedNumber = `+91${cleanNumber}`;
      } else if (cleanNumber.length === 11) {
        // 11 digits NOT starting with 91: Add country code
        // Example: 19168498570 (someone typed 1 + 10 digits by mistake)
        formattedNumber = `+91${cleanNumber}`;
        console.log(`[PHONE FORMAT DEBUG] 11-digit number (non-91 prefix) -> adding +91 prefix`);
      } else if (cleanNumber.length > 12) {
        // More than 12 digits: Already includes country code
        formattedNumber = `+${cleanNumber}`;
        console.log(`[PHONE FORMAT DEBUG] Long number (${cleanNumber.length} digits) -> adding + only`);
      } else if (cleanNumber.length > 0) {
        // Any other length: Try adding +91 (might be incomplete number)
        console.log(`[PHONE FORMAT DEBUG] Unusual length (${cleanNumber.length} digits) -> adding +91 prefix`);
        formattedNumber = `+91${cleanNumber}`;
      } else {
        // Empty number - this is an error
        throw new Error('Phone number is empty after cleaning');
      }

      console.log(`[PHONE FORMAT DEBUG] Final formatted number: "${formattedNumber}"`);
      console.log(`Phone number formatting: "${toNumber}" -> "${formattedNumber}" (cleaned length: ${cleanNumber.length})`);

      const payload = {
        agent_id: agentId,
        agent_phone_number_id: config.elevenLabs.phoneNumberId,
        to_number: formattedNumber,
      };

      console.log('Initiating call with payload:', payload);

      const response = await axios.post(
        `${config.elevenLabs.baseUrl}/v1/convai/sip-trunk/outbound-call`,
        payload,
        { headers }
      );

      return {
        success: true,
        data: response.data,
        message: 'Call initiated successfully',
      };
    } catch (error) {
      console.error('Error initiating call:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to initiate call',
        details: error.response?.data || error.message,
      };
    }
  },

  // Get conversation history
  async getConversations() {
    try {
      const response = await axios.get(
        `${config.elevenLabs.baseUrl}/v1/convai/conversations`,
        { headers }
      );

      return { success: true, conversations: response.data.conversations || [] };
    } catch (error) {
      console.error('Error fetching conversations:', error.message);
      return {
        success: false,
        error: 'Failed to fetch conversations',
        details: error.response?.data || error.message,
      };
    }
  },

  // Get specific conversation details
  async getConversationById(conversationId) {
    try {
      const response = await axios.get(
        `${config.elevenLabs.baseUrl}/v1/convai/conversations/${conversationId}`,
        { headers }
      );

      return { success: true, conversation: response.data };
    } catch (error) {
      console.error('Error fetching conversation details:', error.message);
      return {
        success: false,
        error: 'Failed to fetch conversation details',
        details: error.response?.data || error.message,
      };
    }
  },

  // Get phone configuration
  getPhoneConfig() {
    return {
      phone_number: config.elevenLabs.phoneNumber,
      phone_number_id: config.elevenLabs.phoneNumberId,
    };
  },
};
