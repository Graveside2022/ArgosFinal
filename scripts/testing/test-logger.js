#!/usr/bin/env node

/**
 * Simple structured logger for Node.js test scripts
 * Provides consistent logging with different levels and colors
 */

// ANSI color codes for better visual output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Create a timestamp string
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Format log message with timestamp and level
 */
function formatMessage(level, message, color) {
  const timestamp = getTimestamp();
  const levelTag = `[${level.toUpperCase()}]`;
  const coloredLevel = color ? `${color}${levelTag}${colors.reset}` : levelTag;
  return `${timestamp} ${coloredLevel} ${message}`;
}

/**
 * Log information messages (general test progress)
 */
function logInfo(message) {
  console.log(formatMessage('info', message, colors.blue));
}

/**
 * Log error messages (test failures, exceptions)
 */
function logError(message) {
  console.error(formatMessage('error', message, colors.red));
}

/**
 * Log debug messages (detailed test information, data dumps)
 */
function logDebug(message) {
  console.log(formatMessage('debug', message, colors.cyan));
}

/**
 * Log warning messages (test warnings, non-critical issues)
 */
function logWarn(message) {
  console.warn(formatMessage('warn', message, colors.yellow));
}

/**
 * Log success messages (test successes)
 */
function logSuccess(message) {
  console.log(formatMessage('success', message, colors.green));
}

/**
 * Log data messages (structured data output)
 */
function logData(message) {
  console.log(formatMessage('data', message, colors.magenta));
}

/**
 * Log test section headers
 */
function logSection(message) {
  console.log(formatMessage('section', message, colors.bright));
}

/**
 * Log raw message without formatting (for special cases)
 */
function logRaw(message) {
  console.log(message);
}

/**
 * Log formatted message with custom formatting
 */
function logFormatted(message, color = null) {
  if (color && colors[color]) {
    console.log(`${colors[color]}${message}${colors.reset}`);
  } else {
    console.log(message);
  }
}

// Export functions for use in test scripts
export {
  logInfo,
  logError,
  logDebug,
  logWarn,
  logSuccess,
  logData,
  logSection,
  logRaw,
  logFormatted,
  colors
};

// Also export as CommonJS for compatibility
module.exports = {
  logInfo,
  logError,
  logDebug,
  logWarn,
  logSuccess,
  logData,
  logSection,
  logRaw,
  logFormatted,
  colors
};