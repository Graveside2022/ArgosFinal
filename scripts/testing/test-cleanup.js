#!/usr/bin/env node

/**
 * Test database cleanup functionality
 */

import fetch from 'node-fetch';
import { logInfo, logError, logData, logSection } from './test-logger.js';

const API_BASE = 'http://localhost:5173/api/db/cleanup';

async function testCleanup() {
  logSection('Testing database cleanup service');

  try {
    // Get current status
    logInfo('1. Getting cleanup status...');
    const statusRes = await fetch(`${API_BASE}?action=status`);
    const status = await statusRes.json();
    logData('Status:', JSON.stringify(status, null, 2));

    // Run manual cleanup
    logInfo('\n2. Running manual cleanup...');
    const cleanupRes = await fetch(`${API_BASE}?action=manual`);
    const cleanup = await cleanupRes.json();
    logData('Cleanup result:', JSON.stringify(cleanup, null, 2));

    // Get growth trends
    logInfo('\n3. Getting growth trends...');
    const exportRes = await fetch(`${API_BASE}?action=export&days=1`);
    const exportData = await exportRes.json();
    logData('Export data:', JSON.stringify(exportData, null, 2));

    // Run aggregation
    logInfo('\n4. Running aggregation...');
    const aggregateRes = await fetch(`${API_BASE}?action=aggregate`);
    const aggregate = await aggregateRes.json();
    logData('Aggregation result:', JSON.stringify(aggregate, null, 2));

  } catch (error) {
    logError('Test failed:', error);
  }
}

// Run test
testCleanup();