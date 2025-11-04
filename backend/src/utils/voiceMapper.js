/**
 * Voice Mapper Utility
 *
 * ⚠️ NOTE: This utility is CURRENTLY NOT USED in the application.
 *
 * Each of your 30 agents already has its voice configured in the ElevenLabs dashboard.
 * The application does NOT override voices - it lets each agent use its default configured voice.
 *
 * This utility was originally created for scenarios where you need to dynamically override
 * voices at runtime, but that's not necessary for your use case since each agent variant
 * (e.g., Doctor Appointment Agent_hindi_female) already has the correct voice set up.
 *
 * If in the future you need to dynamically override voices, you can:
 * 1. Uncomment the voice mapping logic in callController.js (line 70-85)
 * 2. Replace the placeholder voice IDs below with actual ElevenLabs voice IDs
 * 3. Pass voice_id explicitly from the frontend when needed
 *
 * How to find your voice IDs:
 * 1. Go to https://elevenlabs.io/app/voice-library
 * 2. Click on a voice
 * 3. Look for the Voice ID (starts with something like "21m00Tcm4TlvDq8ikWAM")
 *
 * Example usage (if enabled):
 * const { getVoiceId } = require('./voiceMapper');
 * const voiceId = getVoiceId('Hindi', 'female');
 */

// Voice ID mapping for different language and gender combinations
// ⚠️ WARNING: These are PLACEHOLDER values and will NOT work with ElevenLabs!
// ⚠️ Voice overrides will be IGNORED until you replace these with real voice IDs!
const voiceMap = {
  // Hindi voices - REPLACE THESE WITH ACTUAL VOICE IDs FROM YOUR ELEVENLABS ACCOUNT
  'hindi_male': 'REPLACE_ME_WITH_ACTUAL_HINDI_MALE_VOICE_ID', // ⚠️ NOT A REAL VOICE ID
  'hindi_female': 'REPLACE_ME_WITH_ACTUAL_HINDI_FEMALE_VOICE_ID', // ⚠️ NOT A REAL VOICE ID

  // English (Indian) voices - REPLACE THESE WITH ACTUAL VOICE IDs
  'english_male': 'REPLACE_ME_WITH_ACTUAL_ENGLISH_MALE_VOICE_ID', // ⚠️ NOT A REAL VOICE ID
  'english_female': 'REPLACE_ME_WITH_ACTUAL_ENGLISH_FEMALE_VOICE_ID', // ⚠️ NOT A REAL VOICE ID

  // British English voices - REPLACE THESE WITH ACTUAL VOICE IDs
  'british_male': 'REPLACE_ME_WITH_ACTUAL_BRITISH_MALE_VOICE_ID', // ⚠️ NOT A REAL VOICE ID
  'british_female': 'REPLACE_ME_WITH_ACTUAL_BRITISH_FEMALE_VOICE_ID', // ⚠️ NOT A REAL VOICE ID

  // Add more language-gender combinations as needed
  // Example: 'spanish_female': 'actual_voice_id_here',
};

/**
 * Get voice ID based on language and gender
 *
 * @param {string} language - Language name (e.g., 'Hindi', 'English', 'British')
 * @param {string} gender - Voice gender ('male' or 'female')
 * @returns {string|null} Voice ID if found, null otherwise
 */
export function getVoiceId(language, gender) {
  if (!language || !gender) {
    return null;
  }

  // Normalize inputs to lowercase
  const normalizedLanguage = language.toLowerCase().trim();
  const normalizedGender = gender.toLowerCase().trim();

  // Create lookup key
  const key = `${normalizedLanguage}_${normalizedGender}`;

  // Return voice ID if found, null otherwise
  return voiceMap[key] || null;
}

/**
 * Get all available voice mappings
 *
 * @returns {object} Voice mapping object
 */
export function getVoiceMap() {
  return { ...voiceMap };
}

/**
 * Add or update a voice mapping
 *
 * @param {string} language - Language name
 * @param {string} gender - Voice gender
 * @param {string} voiceId - ElevenLabs voice ID
 */
export function setVoiceId(language, gender, voiceId) {
  if (!language || !gender || !voiceId) {
    throw new Error('Language, gender, and voiceId are required');
  }

  const normalizedLanguage = language.toLowerCase().trim();
  const normalizedGender = gender.toLowerCase().trim();
  const key = `${normalizedLanguage}_${normalizedGender}`;

  voiceMap[key] = voiceId;
}

/**
 * Check if a voice mapping exists
 *
 * @param {string} language - Language name
 * @param {string} gender - Voice gender
 * @returns {boolean} True if mapping exists, false otherwise
 */
export function hasVoiceId(language, gender) {
  return getVoiceId(language, gender) !== null;
}

export default {
  getVoiceId,
  getVoiceMap,
  setVoiceId,
  hasVoiceId,
};
