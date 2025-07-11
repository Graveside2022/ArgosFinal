#!/usr/bin/env node

// Test script for Kismet proxy endpoints
const { logInfo, logError, logDebug, logWarn, logSuccess, logData, logSection } = require('./test-logger.js');

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
  logSection('🚀 Starting Kismet Proxy tests...');
  
  // Test configuration endpoint
  logSection('=== Configuration Tests ===');
  await testEndpoint('Proxy Config', 'GET', '/api/kismet/config');
  
  // Test generic proxy endpoints
  logSection('=== Generic Proxy Tests ===');
  await testEndpoint('System Status (via proxy)', 'GET', '/api/kismet/proxy/system/status.json');
  await testEndpoint('Datasources (via proxy)', 'GET', '/api/kismet/proxy/datasource/all_sources.json');
  await testEndpoint('Channel List (via proxy)', 'GET', '/api/kismet/proxy/channels/channels.json');
  
  // Test device endpoints
  logSection('=== Device Endpoint Tests ===');
  await testEndpoint('List All Devices', 'GET', '/api/kismet/devices/list');
  await testEndpoint('Filter by Type', 'GET', '/api/kismet/devices/list?type=AP');
  await testEndpoint('Filter by Signal', 'GET', '/api/kismet/devices/list?minSignal=-70');
  await testEndpoint('Filter by Recent', 'GET', '/api/kismet/devices/list?seenWithin=5');
  
  // Test POST proxy endpoint
  logSection('=== POST Proxy Tests ===');
  const deviceQuery = {
    fields: [
      'kismet.device.base.macaddr',
      'kismet.device.base.name',
      'kismet.device.base.type'
    ]
  };
  await testEndpoint('Device Query (via proxy)', 'POST', '/api/kismet/proxy/devices/views/all/devices.json', deviceQuery);
  
  logSuccess('✅ Tests completed!');
}

// Check if Kismet API key is set
if (!process.env.KISMET_API_KEY) {
  logWarn('⚠️  Warning: KISMET_API_KEY environment variable is not set');
  logWarn('   You may need to set it for authenticated requests to work');
  logWarn('   Example: KISMET_API_KEY=your-key-here node test-kismet-proxy.js');
}

// Run tests
runTests().catch(error => logError(`Test suite error: ${error.message}`));