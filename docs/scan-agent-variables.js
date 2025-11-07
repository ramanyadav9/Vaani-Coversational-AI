/**
 * Enhanced Agent Feature Scanner
 *
 * Comprehensively scans all ElevenLabs agents to extract:
 * - Dynamic variables (from system prompts, first messages, webhook headers)
 * - Variable classification (user input vs webhook-populated vs system-managed)
 * - Tools/Webhooks (names, types, descriptions, data they provide)
 * - Knowledge base references
 * - System prompts and first messages (full text)
 * - Conversation flow analysis
 *
 * Outputs:
 * - agent-features-complete.json (comprehensive analysis)
 * - agent-variables.json (backward compatible)
 */

import axios from 'axios';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env (go up one level from docs/)
const envPath = join(__dirname, '..', 'backend', '.env');
dotenv.config({ path: envPath });

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL || 'https://api.elevenlabs.io';

if (!API_KEY) {
  console.error('❌ API_KEY not found in backend/.env');
  process.exit(1);
}

const headers = {
  'xi-api-key': API_KEY,
  'Content-Type': 'application/json',
};

/**
 * Extract variables from text using {{variable}} syntax
 */
function extractVariables(text) {
  if (!text) return [];

  // Match {{variable_name}} or {{variable.nested}}
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    matches.push(varName);
  }

  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Categorize variable by its name
 */
function categorizeVariable(varName) {
  const name = varName.toLowerCase();

  // System variables (auto-provided by ElevenLabs)
  if (name.startsWith('system__')) {
    return { category: 'system', required: false, userInput: false };
  }

  // Secret variables (for webhooks)
  if (name.startsWith('secret__')) {
    return { category: 'secret', required: false, userInput: true };
  }

  // Common user information variables
  const userInfoVars = [
    'customer_name', 'name', 'user_name', 'caller_name',
    'email', 'phone', 'phone_number', 'mobile',
    'customer_id', 'user_id', 'account_id',
    'language', 'lang',
  ];

  if (userInfoVars.some(v => name.includes(v))) {
    return { category: 'user_info', required: false, userInput: true };
  }

  // Session/config variables
  if (name.includes('session') || name.includes('config')) {
    return { category: 'session', required: false, userInput: true };
  }

  // Custom variables (everything else)
  return { category: 'custom', required: false, userInput: true };
}

/**
 * Determine field type for variable
 */
function getFieldType(varName) {
  const name = varName.toLowerCase();

  if (name.includes('email')) return 'email';
  if (name.includes('phone') || name.includes('mobile')) return 'tel';
  if (name.includes('password') || name.includes('token') || name.includes('secret')) return 'password';
  if (name.includes('date') || name.includes('time')) return 'text'; // Could be datetime-local
  if (name.includes('url') || name.includes('link')) return 'url';
  if (name.includes('number') || name.includes('count') || name.includes('amount')) return 'number';
  if (name.includes('description') || name.includes('message') || name.includes('comment')) return 'textarea';

  return 'text';
}

/**
 * Generate label from variable name
 */
function generateLabel(varName) {
  // Remove prefixes
  let label = varName
    .replace(/^(session_config\.|voice_config\.|secret__|system__)/, '')
    .replace(/_/g, ' ')
    .replace(/\./g, ' ');

  // Capitalize words
  label = label
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return label;
}

/**
 * Generate placeholder text
 */
function generatePlaceholder(varName, fieldType) {
  const name = varName.toLowerCase();

  if (name.includes('email')) return 'example@email.com';
  if (name.includes('phone')) return '+91 9876543210';
  if (name.includes('name')) return 'Enter name';
  if (name.includes('id')) return 'Enter ID';
  if (name.includes('message')) return 'Enter message';
  if (fieldType === 'textarea') return 'Enter details...';

  return `Enter ${generateLabel(varName).toLowerCase()}`;
}

/**
 * Analyze tool/webhook to determine what variables it might populate
 */
function analyzeToolOutput(tool) {
  const name = (tool.name || '').toLowerCase();
  const description = (tool.description || '').toLowerCase();
  const combined = `${name} ${description}`;

  // Common patterns for what data webhooks provide
  const patterns = {
    'customer_info': ['customer', 'account', 'user', 'profile'],
    'loan_info': ['loan', 'emi', 'balance', 'payment'],
    'transaction': ['transaction', 'payment', 'transfer'],
    'appointment': ['appointment', 'booking', 'schedule'],
    'authentication': ['auth', 'verify', 'validate', 'login'],
  };

  const providedData = [];
  for (const [dataType, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => combined.includes(keyword))) {
      providedData.push(dataType);
    }
  }

  return providedData;
}

