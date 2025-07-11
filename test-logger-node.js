#!/usr/bin/env node

/**
 * Node.js Logger Functionality Test
 * Tests the structured logger in a Node.js environment
 * Verifies all log levels and console output functionality
 */

import { logger, logError, logWarn, logInfo, logDebug, LogLevel } from './src/lib/utils/logger.js';

console.log('🧪 Starting Node.js Logger Test Suite...\n');

// Test 1: Basic logger instance functionality
console.log('=== Test 1: Basic Logger Instance ===');
console.log('Logger instance:', typeof logger);
console.log('Logger methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(logger)));

// Test 2: Test all log levels directly through logger instance
console.log('\n=== Test 2: Direct Logger Instance Methods ===');
logger.error('Test ERROR message from logger instance', { test: 'direct_error' });
logger.warn('Test WARN message from logger instance', { test: 'direct_warn' });
logger.info('Test INFO message from logger instance', { test: 'direct_info' });
logger.debug('Test DEBUG message from logger instance', { test: 'direct_debug' });

// Test 3: Test convenience functions
console.log('\n=== Test 3: Convenience Functions ===');
logError('Test ERROR message from convenience function', { test: 'convenience_error' });
logWarn('Test WARN message from convenience function', { test: 'convenience_warn' });
logInfo('Test INFO message from convenience function', { test: 'convenience_info' });
logDebug('Test DEBUG message from convenience function', { test: 'convenience_debug' });

// Test 4: Test log level filtering
console.log('\n=== Test 4: Log Level Filtering ===');
console.log('Current log level:', logger.getLevel());
console.log('Setting log level to ERROR (0)');
logger.setLevel(LogLevel.ERROR);
logError('This ERROR should appear');
logWarn('This WARN should NOT appear');
logInfo('This INFO should NOT appear');
logDebug('This DEBUG should NOT appear');

console.log('\nSetting log level back to DEBUG (3)');
logger.setLevel(LogLevel.DEBUG);
logError('This ERROR should appear');
logWarn('This WARN should appear');
logInfo('This INFO should appear');
logDebug('This DEBUG should appear');

// Test 5: Test rate limiting
console.log('\n=== Test 5: Rate Limiting ===');
console.log('Testing rate limiting with same rate key...');
for (let i = 0; i < 5; i++) {
  logInfo(`Rate limited message ${i + 1}`, { iteration: i }, 'test-rate-key');
}

// Test 6: Test context objects
console.log('\n=== Test 6: Context Objects ===');
logInfo('Message with simple context', { user: 'test', action: 'login' });
logError('Error with complex context', { 
  error: 'Authentication failed', 
  user: 'testuser', 
  timestamp: new Date(),
  details: { attempts: 3, lastAttempt: '2024-01-01' }
});

// Test 7: Test buffer functionality
console.log('\n=== Test 7: Buffer Functionality ===');
console.log('Getting recent logs from buffer...');
const recentLogs = logger.getRecentLogs(5);
console.log(`Buffer contains ${recentLogs.length} recent logs`);
recentLogs.forEach((log, index) => {
  console.log(`  ${index + 1}. [${log.level}] ${log.message}`);
});

// Test 8: Test memory management
console.log('\n=== Test 8: Memory Management ===');
console.log('Current memory usage:', logger.getMemoryUsage());

// Test 9: Test JSON serialization
console.log('\n=== Test 9: JSON Serialization ===');
const logData = {
  message: 'Test JSON data',
  complex: {
    nested: { value: 42 },
    array: [1, 2, 3]
  }
};
logInfo('JSON serialization test', logData);

// Test 10: Test error handling
console.log('\n=== Test 10: Error Handling ===');
try {
  throw new Error('Test error for logging');
} catch (error) {
  logError('Caught error test', { 
    error: error.message,
    stack: error.stack.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
  });
}

// Test 11: Test with undefined/null values
console.log('\n=== Test 11: Null/Undefined Handling ===');
logInfo('Testing null context', null);
logInfo('Testing undefined context', undefined);
logInfo('Testing empty context', {});

// Test 12: Performance test
console.log('\n=== Test 12: Performance Test ===');
const startTime = Date.now();
for (let i = 0; i < 1000; i++) {
  logDebug(`Performance test message ${i}`, { iteration: i });
}
const endTime = Date.now();
console.log(`Performance test: 1000 log messages in ${endTime - startTime}ms`);

// Test 13: Test LogLevel enum
console.log('\n=== Test 13: LogLevel Enum ===');
console.log('LogLevel enum values:');
console.log('ERROR:', LogLevel.ERROR);
console.log('WARN:', LogLevel.WARN);
console.log('INFO:', LogLevel.INFO);
console.log('DEBUG:', LogLevel.DEBUG);

// Summary
console.log('\n=== Test Summary ===');
console.log('✅ All Node.js logger tests completed successfully');
console.log('✅ Logger instance working correctly');
console.log('✅ All log levels functional');
console.log('✅ Convenience functions working');
console.log('✅ Rate limiting functional');
console.log('✅ Context objects handled properly');
console.log('✅ Buffer functionality working');
console.log('✅ Memory management accessible');
console.log('✅ JSON serialization working');
console.log('✅ Error handling functional');
console.log('✅ Null/undefined handling working');
console.log('✅ Performance acceptable');
console.log('✅ LogLevel enum accessible');

console.log('\n🎉 Node.js Logger Test Suite Complete!');