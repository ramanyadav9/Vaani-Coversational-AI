/**
 * Dynamic Variables Test Script for ElevenLabs Conversational AI
 *
 * Purpose: Verify that dynamic variables are being properly sent and used by the AI
 *
 * This script will:
 * 1. Initiate a test call with specific dynamic variables
 * 2. Wait for the call to complete
 * 3. Fetch the conversation transcript
 * 4. Verify if the AI actually used the variables in its responses
 *
 * Usage:
 *   node test-dynamic-variables.js
 *
 * Prerequisites:
 *   - Backend server must be running on http://localhost:3000
 *   - npm install axios chalk (if not already installed)
 */

import axios from 'axios';
import chalk from 'chalk';

// Configuration
const CONFIG = {
  backendUrl: 'http://localhost:3000/api',
  testPhoneNumber: '+919168498570', // Phone number to call
  testAgentId: null, // Will be selected automatically (LOAN ENQUIRY or first available)
  testVariables: {
    customer_name: 'TEST USER RAJESH KUMAR',
    email: 'test.rajesh@example.com',
    customer_id: 'TEST_CUST_12345',
    language: 'English',
  },
  pollInterval: 3000, // Poll every 3 seconds
  maxWaitTime: 180000, // Max wait 3 minutes for call to complete
};

// Utility: Pretty print with colors
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  section: (msg) => console.log('\n' + chalk.bold.cyan('═══════════════════════════════════════════════════════')),
  subsection: (msg) => console.log(chalk.cyan('─────────────────────────────────────────────────────')),
};

