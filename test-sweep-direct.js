#!/usr/bin/env node

import { SweepManager } from './src/lib/server/hackrf/sweepManager.js';
import { logInfo, logError, logDebug as _logDebug, logWarn as _logWarn, logSuccess, logData } from './test-logger.js';

logInfo('🧪 Testing SweepManager directly with enhanced logging...\n');

// Create a new sweep manager instance
const sweepManager = new SweepManager();

// Set up event listeners
sweepManager.on('data', (data) => {
  logData('📊 Data received:', JSON.stringify({
    timestamp: data.timestamp,
    frequency: data.frequency,
    dataLength: data.spectrum?.length || 0,
    firstValue: data.spectrum?.[0]
  }));
});

sweepManager.on('error', (error) => {
  logError('❌ Error event: ' + JSON.stringify(error));
});

sweepManager.on('status', (status) => {
  logInfo('📌 Status event: ' + JSON.stringify(status));
});

// Start cycling between two frequencies
async function runTest() {
  try {
    const frequencies = [
      { value: 2400, unit: 'MHz' },
      { value: 2450, unit: 'MHz' }
    ];
    
    logInfo('🚀 Starting cycle with frequencies: ' + JSON.stringify(frequencies));
    const started = await sweepManager.startCycle(frequencies, 10000); // 10 second cycle
    
    if (started) {
      logSuccess('✅ Cycle started successfully\n');
      
      // Monitor for 45 seconds
      logInfo('⏱️ Monitoring for 45 seconds...\n');
      
      setTimeout(async () => {
        logInfo('\n🛑 Stopping sweep...');
        await sweepManager.stopSweep();
        logSuccess('✅ Test complete');
        process.exit(0);
      }, 45000);
      
    } else {
      logError('❌ Failed to start cycle');
      process.exit(1);
    }
  } catch (error) {
    logError('❌ Test error: ' + error.message);
    process.exit(1);
  }
}

// Run the test
runTest();