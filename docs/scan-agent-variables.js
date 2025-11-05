/**
 * Agent Variable Scanner
 *
 * Scans all ElevenLabs agents to find what variables they use in:
 * - System prompts
 * - First messages
 * - Tool configurations
 *
 * Outputs: agent-variables.json with all discovered variables per agent
 */

import axios from 'axios';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
const envPath = join(__dirname, 'backend', '.env');
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
    tools.forEach(tool => {
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

    return {
      agent_id: agentId,
      agent_name: agent.name,
      category: determineAgentCategory(agent.name),
      variables: variables,
      variable_count: Object.keys(variables).length,
      required_variables: Object.keys(variables).filter(v => variables[v].required),
      user_input_variables: Object.keys(variables).filter(v => variables[v].userInput),
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
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   Agent Variable Scanner                              ║');
  console.log('║   Analyzing all agents for dynamic variables          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    // Fetch all agents
    console.log('📡 Fetching agents from ElevenLabs...');
    const agentsResponse = await axios.get(
      `${BASE_URL}/v1/convai/agents`,
      { headers }
    );

    const agents = agentsResponse.data.agents || [];
    console.log(`✓ Found ${agents.length} agents\n`);

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

    results.forEach(agent => {
      Object.keys(agent.variables).forEach(varName => {
        allVariables.add(varName);
        variableUsage[varName] = (variableUsage[varName] || 0) + 1;
      });
    });

    console.log(`  Total unique variables: ${allVariables.size}`);
    console.log(`  Total agents: ${results.length}`);
    console.log(`  Agents with variables: ${results.filter(a => a.variable_count > 0).length}`);
    console.log(`  Agents with required variables: ${results.filter(a => a.required_variables.length > 0).length}\n`);

    // Most common variables
    console.log('  Most common variables:');
    const sortedVars = Object.entries(variableUsage)
      .filter(([name]) => !name.startsWith('system__'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedVars.forEach(([varName, count]) => {
      console.log(`    - ${varName}: used in ${count} agent(s)`);
    });

    // Save results
    const outputFile = 'agent-variables.json';
    await fs.writeFile(
      outputFile,
      JSON.stringify({
        scan_timestamp: new Date().toISOString(),
        total_agents: results.length,
        total_unique_variables: allVariables.size,
        variable_usage_stats: variableUsage,
        agents: results,
      }, null, 2)
    );

    console.log(`\n💾 Results saved to: ${outputFile}`);
    console.log('\n✅ Done! Use this file to build dynamic forms.\n');

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
