#!/usr/bin/env node

/**
 * Working Test Logger for Node.js Environment
 * Provides logger functions that work in ES module environment
 * For testing purposes - simulates the actual logger functionality
 */

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Log levels
export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level
let currentLevel = LogLevel.DEBUG;

// Simple circular buffer for log storage
class SimpleLogBuffer {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.logs = [];
    this.index = 0;
  }
  
  add(log) {
    if (this.logs.length < this.maxSize) {
      this.logs.push(log);
    } else {
      this.logs[this.index] = log;
      this.index = (this.index + 1) % this.maxSize;
    }
  }
  
  getRecent(count = 10) {
    return this.logs.slice(-count);
  }
}

// Rate limiting
const rateLimiter = new Map();

// Log buffer instance
const logBuffer = new SimpleLogBuffer();

// Core logging function
function log(level, levelName, color, message, context = null, rateKey = null) {
  // Check log level
  if (level > currentLevel) {
    return;
  }
  
  // Check rate limiting
  if (rateKey) {
    const now = Date.now();
    const lastLog = rateLimiter.get(rateKey);
    if (lastLog && now - lastLog < 1000) { // 1 second rate limit
      return;
    }
    rateLimiter.set(rateKey, now);
  }
  
  // Create log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: levelName,
    message,
    context
  };
  
  // Add to buffer
  logBuffer.add(logEntry);
  
  // Format output
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  const output = `${color}[${levelName}]${colors.reset} ${timestamp} ${message}${contextStr}`;
  
  // Output to console
  console.log(output);
}

// Logger instance
export const logger = {
  error: (message, context, rateKey) => log(LogLevel.ERROR, 'ERROR', colors.red, message, context, rateKey),
  warn: (message, context, rateKey) => log(LogLevel.WARN, 'WARN', colors.yellow, message, context, rateKey),
  info: (message, context, rateKey) => log(LogLevel.INFO, 'INFO', colors.blue, message, context, rateKey),
  debug: (message, context, rateKey) => log(LogLevel.DEBUG, 'DEBUG', colors.cyan, message, context, rateKey),
  
  setLevel: (level) => {
    currentLevel = level;
    console.log(`${colors.magenta}[SYSTEM]${colors.reset} Log level set to ${level}`);
  },
  
  getLevel: () => currentLevel,
  
  getRecentLogs: (count = 10) => logBuffer.getRecent(count),
  
  getStats: () => ({
    currentLevel,
    bufferSize: logBuffer.logs.length,
    maxBufferSize: logBuffer.maxSize
  }),
  
  setConsoleOutput: (enabled) => {
    console.log(`${colors.magenta}[SYSTEM]${colors.reset} Console output ${enabled ? 'enabled' : 'disabled'}`);
  },
  
  getMemoryUsage: () => ({
    bufferSize: logBuffer.maxSize,
    currentEntries: logBuffer.logs.length
  })
};

// Convenience functions
export const logError = (message, context, rateKey) => logger.error(message, context, rateKey);
export const logWarn = (message, context, rateKey) => logger.warn(message, context, rateKey);
export const logInfo = (message, context, rateKey) => logger.info(message, context, rateKey);
export const logDebug = (message, context, rateKey) => logger.debug(message, context, rateKey);

// Additional convenience functions used in test scripts
export const logSuccess = (message, context, _rateKey) => {
  const output = `${colors.green}[SUCCESS]${colors.reset} ${new Date().toISOString()} ${message}${context ? ` ${JSON.stringify(context)}` : ''}`;
  console.log(output);
};

export const logData = (message, context, _rateKey) => {
  const output = `${colors.magenta}[DATA]${colors.reset} ${new Date().toISOString()} ${message}${context ? ` ${JSON.stringify(context)}` : ''}`;
  console.log(output);
};

export const logSection = (message) => {
  console.log(`\n${colors.cyan}=== ${message} ===${colors.reset}`);
};

// Export default logger
export default logger;