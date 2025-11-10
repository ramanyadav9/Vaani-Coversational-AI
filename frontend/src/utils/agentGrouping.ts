import type { Agent, AgentCategory, VoiceVariant, GroupedAgents, CategoryType, CategoryDisplayMode } from '../types';

/**
 * Category icon mapping
 * Note: These emoji icons are used as fallback/placeholders.
 * The actual UI uses Lucide React icons (see CategorySelector component).
 */
export const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'Banking': '🏦',
    'Healthcare': '🏥',
    'Real Estate': '🏠',
    'Traffic': '🚗',
    'Municipal': '🏛️',
    'Hospitality': '🏨',
    'Specialized Agents': '⭐',
    'General': '⭐', // Fallback for any "General" category
  };
  return iconMap[category] || '📋';
};

/**
 * Extract voice variant information from agent name
 * Examples:
 * - "banking_agent_english_male" -> { language: "English", gender: "male" }
 * - "Doctor Appointment Agent_hindi_female" -> { language: "Hindi", gender: "female" }
 * - "Real Estate agent_british" -> { language: "British", gender: "male" }
 */
export const extractVoiceVariant = (agentName: string): { language: string; gender: 'male' | 'female' } | null => {
  const name = agentName.toLowerCase();

  // Language patterns
  const languages = ['english', 'hindi', 'british'];

  let language: string | null = null;
  let gender: 'male' | 'female' = 'male'; // Default

  // Extract language
  for (const lang of languages) {
    if (name.includes(lang)) {
      language = lang.charAt(0).toUpperCase() + lang.slice(1);
      break;
    }
  }

  // Extract gender
  if (name.includes('_female') || name.includes(' female')) {
    gender = 'female';
  } else if (name.includes('_male') || name.includes(' male')) {
    gender = 'male';
  } else if (name.includes('_hindi') || name.includes('_english') || name.includes('_british')) {
    // If language is mentioned but no gender, it's likely male (default convention)
    gender = 'male';
  }

  if (!language) {
    return null; // Not a voice variant agent
  }

  return { language, gender };
};

/**
 * Check if an agent is a voice variant (has language/gender in name)
 */
export const isVoiceVariantAgent = (agentName: string): boolean => {
  return extractVoiceVariant(agentName) !== null;
};

/**
 * Deduplicate agents (specifically handles Vasundhara appearing twice)
 */
export const deduplicateAgents = (agents: Agent[]): Agent[] => {
  const seen = new Map<string, Agent>();

  for (const agent of agents) {
    const key = agent.name.toLowerCase().trim();

    // If we've seen this agent before
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      // Keep the one with more total calls (more usage = more complete)
      if (agent.totalCalls > existing.totalCalls) {
        seen.set(key, agent);
      }
    } else {
      seen.set(key, agent);
    }
  }

  return Array.from(seen.values());
};

/**
 * Reassign agent categories based on user preferences
 */
export const reassignAgentCategories = (agents: Agent[]): Agent[] => {
  // List of agents that should be in "Specialized Agents" category
  const specializedAgentNames = [
    'Vasundhara',
    'LDA AI',
    'MahaPalika',
    'PayMitra',
    'Cybersentinel BOT',
    'dineshagent',
  ];

  return agents.map(agent => {
    // Move "NEW ACCOUNT OPENING ASSISTANT" from any category to Banking
    if (agent.name === 'NEW ACCOUNT OPENING ASSISTANT') {
      return { ...agent, category: 'Banking' };
    }

    // Move specific agents to "Specialized Agents" regardless of their current category
    if (specializedAgentNames.includes(agent.name)) {
      return { ...agent, category: 'Specialized Agents' };
    }

    // Rename any remaining "General" category to "Specialized Agents"
    if (agent.category === 'General') {
      return { ...agent, category: 'Specialized Agents' };
    }

    return agent;
  });
};

/**
 * Group voice variants for a specific category
 */
export const groupVoiceVariants = (agents: Agent[]): VoiceVariant[] => {
  const variants: VoiceVariant[] = [];

  for (const agent of agents) {
    const voiceInfo = extractVoiceVariant(agent.name);
    if (voiceInfo) {
      variants.push({
        language: voiceInfo.language,
        gender: voiceInfo.gender,
        agentId: agent.id,
        agentName: agent.name,
      });
    }
  }

  // Sort by language, then gender
  return variants.sort((a, b) => {
    if (a.language !== b.language) {
      return a.language.localeCompare(b.language);
    }
    return a.gender.localeCompare(b.gender);
  });
};

/**
 * Separate voice variant agents from specialized agents
 */
export const separateAgentsByType = (categoryAgents: Agent[]): {
  voiceVariants: Agent[];
  specialized: Agent[];
} => {
  const voiceVariants: Agent[] = [];
  const specialized: Agent[] = [];

  for (const agent of categoryAgents) {
    if (isVoiceVariantAgent(agent.name)) {
      voiceVariants.push(agent);
    } else {
      specialized.push(agent);
    }
  }

  console.log(`[separateAgentsByType] Total: ${categoryAgents.length}, Voice: ${voiceVariants.length}, Specialized: ${specialized.length}`);

  return { voiceVariants, specialized };
};

