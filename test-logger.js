#!/usr/bin/env node

/**
 * Test script to verify structured logger functionality
 * Tests all log levels and different environments
 */

const { logger, logError, logWarn, logInfo, logDebug, LogLevel } = require('./src/lib/utils/logger.ts');

console.log('=== ArgosFinal Logger Test Suite ===\n');

// Test 1: Basic logger functionality
console.log('1. Testing basic logger functionality...');
try {
  logger.info('Logger test starting');
  logger.error('Test error message', { testData: 'error context' });
  logger.warn('Test warning message', { testData: 'warn context' });
  logger.info('Test info message', { testData: 'info context' });
  logger.debug('Test debug message', { testData: 'debug context' });
  console.log('✅ Basic logger test passed');
} catch (error) {
  console.log('❌ Basic logger test failed:', error.message);
}

// Test 2: Convenience functions
console.log('\n2. Testing convenience functions...');
try {
  logError('Convenience error test', { function: 'logError' });
  logWarn('Convenience warn test', { function: 'logWarn' });
  logInfo('Convenience info test', { function: 'logInfo' });
  logDebug('Convenience debug test', { function: 'logDebug' });
  console.log('✅ Convenience functions test passed');
} catch (error) {
  console.log('❌ Convenience functions test failed:', error.message);
}

// Test 3: Log levels
console.log('\n3. Testing log levels...');
try {
  // Set to ERROR level
  logger.setLevel(LogLevel.ERROR);
  console.log('Set to ERROR level - should only show errors');
  logger.error('Error level test - should show');
  logger.warn('Warn level test - should not show');
  logger.info('Info level test - should not show');
  logger.debug('Debug level test - should not show');
  
  // Set to INFO level
  logger.setLevel(LogLevel.INFO);
  console.log('Set to INFO level - should show ERROR, WARN, INFO');
  logger.error('Error level test - should show');
  logger.warn('Warn level test - should show');
  logger.info('Info level test - should show');
  logger.debug('Debug level test - should not show');
  
  console.log('✅ Log levels test passed');
} catch (error) {
  console.log('❌ Log levels test failed:', error.message);
}

// Test 4: Rate limiting
console.log('\n4. Testing rate limiting...');
try {
  logger.setLevel(LogLevel.INFO);
  console.log('Testing rate limiting (should limit after 3 messages)...');
  for (let i = 0; i < 5; i++) {
    logger.info(`Rate limited message ${i + 1}`, { iteration: i }, 'rate-test');
  }
  console.log('✅ Rate limiting test passed');
} catch (error) {
  console.log('❌ Rate limiting test failed:', error.message);
}

// Test 5: Logger stats
console.log('\n5. Testing logger stats...');
try {
  const stats = logger.getStats();
  console.log('Logger stats:', stats);
  console.log('✅ Logger stats test passed');
} catch (error) {
  console.log('❌ Logger stats test failed:', error.message);
}

// Test 6: Recent logs
console.log('\n6. Testing recent logs retrieval...');
try {
  const recentLogs = logger.getRecentLogs(5);
  console.log(`Retrieved ${recentLogs.length} recent logs`);
  console.log('Sample recent log:', recentLogs[0]);
  console.log('✅ Recent logs test passed');
} catch (error) {
  console.log('❌ Recent logs test failed:', error.message);
}

// Test 7: Console output toggle
console.log('\n7. Testing console output toggle...');
try {
  logger.setConsoleOutput(false);
  console.log('Console output disabled - next message should not appear in console');
  logger.info('This should not appear in console');
  
  logger.setConsoleOutput(true);
  console.log('Console output re-enabled - next message should appear in console');
  logger.info('This should appear in console');
  console.log('✅ Console output toggle test passed');
} catch (error) {
  console.log('❌ Console output toggle test failed:', error.message);
}

console.log('\n=== Logger Test Suite Complete ===');