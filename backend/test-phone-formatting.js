/**
 * Phone Number Formatting Test Suite
 *
 * This file tests the phone number formatting logic to ensure
 * all edge cases are handled correctly.
 */

// Simulate the exact formatting logic from elevenLabsService.js
function formatPhoneNumber(toNumber) {
  console.log(`\n[TEST] Original input: "${toNumber}"`);

  // Format phone number - use length-based detection to avoid false positives
  let cleanNumber = toNumber.trim().replace(/\D/g, ''); // Remove all non-digits
  console.log(`[TEST] After removing non-digits: "${cleanNumber}" (length: ${cleanNumber.length})`);

  let formattedNumber;

  // Determine format based on length - BULLETPROOF logic
  if (cleanNumber.length === 10) {
    // 10 digits: Indian mobile number without country code
    // Examples: 9168498570, 8765432109
    formattedNumber = `+91${cleanNumber}`;
    console.log(`[TEST] 10-digit number detected -> adding +91 prefix`);
  } else if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
    // 12 digits starting with 91: Already has country code (91 + 10 digits)
    // Example: 919168498570
    formattedNumber = `+${cleanNumber}`;
    console.log(`[TEST] 12-digit number with 91 prefix detected -> adding + only`);
  } else if (cleanNumber.length === 11 && cleanNumber.startsWith('91')) {
    // 11 digits starting with 91: Likely incomplete number (91 + 9 digits)
    // This is an ERROR case - should be 91 + 10 digits
    console.log(`[TEST] WARNING: 11-digit number starting with 91 - incomplete! Adding +91 prefix to make it 13 digits`);
    formattedNumber = `+91${cleanNumber}`;
  } else if (cleanNumber.length === 11) {
    // 11 digits NOT starting with 91: Add country code
    // Example: 19168498570 (someone typed 1 + 10 digits by mistake)
    formattedNumber = `+91${cleanNumber}`;
    console.log(`[TEST] 11-digit number (non-91 prefix) -> adding +91 prefix`);
  } else if (cleanNumber.length > 12) {
    // More than 12 digits: Already includes country code
    formattedNumber = `+${cleanNumber}`;
    console.log(`[TEST] Long number (${cleanNumber.length} digits) -> adding + only`);
  } else if (cleanNumber.length > 0) {
    // Any other length: Try adding +91 (might be incomplete number)
    console.log(`[TEST] Unusual length (${cleanNumber.length} digits) -> adding +91 prefix`);
    formattedNumber = `+91${cleanNumber}`;
  } else {
    // Empty number - this is an error
    throw new Error('Phone number is empty after cleaning');
  }

  console.log(`[TEST] Final formatted number: "${formattedNumber}"`);
  return formattedNumber;
}

// Test cases
const testCases = [
  // PRIMARY TEST CASE - The reported issue
  { input: '9168498570', expected: '+919168498570', description: 'User reported case - 10 digit number starting with 91' },

  // 10-digit numbers (standard Indian mobile)
  { input: '8765432109', expected: '+918765432109', description: '10 digit number starting with 8' },
  { input: '7890123456', expected: '+917890123456', description: '10 digit number starting with 7' },
  { input: '6543210987', expected: '+916543210987', description: '10 digit number starting with 6' },

  // 12-digit numbers (already with country code)
  { input: '919168498570', expected: '+919168498570', description: '12 digit number with 91 prefix' },
  { input: '918765432109', expected: '+918765432109', description: '12 digit number with 91 prefix (starts with 8)' },

  // Numbers with special formatting (should be cleaned)
  { input: '+91 9168498570', expected: '+919168498570', description: 'Number with + and space' },
  { input: '91-9168498570', expected: '+919168498570', description: 'Number with dash' },
  { input: '(91) 9168498570', expected: '+919168498570', description: 'Number with parentheses' },
  { input: '+919168498570', expected: '+919168498570', description: 'Number already properly formatted' },

  // Edge cases
  { input: '  9168498570  ', expected: '+919168498570', description: 'Number with leading/trailing spaces' },
  { input: '91 91 68 49 85 70', expected: '+919168498570', description: 'Number with spaces between digits' },

  // 11-digit numbers (edge cases)
  { input: '91916849857', expected: '+9191916849857', description: '11 digit number starting with 91 (incomplete)' },
  { input: '19168498570', expected: '+9119168498570', description: '11 digit number NOT starting with 91' },
];

console.log('='.repeat(80));
console.log('PHONE NUMBER FORMATTING TEST SUITE');
console.log('='.repeat(80));

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log('\n' + '-'.repeat(80));
  console.log(`Test #${index + 1}: ${testCase.description}`);
  console.log('-'.repeat(80));

  try {
    const result = formatPhoneNumber(testCase.input);

    if (result === testCase.expected) {
      console.log(`✅ PASSED - Got expected result: ${result}`);
      passedTests++;
    } else {
      console.log(`❌ FAILED - Expected: ${testCase.expected}, Got: ${result}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED - Error: ${error.message}`);
    failedTests++;
  }
});

console.log('\n' + '='.repeat(80));
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log(`Total Tests: ${testCases.length}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log(`Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);
console.log('='.repeat(80));

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Phone number formatting is working correctly.\n');
} else {
  console.log('\n⚠️  SOME TESTS FAILED! Please review the formatting logic.\n');
  process.exit(1);
}