/**
 * Determine the display mode for a category
 * - voice-only: All or most agents are voice variants
 * - specialized-only: All or most agents are specialized
 * - hybrid: Mix of both voice variants and specialized agents
 */
export const getCategoryDisplayMode = (categoryAgents: Agent[]): CategoryDisplayMode => {
  if (categoryAgents.length === 0) {
    return 'specialized-only';
  }

  const { voiceVariants, specialized } = separateAgentsByType(categoryAgents);

  const voiceCount = voiceVariants.length;
  const specializedCount = specialized.length;

  console.log(`[getCategoryDisplayMode] Voice: ${voiceCount}, Specialized: ${specializedCount}`);

  // If both types exist (hybrid category)
  if (voiceCount > 0 && specializedCount > 0) {
    console.log('[getCategoryDisplayMode] HYBRID mode detected');
    return 'hybrid';
  }

  // If only voice variants
  if (voiceCount > 0 && specializedCount === 0) {
    console.log('[getCategoryDisplayMode] VOICE-ONLY mode detected');
    return 'voice-only';
  }

  // If only specialized (or default)
  console.log('[getCategoryDisplayMode] SPECIALIZED-ONLY mode detected');
  return 'specialized-only';
};

/**
 * Determine if a category should have voice variant selection (legacy support)
 */
export const categoryHasVoiceVariants = (categoryAgents: Agent[]): boolean => {
  const displayMode = getCategoryDisplayMode(categoryAgents);
  return displayMode === 'voice-only' || displayMode === 'hybrid';
};

/**
 * Main function to group agents by category
 */
export const groupAgentsByCategory = (agents: Agent[]): GroupedAgents => {
  // Step 1: Deduplicate (remove duplicate Vasundhara)
  let processedAgents = deduplicateAgents(agents);

  // Step 2: Reassign categories (move NEW ACCOUNT to Banking, rename General)
  processedAgents = reassignAgentCategories(processedAgents);

  // Step 3: Group by category
  const categoryMap = new Map<string, Agent[]>();

  for (const agent of processedAgents) {
    const category = agent.category || 'Specialized Agents';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(agent);
  }

  // Step 4: Create category objects
  const categoryOrder: CategoryType[] = [
    'Banking',
    'Healthcare',
    'Real Estate',
    'Traffic',
    'Municipal',
    'Hospitality',
    'Specialized Agents',
  ];

  const categories: AgentCategory[] = [];

  for (const categoryName of categoryOrder) {
    const categoryAgents = categoryMap.get(categoryName) || [];
    if (categoryAgents.length === 0) continue;

    console.log(`[groupAgentsByCategory] Processing category: ${categoryName}, Total agents: ${categoryAgents.length}`);

    const displayMode = getCategoryDisplayMode(categoryAgents);
    const hasVoiceVariants = categoryHasVoiceVariants(categoryAgents);
    const { voiceVariants, specialized } = separateAgentsByType(categoryAgents);

    console.log(`[groupAgentsByCategory] ${categoryName} - Display mode: ${displayMode}, Voice: ${voiceVariants.length}, Specialized: ${specialized.length}`);

    categories.push({
      name: categoryName,
      displayName: categoryName,
      icon: getCategoryIcon(categoryName),
      count: categoryAgents.length,
      hasVoiceVariants,
      displayMode,
      agents: categoryAgents,
      voiceVariantAgents: voiceVariants.length > 0 ? voiceVariants : undefined,
      specializedAgents: specialized.length > 0 ? specialized : undefined,
    });
  }

  return {
    categories,
    totalAgents: processedAgents.length,
  };
};

/**
 * Get unique voice variants for a category (for display in selector)
 */
export const getUniqueVoiceVariants = (categoryAgents: Agent[]): VoiceVariant[] => {
  const variants = groupVoiceVariants(categoryAgents);

  // Deduplicate by language+gender combination
  const uniqueVariants = new Map<string, VoiceVariant>();

  for (const variant of variants) {
    const key = `${variant.language}_${variant.gender}`;
    if (!uniqueVariants.has(key)) {
      uniqueVariants.set(key, variant);
    }
  }

  return Array.from(uniqueVariants.values());
};

/**
 * Get display label for voice variant
 */
export const getVoiceVariantLabel = (variant: VoiceVariant): string => {
  const genderLabel = variant.gender.charAt(0).toUpperCase() + variant.gender.slice(1);
  return `${variant.language} ${genderLabel}`;
};

/**
 * Get voice icon based on gender
 * Note: This is kept for backward compatibility but the UI now uses Lucide icons.
 * See VoiceVariantSelector component for actual icon rendering.
 */
export const getVoiceIcon = (gender: 'male' | 'female'): string => {
  return gender === 'male' ? '👨' : '👩';
};