/**
 * Classify variable based on source and naming
 */
function classifyVariableSource(varName, sources, tools) {
  const name = varName.toLowerCase();

  // Check if variable is likely populated by a webhook
  let likelyWebhookPopulated = false;
  let webhookSource = null;

  // Variables with customer_info, loan_info, etc. prefixes are usually webhook-populated
  if (name.includes('customer_info') || name.includes('loan_info') ||
      name.includes('account_info') || name.includes('user_info')) {
    likelyWebhookPopulated = true;

    // Try to identify which webhook
    for (const tool of tools) {
      const providedData = analyzeToolOutput(tool);
      if (name.includes('customer') && providedData.includes('customer_info')) {
        webhookSource = tool.name;
        break;
      } else if (name.includes('loan') && providedData.includes('loan_info')) {
        webhookSource = tool.name;
        break;
      }
    }
  }

  // Classification
  if (sources.includes('first_message') && !likelyWebhookPopulated) {
    return 'user_input_required'; // Must be provided by user
  } else if (likelyWebhookPopulated) {
    return 'webhook_populated'; // Fetched from API
  } else if (name.includes('opening_message') || name.includes('greeting')) {
    return 'system_managed'; // Pre-configured
  } else if (sources.includes('system_prompt') && name.includes('session_config')) {
    return 'user_input_optional'; // Can be provided by user
  } else {
    return 'unclear'; // Needs manual review
  }
}

/**
 * Scan a single agent for variables
 */
