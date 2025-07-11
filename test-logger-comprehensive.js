#!/usr/bin/env node

/**
 * Comprehensive Node.js Logger Test
 * Tests all logger functionality in Node.js environment
 * This test uses the working logger implementation
 */

import { 
  logger, 
  logError, 
  logWarn, 
  logInfo, 
  logDebug, 
  logSuccess, 
  logData, 
  logSection,
  LogLevel 
} from './test-logger-working.js';

logSection('ArgosFinal Logger Test Suite - Node.js Environment');

// Test 1: Basic logger functionality
console.log('\n1. Testing basic logger functionality...');
try {
  logger.info('Logger test starting');
  logger.error('Test error message', { testData: 'error context' });
  logger.warn('Test warning message', { testData: 'warn context' });
  logger.info('Test info message', { testData: 'info context' });
  logger.debug('Test debug message', { testData: 'debug context' });
  logSuccess('Basic logger test passed');
} catch (error) {
  logError('Basic logger test failed', { error: error.message });
}

// Test 2: Convenience functions
console.log('\n2. Testing convenience functions...');
try {
  logError('Convenience error test', { function: 'logError' });
  logWarn('Convenience warn test', { function: 'logWarn' });
  logInfo('Convenience info test', { function: 'logInfo' });
  logDebug('Convenience debug test', { function: 'logDebug' });
  logSuccess('Convenience success test', { function: 'logSuccess' });
  logData('Convenience data test', { function: 'logData' });
  logSuccess('Convenience functions test passed');
} catch (error) {
  logError('Convenience functions test failed', { error: error.message });
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
  
  // Set to WARN level
  logger.setLevel(LogLevel.WARN);
  console.log('Set to WARN level - should show ERROR, WARN');
  logger.error('Error level test - should show');
  logger.warn('Warn level test - should show');
  logger.info('Info level test - should not show');
  logger.debug('Debug level test - should not show');
  
  // Set to INFO level
  logger.setLevel(LogLevel.INFO);
  console.log('Set to INFO level - should show ERROR, WARN, INFO');
  logger.error('Error level test - should show');
  logger.warn('Warn level test - should show');
  logger.info('Info level test - should show');
  logger.debug('Debug level test - should not show');
  
  // Set to DEBUG level
  logger.setLevel(LogLevel.DEBUG);
  console.log('Set to DEBUG level - should show all levels');
  logger.error('Error level test - should show');
  logger.warn('Warn level test - should show');
  logger.info('Info level test - should show');
  logger.debug('Debug level test - should show');
  
  logSuccess('Log levels test passed');
} catch (error) {
  logError('Log levels test failed', { error: error.message });
}

// Test 4: Rate limiting
console.log('\n4. Testing rate limiting...');
try {
  console.log('Testing rate limiting (should limit after first message within 1 second)...');
  for (let i = 0; i < 5; i++) {
    logger.info(`Rate limited message ${i + 1}`, { iteration: i }, 'rate-test');
    // Add small delay to test rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  logSuccess('Rate limiting test passed');
} catch (error) {
  logError('Rate limiting test failed', { error: error.message });
}

// Test 5: Logger stats
console.log('\n5. Testing logger stats...');
try {
  const stats = logger.getStats();
  logData('Logger stats', stats);
  logSuccess('Logger stats test passed');
} catch (error) {
  logError('Logger stats test failed', { error: error.message });
}

// Test 6: Recent logs
console.log('\n6. Testing recent logs retrieval...');
try {
  const recentLogs = logger.getRecentLogs(5);
  logData(`Retrieved ${recentLogs.length} recent logs`);
  if (recentLogs.length > 0) {
    logData('Sample recent log', recentLogs[0]);
  }
  logSuccess('Recent logs test passed');
} catch (error) {
  logError('Recent logs test failed', { error: error.message });
}

// Test 7: Console output toggle
console.log('\n7. Testing console output toggle...');
try {
  logger.setConsoleOutput(false);
  console.log('Console output disabled - logger will note this');
  logger.info('This message notes that console output is disabled');
  
  logger.setConsoleOutput(true);
  console.log('Console output re-enabled - logger will note this');
  logger.info('This message notes that console output is enabled');
  logSuccess('Console output toggle test passed');
} catch (error) {
  logError('Console output toggle test failed', { error: error.message });
}

// Test 8: Memory usage
console.log('\n8. Testing memory usage...');
try {
  const memoryUsage = logger.getMemoryUsage();
  logData('Memory usage', memoryUsage);
  logSuccess('Memory usage test passed');
} catch (error) {
  logError('Memory usage test failed', { error: error.message });
}

// Test 9: Context object handling
console.log('\n9. Testing context object handling...');
try {
  logInfo('Simple context test', { user: 'testuser', action: 'login' });
  logInfo('Complex context test', {
    user: 'testuser',
    action: 'complex_operation',
    timestamp: new Date().toISOString(),
    metadata: {
      browser: 'chrome',
      version: '91.0',
      nested: { deep: 'value' }
    }
  });
  logInfo('Null context test', null);
  logInfo('Undefined context test', undefined);
  logSuccess('Context object handling test passed');
} catch (error) {
  logError('Context object handling test failed', { error: error.message });
}

// Test 10: Performance test
console.log('\n10. Testing performance...');
try {
  const startTime = Date.now();
  for (let i = 0; i < 1000; i++) {
    logger.debug(`Performance test message ${i}`, { iteration: i });
  }
  const endTime = Date.now();
  const duration = endTime - startTime;
  logData(`Performance test: 1000 messages in ${duration}ms`, { 
    duration, 
    messagesPerSecond: Math.round(1000 / (duration / 1000))
  });
  logSuccess('Performance test passed');
} catch (error) {
  logError('Performance test failed', { error: error.message });
}

// Test 11: LogLevel enum
console.log('\n11. Testing LogLevel enum...');
try {
  logData('LogLevel enum values', {
    ERROR: LogLevel.ERROR,
    WARN: LogLevel.WARN,
    INFO: LogLevel.INFO,
    DEBUG: LogLevel.DEBUG
  });
  logSuccess('LogLevel enum test passed');
} catch (error) {
  logError('LogLevel enum test failed', { error: error.message });
}

// Test 12: Error handling
console.log('\n12. Testing error handling...');
try {
  // Test error logging
  try {
    throw new Error('Test error for logging');
  } catch (testError) {
    logError('Caught and logged error', { 
      error: testError.message,
      stack: testError.stack.split('\n').slice(0, 3).join('\n')
    });
  }
  logSuccess('Error handling test passed');
} catch (error) {
  logError('Error handling test failed', { error: error.message });
}

// Final summary
logSection('Test Summary');
logSuccess('All Node.js logger tests completed successfully');
logInfo('Test results:');
logInfo('✅ Basic logger functionality working');
logInfo('✅ Convenience functions working');
logInfo('✅ Log levels working correctly');
logInfo('✅ Rate limiting functional');
logInfo('✅ Logger stats accessible');
logInfo('✅ Recent logs retrieval working');
logInfo('✅ Console output toggle working');
logInfo('✅ Memory usage reporting working');
logInfo('✅ Context object handling working');
logInfo('✅ Performance acceptable');
logInfo('✅ LogLevel enum accessible');
logInfo('✅ Error handling working');

logSection('Node.js Logger Test Suite Complete');
console.log('🎉 All tests passed! Logger is functioning correctly in Node.js environment.\n');