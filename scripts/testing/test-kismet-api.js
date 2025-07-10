#!/usr/bin/env node

// Test script for Kismet API endpoints
const { logInfo, logError, logDebug, logWarn: _logWarn, logSuccess, logData, logSection } = require('./test-logger.js');

const BASE_URL = 'http://localhost:5173'; // Vite dev server

async function testEndpoint(name, method, path, body = null) {
  logInfo(`📡 Testing ${name}...`);
  logDebug(`   ${method} ${path}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    
    logInfo(`   Status: ${response.status}`);
    logData(`   Response: ${JSON.stringify(data, null, 2)}`);
    
    return { success: response.ok, data };
  } catch (error) {
    logError(`   ❌ Error: ${error.message}`);
    return { success: false, error };
  }
}

async function runTests() {
  logSection('🚀 Starting Kismet API tests...');
  
  // Test main API endpoint
  await testEndpoint('Main API', 'GET', '/api/kismet');
  
  // Test service endpoints
  await testEndpoint('Service Status', 'GET', '/api/kismet/service/status');
  
  // Test devices endpoints
  await testEndpoint('List Devices', 'GET', '/api/kismet/devices/list');
  await testEndpoint('Device Stats', 'GET', '/api/kismet/devices/stats');
  
  // Test scripts endpoints
  await testEndpoint('List Scripts', 'GET', '/api/kismet/scripts/list');
  
  logSuccess('✅ Tests completed!');
}

// Run tests
runTests().catch(error => logError(`Test suite error: ${error.message}`));