async function scanAgent(agentId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/v1/convai/agents/${agentId}`,
      { headers }
    );

    const agent = response.data;
    const variables = {};

    // Extract from system prompt
    const systemPrompt = agent.conversation_config?.agent?.prompt?.prompt || '';
    const promptVars = extractVariables(systemPrompt);

    promptVars.forEach(varName => {
      const meta = categorizeVariable(varName);
      variables[varName] = {
        source: ['system_prompt'],
        ...meta,
        fieldType: getFieldType(varName),
        label: generateLabel(varName),
        placeholder: generatePlaceholder(varName, getFieldType(varName)),
      };
    });

    // Extract from first message
    const firstMessage = agent.conversation_config?.agent?.first_message || '';
    const firstMessageVars = extractVariables(firstMessage);

    firstMessageVars.forEach(varName => {
      if (variables[varName]) {
        variables[varName].source.push('first_message');
        // Mark as required if in first message
        variables[varName].required = true;
      } else {
        const meta = categorizeVariable(varName);
        variables[varName] = {
          source: ['first_message'],
          ...meta,
          required: true, // Variables in first message are usually required
          fieldType: getFieldType(varName),
          label: generateLabel(varName),
          placeholder: generatePlaceholder(varName, getFieldType(varName)),
        };
      }
    });

    // Extract from tool configurations (webhook headers, etc.)
    const tools = agent.conversation_config?.agent?.prompt?.tools || [];
    const toolsInfo = [];

    tools.forEach(tool => {
      // Capture tool information
      const toolInfo = {
        name: tool.name,
        type: tool.type,
        description: tool.description || '',
        provides_data: analyzeToolOutput(tool),
      };
      toolsInfo.push(toolInfo);

      if (tool.type === 'webhook' && tool.config?.headers) {
        Object.values(tool.config.headers).forEach(headerValue => {
          const toolVars = extractVariables(headerValue);
          toolVars.forEach(varName => {
            if (variables[varName]) {
              if (!variables[varName].source.includes('webhook_headers')) {
                variables[varName].source.push('webhook_headers');
              }
            } else {
              const meta = categorizeVariable(varName);
              variables[varName] = {
                source: ['webhook_headers'],
                ...meta,
                fieldType: getFieldType(varName),
                label: generateLabel(varName),
                placeholder: generatePlaceholder(varName, getFieldType(varName)),
              };
            }
          });
        });
      }
    });

    // Classify each variable
    Object.keys(variables).forEach(varName => {
      variables[varName].classification = classifyVariableSource(
        varName,
        variables[varName].source,
        toolsInfo
      );
      variables[varName].webhook_source = null;

      // Try to identify webhook source for webhook-populated variables
      if (variables[varName].classification === 'webhook_populated') {
        for (const tool of toolsInfo) {
          const providedData = tool.provides_data;
          const name = varName.toLowerCase();

          if ((name.includes('customer') && providedData.includes('customer_info')) ||
              (name.includes('loan') && providedData.includes('loan_info')) ||
              (name.includes('transaction') && providedData.includes('transaction')) ||
              (name.includes('appointment') && providedData.includes('appointment'))) {
            variables[varName].webhook_source = tool.name;
            break;
          }
        }
      }
    });

    // Check for knowledge base references
    const knowledgeBaseFiles = [];
    const knowledgeBaseRefs = [];

    // Look for knowledge base references in system prompt
    const kbPatterns = [
      /knowledge\s+base.*?['"](.*?)['"]/,
      /file.*?['"](.*?\.(?:txt|pdf|csv|json))['"]/,
      /document.*?['"](.*?)['"]/,
      /customers\.txt/i,
      /data\.csv/i,
    ];

    kbPatterns.forEach(pattern => {
      const match = systemPrompt.match(pattern);
      if (match) {
        knowledgeBaseRefs.push(match[1] || match[0]);
      }
    });

    // Check if knowledge base is mentioned generically
    if (systemPrompt.toLowerCase().includes('knowledge base') ||
        systemPrompt.toLowerCase().includes('knowledge_base')) {
      knowledgeBaseRefs.push('Knowledge base referenced (file name not specified)');
    }

    return {
      agent_id: agentId,
      agent_name: agent.name,
      category: determineAgentCategory(agent.name),

      // Configuration
      system_prompt: systemPrompt,
      first_message: firstMessage,
      system_prompt_length: systemPrompt.length,
      first_message_length: firstMessage.length,

      // Tools/Webhooks
      tools: toolsInfo,
      tool_count: toolsInfo.length,
      webhook_count: toolsInfo.filter(t => t.type === 'webhook').length,

      // Knowledge Base
      knowledge_base_refs: [...new Set(knowledgeBaseRefs)],
      has_knowledge_base: knowledgeBaseRefs.length > 0,

      // Variables
      variables: variables,
      variable_count: Object.keys(variables).length,
      required_variables: Object.keys(variables).filter(v => variables[v].required),
      user_input_variables: Object.keys(variables).filter(v => variables[v].userInput),

      // Variable Classification
      user_input_required_vars: Object.keys(variables).filter(v => variables[v].classification === 'user_input_required'),
      webhook_populated_vars: Object.keys(variables).filter(v => variables[v].classification === 'webhook_populated'),
      system_managed_vars: Object.keys(variables).filter(v => variables[v].classification === 'system_managed'),
      unclear_vars: Object.keys(variables).filter(v => variables[v].classification === 'unclear'),
    };

  } catch (error) {
    console.error(`❌ Error scanning agent ${agentId}:`, error.message);
    return null;
  }
}

/**
 * Determine agent category from name
 */
function determineAgentCategory(name) {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('bank') || nameLower.includes('loan') || nameLower.includes('emi')) {
    return 'Banking';
  }
  if (nameLower.includes('doctor') || nameLower.includes('health') || nameLower.includes('medical')) {
    return 'Healthcare';
  }
  if (nameLower.includes('traffic') || nameLower.includes('challan')) {
    return 'Traffic';
  }
  if (nameLower.includes('nmc') || nameLower.includes('municipal')) {
    return 'Municipal';
  }
  if (nameLower.includes('hotel') || nameLower.includes('hospitality')) {
    return 'Hospitality';
  }
  if (nameLower.includes('real estate') || nameLower.includes('property')) {
    return 'Real Estate';
  }

  return 'General';
}

/**
 * Main execution
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   Enhanced Agent Feature Scanner                              ║');
  console.log('║   Analyzing variables, webhooks, knowledge bases & more       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  try {
    // Fetch all agents with pagination
    console.log('📡 Fetching agents from ElevenLabs (with pagination)...');

    let allAgents = [];
    let cursor = null;
    const pageSize = 100;
    let pageNumber = 1;

    while (true) {
      const params = { page_size: pageSize };
      if (cursor) {
        params.cursor = cursor;
      }

      console.log(`  Fetching page ${pageNumber}...`);

      const response = await axios.get(
        `${BASE_URL}/v1/convai/agents`,
        { headers, params }
      );

      const pageData = response.data;
      const agents = pageData.agents || [];

      console.log(`  Page ${pageNumber}: received ${agents.length} agents`);

      allAgents = allAgents.concat(agents);

      // Check pagination metadata
      const hasMore = pageData.has_more || false;
      cursor = pageData.next_cursor || null;

      if (!hasMore || !cursor) {
        break;
      }

      pageNumber++;
    }

    const agents = allAgents;
    console.log(`✓ Found ${agents.length} agents total\n`);

    // Scan each agent
    console.log('🔍 Scanning agents for variables...\n');
    const results = [];

    for (const agent of agents) {
      console.log(`  Scanning: ${agent.name}`);
      const analysis = await scanAgent(agent.agent_id);

      if (analysis) {
        results.push(analysis);

        const userInputVars = analysis.user_input_variables.length;
        const requiredVars = analysis.required_variables.length;

        console.log(`    ✓ Found ${analysis.variable_count} variables (${userInputVars} user inputs, ${requiredVars} required)`);

        if (requiredVars > 0) {
          console.log(`      ⚠  Required: ${analysis.required_variables.join(', ')}`);
        }
      }
    }

    console.log(`\n✓ Scan complete! Analyzed ${results.length} agents\n`);

    // Generate statistics
    console.log('📊 Statistics:\n');

    const allVariables = new Set();
    const variableUsage = {};
    const stats = {
      total_agents: results.length,
      agents_with_variables: results.filter(a => a.variable_count > 0).length,
      agents_with_tools: results.filter(a => a.tool_count > 0).length,
      agents_with_webhooks: results.filter(a => a.webhook_count > 0).length,
      agents_with_knowledge_base: results.filter(a => a.has_knowledge_base).length,
      total_tools: results.reduce((sum, a) => sum + a.tool_count, 0),
      total_webhooks: results.reduce((sum, a) => sum + a.webhook_count, 0),
    };

    results.forEach(agent => {
      Object.keys(agent.variables).forEach(varName => {
        allVariables.add(varName);
        variableUsage[varName] = (variableUsage[varName] || 0) + 1;
      });
    });

    console.log(`  Total agents: ${stats.total_agents}`);
    console.log(`  Agents with variables: ${stats.agents_with_variables}`);
    console.log(`  Agents with tools: ${stats.agents_with_tools}`);
    console.log(`  Agents with webhooks: ${stats.agents_with_webhooks}`);
    console.log(`  Agents with knowledge base: ${stats.agents_with_knowledge_base}`);
    console.log(`  Total unique variables: ${allVariables.size}`);
    console.log(`  Total tools/webhooks: ${stats.total_tools} (${stats.total_webhooks} webhooks)\n`);

    // Variable classification stats
    const classificationStats = {
      user_input_required: 0,
      webhook_populated: 0,
      system_managed: 0,
      unclear: 0,
    };

    results.forEach(agent => {
      classificationStats.user_input_required += agent.user_input_required_vars?.length || 0;
      classificationStats.webhook_populated += agent.webhook_populated_vars?.length || 0;
      classificationStats.system_managed += agent.system_managed_vars?.length || 0;
      classificationStats.unclear += agent.unclear_vars?.length || 0;
    });

    console.log('  Variable Classifications:');
    console.log(`    - User Input Required: ${classificationStats.user_input_required}`);
    console.log(`    - Webhook Populated: ${classificationStats.webhook_populated}`);
    console.log(`    - System Managed: ${classificationStats.system_managed}`);
    console.log(`    - Unclear: ${classificationStats.unclear}\n`);

    // Most common variables
    console.log('  Most common variables:');
    const sortedVars = Object.entries(variableUsage)
      .filter(([name]) => !name.startsWith('system__'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedVars.forEach(([varName, count]) => {
      console.log(`    - ${varName}: used in ${count} agent(s)`);
    });

    // Category breakdown
    console.log('\n  Agents by Category:');
    const categoryStats = {};
    results.forEach(agent => {
      categoryStats[agent.category] = (categoryStats[agent.category] || 0) + 1;
    });
    Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`    - ${cat}: ${count} agent(s)`);
    });

    // Save results - Enhanced version
    const outputFile = 'agent-features-complete.json';
    await fs.writeFile(
      outputFile,
      JSON.stringify({
        scan_timestamp: new Date().toISOString(),
        scan_type: 'comprehensive',
        summary: {
          ...stats,
          total_unique_variables: allVariables.size,
          classification_stats: classificationStats,
        },
        variable_usage_stats: variableUsage,
        category_breakdown: categoryStats,
        agents: results,
      }, null, 2)
    );

    console.log(`\n💾 Comprehensive results saved to: ${outputFile}`);

    // Also save backward-compatible version
    const compatibleFile = 'agent-variables.json';
    await fs.writeFile(
      compatibleFile,
      JSON.stringify({
        scan_timestamp: new Date().toISOString(),
        total_agents: results.length,
        total_unique_variables: allVariables.size,
        variable_usage_stats: variableUsage,
        agents: results,
      }, null, 2)
    );

    console.log(`💾 Compatible version saved to: ${compatibleFile}`);
    console.log('\n✅ Done! Analysis complete with enhanced agent details.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run
main();