// API Client
const api = axios.create({
  baseURL: CONFIG.backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Step 1: Fetch available agents and select test agent
 */
async function selectTestAgent() {
  log.section();
  log.info('Step 1: Fetching available agents...');

  try {
    const response = await api.get('/agents');
    const agents = response.data.agents;

    if (!agents || agents.length === 0) {
      throw new Error('No agents found');
    }

    log.success(`Found ${agents.length} agents`);

    // Try to find LOAN ENQUIRY ASSISTANT or use first banking agent
    let selectedAgent = agents.find(a => a.name.includes('LOAN ENQUIRY'));

    if (!selectedAgent) {
      selectedAgent = agents.find(a => a.category === 'Banking');
    }

    if (!selectedAgent) {
      selectedAgent = agents[0]; // Fallback to first agent
    }

    log.success(`Selected agent: ${chalk.bold(selectedAgent.name)}`);
    log.info(`  - ID: ${selectedAgent.agent_id}`);
    log.info(`  - Category: ${selectedAgent.category || 'N/A'}`);

    return selectedAgent;
  } catch (error) {
    log.error(`Failed to fetch agents: ${error.message}`);
    throw error;
  }
}

/**
 * Step 2: Initiate test call with dynamic variables
 */
async function initiateTestCall(agentId) {
  log.section();
  log.info('Step 2: Initiating test call with NEW custom_variables format...');

  // NEW FORMAT: Use custom_variables for all dynamic data
  const payload = {
    agent_id: agentId,
    to_number: CONFIG.testPhoneNumber,
    language: CONFIG.testVariables.language,
    custom_variables: {
      // CRITICAL: All banking agents require opening_message!
      opening_message: 'Hello! I am Pusad Urban Bank\'s virtual assistant here to help with your loan inquiry. How can I assist you today?',
      // Other variables (these match what the agent expects)
      session_configcustomer_name: CONFIG.testVariables.customer_name,
      email: CONFIG.testVariables.email,
      customer_id: CONFIG.testVariables.customer_id,
    }
  };

  log.info('Call payload (NEW FORMAT with custom_variables):');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await api.post('/call', payload);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Call initiation failed');
    }

    const conversationId = response.data.data?.conversation_id || response.data.conversation_id;

    if (!conversationId) {
      throw new Error('No conversation_id returned');
    }

    log.success(`Call initiated successfully!`);
    log.info(`  - Conversation ID: ${chalk.bold(conversationId)}`);
    log.info(`  - Calling: ${CONFIG.testPhoneNumber}`);
    log.warn(`  - Please ANSWER the phone and TALK to the AI for at least 30 seconds`);

    return conversationId;
  } catch (error) {
    log.error(`Failed to initiate call: ${error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
    throw error;
  }
}

/**
 * Step 3: Wait for call to complete
 */
async function waitForCallCompletion(conversationId) {
  log.section();
  log.info('Step 3: Waiting for call to complete...');
  log.info(`  - Max wait time: ${CONFIG.maxWaitTime / 1000} seconds`);
  log.info(`  - Polling every: ${CONFIG.pollInterval / 1000} seconds`);
  log.warn('  - Please complete the call and hang up');

  const startTime = Date.now();
  let lastStatus = null;

  while (Date.now() - startTime < CONFIG.maxWaitTime) {
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      const conversation = response.data.conversation || response.data;

      const status = conversation.status;

      if (status !== lastStatus) {
        log.info(`Status: ${chalk.yellow(status)}`);
        lastStatus = status;
      }

      // Check if call is completed
      if (status === 'done' || status === 'completed') {
        log.success('Call completed successfully!');

        const duration = conversation.call_duration_secs ||
                        conversation.metadata?.call_duration_secs || 0;
        log.info(`  - Duration: ${duration} seconds`);

        return conversation;
      }

      // Check if call failed
      if (status === 'failed' || status === 'error') {
        throw new Error('Call failed or encountered an error');
      }

      // Still in progress, wait and retry
      await new Promise(resolve => setTimeout(resolve, CONFIG.pollInterval));

    } catch (error) {
      if (error.response?.status === 404) {
        log.warn('Conversation not found yet, retrying...');
        await new Promise(resolve => setTimeout(resolve, CONFIG.pollInterval));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Timeout: Call did not complete within maximum wait time');
}

/**
 * Step 4: Fetch and analyze transcript
 */
async function analyzeTranscript(conversationId) {
  log.section();
  log.info('Step 4: Fetching and analyzing transcript...');

  try {
    const response = await api.get(`/conversations/${conversationId}`);
    const conversation = response.data.conversation || response.data;

    // Get transcript from multiple possible locations
    const transcript = conversation.transcript ||
                      conversation.analysis?.transcript ||
                      [];

    if (!transcript || transcript.length === 0) {
      log.warn('No transcript found!');
      log.info('This might mean:');
      log.info('  1. Call was too short');
      log.info('  2. Transcript not yet processed');
      log.info('  3. API doesn\'t return transcripts immediately');
      return null;
    }

    log.success(`Found transcript with ${transcript.length} messages`);
    log.subsection();

    // Print full transcript
    transcript.forEach((msg, idx) => {
      const role = msg.role === 'agent' ? chalk.blue('AI') : chalk.green('User');
      const message = msg.message || msg.content || '';
      console.log(`${role}: ${message}`);
    });

    return transcript;
  } catch (error) {
    log.error(`Failed to fetch transcript: ${error.message}`);
    return null;
  }
}

/**
 * Step 5: Verify variable usage
 */
function verifyVariableUsage(transcript) {
  log.section();
  log.info('Step 5: Verifying variable usage...');

  if (!transcript || transcript.length === 0) {
    log.error('Cannot verify variables - no transcript available');
    return {
      passed: false,
      reason: 'No transcript available',
    };
  }

  // Extract all agent messages
  const agentMessages = transcript
    .filter(msg => msg.role === 'agent')
    .map(msg => (msg.message || msg.content || '').toLowerCase());

  const fullTranscript = agentMessages.join(' ');

  log.subsection();
  log.info('Checking for variable usage...');

  const checks = {
    customer_name: {
      value: CONFIG.testVariables.customer_name,
      searchTerms: ['rajesh', 'kumar'],
      found: false,
    },
    email: {
      value: CONFIG.testVariables.email,
      searchTerms: ['test.rajesh', 'example.com'],
      found: false,
    },
    customer_id: {
      value: CONFIG.testVariables.customer_id,
      searchTerms: ['test_cust', '12345'],
      found: false,
    },
  };

  // Check each variable
  for (const [varName, check] of Object.entries(checks)) {
    const found = check.searchTerms.some(term => fullTranscript.includes(term.toLowerCase()));
    check.found = found;

    if (found) {
      log.success(`✓ Variable "${varName}" was used by AI`);
      log.info(`  - Expected: ${check.value}`);
      log.info(`  - Found keywords: ${check.searchTerms.join(', ')}`);
    } else {
      log.error(`✗ Variable "${varName}" was NOT found in transcript`);
      log.info(`  - Expected: ${check.value}`);
      log.info(`  - Searched for: ${check.searchTerms.join(', ')}`);
    }
  }

  // Calculate results
  const foundCount = Object.values(checks).filter(c => c.found).length;
  const totalCount = Object.keys(checks).length;

  log.subsection();

  if (foundCount === totalCount) {
    log.success(`PASS: All ${totalCount} variables were used by the AI!`);
    return {
      passed: true,
      foundCount,
      totalCount,
      checks,
    };
  } else if (foundCount > 0) {
    log.warn(`PARTIAL PASS: ${foundCount}/${totalCount} variables were used`);
    return {
      passed: false,
      foundCount,
      totalCount,
      checks,
      reason: 'Some variables were not used',
    };
  } else {
    log.error(`FAIL: None of the variables were used by the AI`);
    return {
      passed: false,
      foundCount: 0,
      totalCount,
      checks,
      reason: 'No variables found in transcript',
    };
  }
}

/**
 * Main test function
 */
async function runTest() {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║   Dynamic Variables Test Script                       ║'));
  console.log(chalk.bold.cyan('║   ElevenLabs Conversational AI                        ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════╝\n'));

  let conversationId = null;

  try {
    // Step 1: Select test agent
    const agent = await selectTestAgent();

    // Step 2: Initiate call
    conversationId = await initiateTestCall(agent.agent_id);

    // Step 3: Wait for completion
    const conversation = await waitForCallCompletion(conversationId);

    // Step 4: Fetch transcript
    const transcript = await analyzeTranscript(conversationId);

    // Step 5: Verify variables
    const result = verifyVariableUsage(transcript);

    // Final report
    log.section();
    console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
    console.log(chalk.bold.white('FINAL REPORT'));
    console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));

    console.log(`\nConversation ID: ${chalk.bold(conversationId)}`);
    console.log(`Test Phone: ${CONFIG.testPhoneNumber}`);
    console.log(`Agent: ${agent.name}\n`);

    console.log('Variables Sent:');
    Object.entries(CONFIG.testVariables).forEach(([key, value]) => {
      console.log(`  - ${key}: ${chalk.yellow(value)}`);
    });

    console.log('\nVariable Usage:');
    if (result.checks) {
      Object.entries(result.checks).forEach(([key, check]) => {
        const status = check.found ? chalk.green('✓ FOUND') : chalk.red('✗ NOT FOUND');
        console.log(`  - ${key}: ${status}`);
      });
    }

    console.log('\n' + chalk.bold('Overall Result:'));
    if (result.passed) {
      console.log(chalk.green.bold('  ✓ PASS - Variables are working correctly!'));
    } else {
      console.log(chalk.red.bold('  ✗ FAIL - Variables are NOT working'));
      console.log(chalk.yellow(`  Reason: ${result.reason}`));
    }

    console.log('\n' + chalk.bold.cyan('═══════════════════════════════════════════════════════\n'));

    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1);

  } catch (error) {
    log.section();
    log.error(chalk.bold('TEST FAILED WITH ERROR:'));
    console.error(error.message);

    if (conversationId) {
      log.info(`\nYou can manually check the conversation at:`);
      log.info(`  ${CONFIG.backendUrl}/conversations/${conversationId}`);
    }

    console.log('\n' + chalk.bold.red('═══════════════════════════════════════════════════════\n'));
    process.exit(1);
  }
}

// Run the test
runTest().catch(error => {
  console.error(chalk.red('Unhandled error:'), error);
  process.exit(1);
});
