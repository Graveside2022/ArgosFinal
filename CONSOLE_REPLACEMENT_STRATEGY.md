# Console.log Replacement Strategy

## Overview

This document provides a concrete implementation plan for replacing all console.log statements with structured logging using `/home/pi/projects/ArgosFinal/src/lib/utils/logger.ts`.

## Logger Usage Patterns

### Import Statement

```typescript
import { logError, logWarn, logInfo, logDebug } from '$lib/utils/logger';
```

### Replacement Patterns

#### 1. Simple Message Replacement

```typescript
// Before
console.log('Starting sweep process');

// After
logInfo('Starting sweep process');
```

#### 2. Message with Context

```typescript
// Before
console.log('Sweep started with frequencies:', validFreqs);

// After
logInfo('Sweep started with frequencies', { validFreqs });
```

#### 3. Error with Context

```typescript
// Before
console.error('Failed to start sweep:', error);

// After
logError('Failed to start sweep', { error }, 'sweep-start');
```

#### 4. Rate Limited Logging

```typescript
// Before (in loops or frequent operations)
console.log('Processing data point:', frequency, power);

// After
logDebug('Processing data point', { frequency, power }, 'data-processing');
```

## Priority-Based Implementation Plan

### PHASE 1: Critical Infrastructure (Immediate)

#### 1.1 sweepManager.ts (50+ statements)

**File**: `src/lib/server/hackrf/sweepManager.ts`
**Priority**: CRITICAL - Hardware control
**Key Replacements**:

- Line 486: `console.error('Emergency kill failed:', e);` → `logError('Emergency kill failed', { error: e }, 'emergency-kill');`
- Line 681: `console.error('❌ Too many buffer overflows...');` → `logError('Too many buffer overflows, process may be outputting too fast', null, 'buffer-overflow');`
- Line 715: `console.error('❌ USB/Device error detected:', message);` → `logError('USB/Device error detected', { message }, 'usb-error');`

#### 1.2 database.ts (15+ statements)

**File**: `src/lib/server/db/database.ts`
**Priority**: CRITICAL - Data persistence
**Key Replacements**:

- Line 97: `console.error('Failed to load schema, using embedded version:', error);` → `logError('Failed to load schema, using embedded version', { error }, 'schema-load');`
- Line 257: `console.error('Failed to insert signal ${signal.signal_id}:', error.message);` → `logError('Failed to insert signal', { signalId: signal.signal_id, error: error.message }, 'signal-insert');`

#### 1.3 serviceInitializer.ts (20+ statements)

**File**: `src/lib/services/serviceInitializer.ts`
**Priority**: HIGH - Service management
**Key Replacements**:

- Line 50: `console.log('  • Initializing system health monitor...');` → `logInfo('Initializing system health monitor');`
- Line 73: `console.log('✅ All services initialized successfully');` → `logInfo('All services initialized successfully');`

### PHASE 2: API Endpoints (High Priority)

#### 2.1 HackRF API Routes

**Files**: `src/routes/api/hackrf/*/+server.ts`
**Priority**: HIGH - API reliability
**Pattern**: Replace all error logging with `logError()` and info logging with `logInfo()`

#### 2.2 System API Routes

**Files**: `src/routes/api/system/*/+server.ts`
**Priority**: HIGH - System monitoring
**Pattern**: Replace all monitoring logs with appropriate levels

### PHASE 3: Frontend Components (Medium Priority)

#### 3.1 hackrfsweep page (30+ statements)

**File**: `src/routes/hackrfsweep/+page.svelte`
**Priority**: MEDIUM - User interface
**Key Replacements**:

- Line 54: `console.log('Starting sweep with frequencies:', validFreqs);` → `logInfo('Starting sweep with frequencies', { validFreqs });`
- Line 291: `console.log('=== SWEEP STATUS UPDATE ===');` → `logDebug('Sweep status update', { status: $sweepStatus });`

#### 3.2 tactical-map-simple (15+ statements)

