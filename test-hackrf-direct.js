#!/usr/bin/env node

import { spawn } from 'child_process';
import { logInfo, logError, logDebug as _logDebug, logWarn, logSuccess, logData } from './test-logger.js';

logInfo('🚀 Starting direct HackRF test...');

// Spawn hackrf_sweep directly with simple parameters
const hackrfProcess = spawn('hackrf_sweep', [
  '-f', '2390:2410',  // 2.4 GHz range
  '-l', '32',         // LNA gain
  '-g', '20',         // VGA gain
  '-w', '20000'       // 20 kHz bandwidth (same as sweepManager)
], {
  detached: false,
  stdio: ['ignore', 'pipe', 'pipe']
});

logSuccess(`✅ Process spawned with PID: ${hackrfProcess.pid}`);

// Handle stdout
hackrfProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    logData(`📊 stdout: ${line}`);
  });
});

// Handle stderr
hackrfProcess.stderr.on('data', (data) => {
  logError(`📍 stderr: ${data.toString().trim()}`);
});

// Handle exit
hackrfProcess.on('exit', (code, signal) => {
  logInfo(`🔴 Process exited - Code: ${code}, Signal: ${signal}`);
});

hackrfProcess.on('error', (error) => {
  logError(`❌ Process error: ${error.message}`);
});

// Monitor for 30 seconds then stop
setTimeout(() => {
  logInfo('⏹️ Stopping test...');
  hackrfProcess.kill('SIGTERM');
  setTimeout(() => {
    if (!hackrfProcess.killed) {
      logWarn('⚠️ Process still running, sending SIGKILL...');
      hackrfProcess.kill('SIGKILL');
    }
  }, 2000);
}, 30000);

// Handle script termination
process.on('SIGINT', () => {
  logInfo('\n🛑 Received SIGINT, stopping...');
  hackrfProcess.kill('SIGTERM');
  setTimeout(() => process.exit(0), 1000);
});