#!/usr/bin/env node

import { sweepManager } from './src/lib/server/hackrf/sweepManager.js';

console.log('🚀 Starting HackRF sweep test...');

// Test frequencies
const frequencies = [
  { value: 2400, unit: 'MHz' },  // 2.4 GHz
  { value: 5800, unit: 'MHz' }   // 5.8 GHz
];

const cycleTime = 10000; // 10 seconds

// Listen to events
sweepManager.on('spectrum', (data) => {
  console.log('📊 Spectrum data received:', {
    freq: data.frequency,
    power: data.power?.toFixed(2),
    timestamp: new Date(data.timestamp).toISOString()
  });
});

sweepManager.on('error', (error) => {
  console.error('❌ Error event:', error);
});

sweepManager.on('status_change', (status) => {
  console.log('📍 Status change:', status);
});

// Start the sweep
console.log('Starting sweep with frequencies:', frequencies);
sweepManager.startCycle(frequencies, cycleTime)
  .then((success) => {
    if (success) {
      console.log('✅ Sweep started successfully');
    } else {
      console.error('❌ Failed to start sweep');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Error starting sweep:', error);
    process.exit(1);
  });

// Run for 2 minutes then stop
setTimeout(() => {
  console.log('⏹️ Stopping sweep...');
  sweepManager.stopSweep()
    .then(() => {
      console.log('✅ Sweep stopped');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error stopping sweep:', error);
      process.exit(1);
    });
}, 120000); // 2 minutes

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, stopping sweep...');
  sweepManager.stopSweep()
    .then(() => {
      console.log('✅ Sweep stopped');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error stopping sweep:', error);
      process.exit(1);
    });
});