**File**: `src/routes/tactical-map-simple/+page.svelte`
**Priority**: MEDIUM - Main interface
**Key Replacements**:

- Line 174: `console.warn('Searching for signals near ${targetFrequency} MHz');` → `logWarn('Searching for signals near frequency', { targetFrequency });`

### PHASE 4: Development Tools (Low Priority)

#### 4.1 Test Scripts

**Files**: `scripts/testing/*.js`
**Priority**: LOW - Development tools
**Decision**: Keep console.log for test output

#### 4.2 Validation Scripts

**Files**: `scripts/*.js`
**Priority**: LOW - Build tools
**Decision**: Keep console.log for script output

## Implementation Checklist

### Pre-Implementation

- [ ] Verify logger.ts is properly configured
- [ ] Confirm logger import paths work from all locations
- [ ] Test logger functionality in development environment

### Phase 1 Implementation

- [ ] Replace all console statements in sweepManager.ts
- [ ] Replace all console statements in database.ts
- [ ] Replace all console statements in serviceInitializer.ts
- [ ] Test critical system functionality

### Phase 2 Implementation

- [ ] Replace console statements in HackRF API routes
- [ ] Replace console statements in Kismet API routes
- [ ] Replace console statements in System API routes
- [ ] Test API endpoint functionality

### Phase 3 Implementation

- [ ] Replace console statements in hackrfsweep page
- [ ] Replace console statements in tactical-map-simple
- [ ] Replace console statements in Kismet components
- [ ] Test UI functionality

### Phase 4 Implementation

- [ ] Evaluate test scripts for logger usage
- [ ] Keep validation scripts as console.log
- [ ] Update any development utilities

### Post-Implementation

- [ ] Run verification: `rg "console\.(log|info|warn|error|debug)" --type ts --type js --type-add 'svelte:*.svelte' --type svelte`
- [ ] Expected result: Only logger.ts internal calls and script files
- [ ] Test logging output in development and production
- [ ] Verify rate limiting works for high-frequency operations
- [ ] Update documentation

## Special Considerations

### Rate Limiting Keys

Use descriptive rate limiting keys for frequent operations:

- `'data-processing'` - For spectrum data processing
- `'device-comm'` - For device communication errors
- `'service-status'` - For service status changes
- `'usb-error'` - For USB device errors
- `'api-request'` - For API request logging

### Context Objects

Provide meaningful context objects:

```typescript
// Good context
logError(
	'Database connection failed',
	{
		host: dbConfig.host,
		port: dbConfig.port,
		error: error.message,
		timestamp: new Date().toISOString()
	},
	'db-connection'
);

// Poor context
logError('Database error', { error }, 'db-error');
```

### Development vs Production

The logger automatically adjusts verbosity based on NODE_ENV:

- **Development**: Shows all log levels including debug
- **Production**: Shows only WARN and ERROR levels by default

### Memory Management

The logger uses a circular buffer (1000 entries) to prevent memory issues from excessive logging.

## Verification Commands

After each phase, verify progress:

```bash
# Count remaining console statements
rg -c "console\.(log|info|warn|error|debug)" --type ts --type js --type-add 'svelte:*.svelte' --type svelte | grep -v node_modules | wc -l

# List files with remaining statements
rg -l "console\.(log|info|warn|error|debug)" --type ts --type js --type-add 'svelte:*.svelte' --type svelte | grep -v node_modules

# Check specific file
rg -n "console\.(log|info|warn|error|debug)" src/lib/server/hackrf/sweepManager.ts
```

## Success Criteria

Implementation is complete when:

1. All infrastructure files use structured logging
2. All API endpoints use structured logging
3. All UI components use structured logging
4. Only logger.ts and script files contain console statements
5. All tests pass with new logging system
6. Production logging works correctly
7. Rate limiting prevents log spam

This strategy provides a systematic approach to replacing all console.log statements with the structured logging system while maintaining system functionality and improving observability.
