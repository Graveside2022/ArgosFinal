#!/usr/bin/env node

/**
 * Simple test script to verify logger functionality
 * Tests basic functionality without TypeScript compilation
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

console.log('=== ArgosFinal Logger Test Suite ===\n');

// Test 1: Check if logger file exists and is readable
console.log('1. Testing logger file access...');
try {
  
  const loggerPath = path.join(__dirname, 'src/lib/utils/logger.ts');
  const loggerContent = fs.readFileSync(loggerPath, 'utf8');
  
  console.log('✅ Logger file exists and is readable');
  console.log(`   File size: ${loggerContent.length} characters`);
  console.log(`   Contains LogLevel enum: ${loggerContent.includes('export enum LogLevel')}`);
  console.log(`   Contains convenience functions: ${loggerContent.includes('export const logError')}`);
  console.log(`   Contains circular buffer: ${loggerContent.includes('class CircularLogBuffer')}`);
  console.log(`   Contains rate limiting: ${loggerContent.includes('checkRateLimit')}`);
} catch (error) {
  console.log('❌ Logger file access test failed:', error.message);
}

// Test 2: Check logger usage in existing codebase
console.log('\n2. Testing logger usage in codebase...');
try {
  const execPromise = util.promisify(exec);
  
  // Check for logger imports
  execPromise('grep -r "from.*logger" src/ --include="*.ts" --include="*.svelte" | head -5').then(result => {
    console.log('✅ Logger imports found in codebase:');
    console.log(result.stdout);
  }).catch(err => {
    console.log('⚠️  Logger imports check failed:', err.message);
  });
  
  // Check for logger usage
  execPromise('grep -r "logError\\|logWarn\\|logInfo\\|logDebug" src/ --include="*.ts" --include="*.svelte" | head -5').then(result => {
    console.log('✅ Logger usage found in codebase:');
    console.log(result.stdout);
  }).catch(err => {
    console.log('⚠️  Logger usage check failed:', err.message);
  });
  
} catch (error) {
  console.log('❌ Logger usage test failed:', error.message);
}

// Test 3: Test logger structure and exports
console.log('\n3. Testing logger structure...');
try {
  const loggerPath = path.join(__dirname, 'src/lib/utils/logger.ts');
  const loggerContent = fs.readFileSync(loggerPath, 'utf8');
  
  // Check for required exports
  const requiredExports = [
    'export enum LogLevel',
    'export const logger',
    'export const logError',
    'export const logWarn', 
    'export const logInfo',
    'export const logDebug'
  ];
  
  console.log('Logger exports check:');
  requiredExports.forEach(exportItem => {
    const found = loggerContent.includes(exportItem);
    console.log(`   ${found ? '✅' : '❌'} ${exportItem}: ${found ? 'found' : 'missing'}`);
  });
  
  // Check for logger methods
  const requiredMethods = [
    'error(',
    'warn(',
    'info(',
    'debug(',
    'setLevel(',
    'getRecentLogs(',
    'getStats(',
    'clearLogs('
  ];
  
  console.log('\nLogger methods check:');
  requiredMethods.forEach(method => {
    const found = loggerContent.includes(method);
    console.log(`   ${found ? '✅' : '❌'} ${method}: ${found ? 'found' : 'missing'}`);
  });
  
} catch (error) {
  console.log('❌ Logger structure test failed:', error.message);
}

// Test 4: Check for any syntax issues in the logger file
console.log('\n4. Testing logger syntax...');
try {
  const execPromise = util.promisify(exec);
  
  // Use npx to check TypeScript syntax
  execPromise('npx tsc --noEmit --skipLibCheck src/lib/utils/logger.ts 2>&1').then(result => {
    if (result.stderr) {
      console.log('❌ Logger syntax errors found:');
      console.log(result.stderr);
    } else {
      console.log('✅ Logger syntax check passed - no TypeScript errors');
    }
  }).catch(err => {
    console.log('⚠️  Logger syntax check failed:', err.message);
  });
} catch (error) {
  console.log('❌ Logger syntax test failed:', error.message);
}

console.log('\n=== Logger Test Suite Complete ===');