#!/usr/bin/env node

// Test script for SweepManager functionality

import { sweepManager } from './src/lib/server/hackrf/sweepManager.js';
import { logInfo, logError, logData, logSuccess, logSection } from './test-logger.js';

logSection('Testing SweepManager');

// Test 1: Check health
logInfo('Test 1: Checking HackRF health...');
try {
  const health = await sweepManager.checkHealth();
  logData('Health check result:', health);
} catch (error) {
  logError('Health check failed:', error);
}

// Test 2: Get status
logInfo('\nTest 2: Getting current status...');
const status = sweepManager.getStatus();
logData('Current status:', status);

// Test 3: Set up event listeners
logInfo('\nTest 3: Setting up event listeners...');

sweepManager.on('spectrum', (data) => {
  logData('Spectrum data received:', {
    frequency: data.frequency,
    power: data.power,
    timestamp: data.timestamp
  });
});

sweepManager.on('status', (status) => {
  logData('Status update:', status);
});

sweepManager.on('error', (error) => {
  logError('Error event:', error);
});

// Test 4: Try to start a sweep (may fail if no HackRF)
logInfo('\nTest 4: Attempting to start sweep...');
try {
  await sweepManager.startSweep({
    centerFrequency: 433920000,
    cycleTime: 5000
  });
  logSuccess('Sweep started successfully!');
  
  // Stop after 10 seconds
  setTimeout(async () => {
    logInfo('\nStopping sweep...');
    await sweepManager.stopSweep();
    logSuccess('Sweep stopped.');
    
    // Cleanup
    await sweepManager.cleanup();
    process.exit(0);
  }, 10000);
  
} catch (error) {
  logError('Failed to start sweep:', error.message);
  
  // Cleanup and exit
  await sweepManager.cleanup();
  process.exit(1);
}