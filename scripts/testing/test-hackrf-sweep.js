#!/usr/bin/env node

/**
 * Test script for HackRF sweep functionality
 * Tests multiple frequencies and SSE streaming
 */

import { logInfo, logError, logSuccess, logData, logFormatted } from './test-logger.js';

const BASE_URL = 'http://localhost:5173/api/hackrf';

async function testStartSweep() {
  logInfo('Testing start-sweep endpoint...');
  
  const testFrequencies = [
    { value: 100, unit: 'MHz' },
    { value: 433.92, unit: 'MHz' },
    { value: 915, unit: 'MHz' }
  ];
  
  try {
    const response = await fetch(`${BASE_URL}/start-sweep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frequencies: testFrequencies,
        cycleTime: 5000 // 5 seconds per frequency
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.status === 'success') {
      logSuccess('Start sweep successful!');
      logData(`Frequencies: ${JSON.stringify(result.frequencies)}`);
      logData(`Cycle time: ${result.cycleTime}ms`);
      return true;
    } else {
      logError(`Start sweep failed: ${result.message}`);
      return false;
    }
  } catch (error) {
    logError(`Start sweep error: ${error.message}`);
    return false;
  }
}

async function testSSEStream(duration = 20000) {
  logInfo('Testing SSE data stream...');
  logInfo(`Will collect data for ${duration/1000} seconds`);
  
  return new Promise((resolve) => {
    const eventSource = new EventSource(`${BASE_URL}/data-stream`);
    const collectedData = {
      sweepData: [],
      statusChanges: [],
      errors: [],
      other: []
    };
    
    let dataCount = 0;
    const startTime = Date.now();
    
    eventSource.onopen = () => {
      logSuccess('SSE connection established');
    };
    
    eventSource.addEventListener('sweep_data', (event) => {
      try {
        const data = JSON.parse(event.data);
        dataCount++;
        collectedData.sweepData.push(data);
        
        // Log first few data points
        if (dataCount <= 3 || dataCount % 10 === 0) {
          logData(`Sweep data #${dataCount}: ${data.frequency.toFixed(3)} ${data.unit}, Power: ${data.power.toFixed(2)} dB`);
        }
      } catch (error) {
        logError(`Error parsing sweep data: ${error.message}`);
      }
    });
    
    eventSource.addEventListener('status_change', (event) => {
      try {
        const data = JSON.parse(event.data);
        collectedData.statusChanges.push(data);
        logData(`Status change: ${data.status}`);
      } catch {
        logError('Error parsing status change');
      }
    });
    
    eventSource.addEventListener('cycle_config', (event) => {
      try {
        const data = JSON.parse(event.data);
        logData(`Cycle config received: ${data.frequencies.length} frequencies, ${data.cycleTime}ms cycle time`);
      } catch (error) {
        logError(`Error parsing cycle config: ${error.message}`);
      }
    });
    
    eventSource.addEventListener('error', (event) => {
      if (event.data) {
        try {
          const data = JSON.parse(event.data);
          collectedData.errors.push(data);
          logError(`Error event: ${data.message}`);
        } catch {
          logError('SSE connection error');
        }
      }
    });
    
    eventSource.onerror = () => {
      logError('SSE connection lost');
    };
    
    // Collect data for specified duration
    setTimeout(() => {
      eventSource.close();
      const elapsed = Date.now() - startTime;
      
      logInfo(`\nSSE Test Summary:`);
      logData(`Duration: ${(elapsed/1000).toFixed(1)}s`);
      logData(`Total sweep data points: ${collectedData.sweepData.length}`);
      logData(`Data rate: ${(collectedData.sweepData.length / (elapsed/1000)).toFixed(1)} points/sec`);
      logData(`Status changes: ${collectedData.statusChanges.length}`);
      logData(`Errors: ${collectedData.errors.length}`);
      
      if (collectedData.sweepData.length > 0) {
        // Analyze signal strengths
        const powers = collectedData.sweepData.map(d => d.power);
        const avgPower = powers.reduce((a, b) => a + b, 0) / powers.length;
        const maxPower = Math.max(...powers);
        const minPower = Math.min(...powers);
        
        logInfo(`\nSignal Analysis:`);
        logData(`Average power: ${avgPower.toFixed(2)} dB`);
        logData(`Max power: ${maxPower.toFixed(2)} dB`);
        logData(`Min power: ${minPower.toFixed(2)} dB`);
      }
      
      resolve(collectedData);
    }, duration);
  });
}

async function testStopSweep() {
  logInfo('\nTesting stop-sweep endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/stop-sweep`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (response.ok && result.status === 'success') {
      logSuccess('Stop sweep successful!');
      return true;
    } else {
      logError(`Stop sweep failed: ${result.message}`);
      return false;
    }
  } catch (error) {
    logError(`Stop sweep error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  logFormatted('=== HackRF Sweep Test Suite ===\n', 'header');
  logInfo(`Testing against: ${BASE_URL}`);
  
  // Test 1: Start sweep
  const startSuccess = await testStartSweep();
  if (!startSuccess) {
    logError('Cannot proceed without successful start');
    process.exit(1);
  }
  
  // Wait a moment for sweep to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: SSE streaming
  await testSSEStream(15000); // Collect data for 15 seconds
  
  // Test 3: Stop sweep
  await testStopSweep();
  
  logFormatted('\n=== Test Complete ===', 'header');
}

// Run the tests
runTests().catch(_error => {
  logError(`Test suite error: ${_error.message}`);
  process.exit(1);
});