# Console.log Audit Report

## Executive Summary

This report catalogs all remaining console.log statements in the ArgosFinal codebase. A total of **95 files** contain console statements, with an estimated **400+ individual console calls** across the project.

## Categories and Replacement Strategy

### 1. ERROR LEVEL (High Priority)

**Purpose**: Critical system errors, failures, exceptions
**Replacement**: `logError()` from logger.ts
**Rate limiting**: Use rateKey for repeated errors

#### Key Files:

- `src/lib/server/hackrf/sweepManager.ts` - Hardware failures, USB errors
- `src/lib/server/db/database.ts` - Database connection errors
- `src/lib/services/recovery/errorRecovery.ts` - Recovery failures
- `src/routes/api/*/+server.ts` - API endpoint errors

### 2. WARN LEVEL (Medium Priority)

**Purpose**: Warnings, fallbacks, deprecated usage
**Replacement**: `logWarn()` from logger.ts
**Rate limiting**: Recommended for repeated warnings

#### Key Files:

- `src/hooks.server.ts` - WebSocket connection warnings
- `src/lib/services/map/signalInterpolation.ts` - Worker fallback warnings
- `src/routes/tactical-map-simple/+page.svelte` - UI state warnings

### 3. INFO LEVEL (Medium Priority)

**Purpose**: System status, lifecycle events, user actions
**Replacement**: `logInfo()` from logger.ts
**Rate limiting**: For frequent operations

#### Key Files:

- `src/lib/services/serviceInitializer.ts` - Service startup/shutdown
- `src/lib/server/db/cleanupService.ts` - Cleanup operations
- `src/lib/server/websocket-server.ts` - Connection events

### 4. DEBUG LEVEL (Low Priority)

**Purpose**: Development debugging, detailed tracing
**Replacement**: `logDebug()` from logger.ts
**Rate limiting**: Essential for verbose operations

#### Key Files:

- `src/routes/hackrfsweep/+page.svelte` - UI state debugging
- `src/lib/server/hackrf/sweepManager.ts` - Process monitoring
- Test files and scripts

## Detailed File Analysis

### Critical Infrastructure Files

#### src/lib/server/hackrf/sweepManager.ts

- **Line Count**: 50+ console statements
- **Types**: Mostly error/warn (hardware failures, USB errors)
- **Priority**: HIGH - Critical system operations
- **Replacement Strategy**:
    ```typescript
    // Replace: console.error('❌ USB/Device error detected:', message);
    // With: logError('USB/Device error detected', { message, deviceState }, 'usb-error');
    ```

#### src/lib/server/db/database.ts

- **Line Count**: 15+ console statements
- **Types**: Mixed error/warn/info (schema loading, migrations)
- **Priority**: HIGH - Database operations
- **Replacement Strategy**:
    ```typescript
    // Replace: console.error('Failed to load schema, using embedded version:', error);
    // With: logError('Failed to load schema, using embedded version', { error }, 'schema-load');
    ```

#### src/lib/services/serviceInitializer.ts

- **Line Count**: 20+ console statements
- **Types**: Mostly info (service lifecycle)
- **Priority**: MEDIUM - Service management
- **Replacement Strategy**:
    ```typescript
    // Replace: console.log('✅ All services initialized successfully');
    // With: logInfo('All services initialized successfully');
    ```

### Frontend Components

#### src/routes/hackrfsweep/+page.svelte

- **Line Count**: 30+ console statements
- **Types**: Mixed debug/info/error (UI state, user actions)
- **Priority**: MEDIUM - User interface
- **Replacement Strategy**:
    ```typescript
    // Replace: console.log('Starting sweep with frequencies:', validFreqs);
    // With: logInfo('Starting sweep with frequencies', { validFreqs });
    ```

#### src/routes/tactical-map-simple/+page.svelte

- **Line Count**: 15+ console statements
- **Types**: Mixed warn/error/info (GPS, HackRF operations)
- **Priority**: MEDIUM - Main tactical interface
- **Replacement Strategy**:
    ```typescript
    // Replace: console.warn('Searching for signals near', targetFrequency, 'MHz');
    // With: logWarn('Searching for signals near frequency', { targetFrequency });
    ```

### API Endpoints

#### src/routes/api/hackrf/\*/+server.ts

- **Line Count**: 20+ console statements across multiple files
- **Types**: Mixed error/info (API responses, validation)
- **Priority**: MEDIUM - API operations
- **Replacement Strategy**:
    ```typescript
    // Replace: console.error('Failed to start sweep:', error);
    // With: logError('Failed to start sweep', { error }, 'api-sweep-start');
    ```

### Testing and Scripts

#### scripts/ directory

- **Line Count**: 100+ console statements
- **Types**: Mixed info/warn/error (test results, validation)
- **Priority**: LOW - Development/testing tools
- **Replacement Strategy**: Keep as console.log for script output

#### test-\*.js files

- **Line Count**: 50+ console statements
- **Types**: Mixed debug/info/error (test execution)
- **Priority**: LOW - Test utilities
- **Replacement Strategy**: Keep as console.log for test output

## Implementation Strategy

### Phase 1: Critical Infrastructure (Priority: HIGH)

1. **sweepManager.ts** - Replace all hardware error logging
2. **database.ts** - Replace all database error logging
3. **serviceInitializer.ts** - Replace service lifecycle logging

### Phase 2: API Endpoints (Priority: MEDIUM)

1. **hackrf API routes** - Replace endpoint error logging
2. **kismet API routes** - Replace proxy error logging
3. **system API routes** - Replace system info logging

### Phase 3: Frontend Components (Priority: MEDIUM)

1. **hackrfsweep page** - Replace UI state logging
2. **tactical-map-simple** - Replace operational logging
3. **kismet components** - Replace service control logging

### Phase 4: Development Tools (Priority: LOW)

1. **Test scripts** - Evaluate if logger is appropriate
2. **Validation scripts** - Keep console for script output
3. **Debug utilities** - Convert development logging

## Logger Import Pattern

All files should import the logger utilities:

```typescript
import { logError, logWarn, logInfo, logDebug } from '$lib/utils/logger';
```

## Rate Limiting Strategy

For frequently called operations, use rate limiting:

```typescript
// High-frequency operations
logDebug('Processing data point', { frequency, power }, 'data-processing');

// Error conditions that might repeat
logError('Device communication failed', { error }, 'device-comm');

// Status updates
logInfo('Service status changed', { service, status }, 'service-status');
```

## Exclusions

The following files should retain console.log statements:

- `/scripts/` directory - Build and validation scripts
- `/test-*.js` files - Test utilities
- `src/lib/utils/logger.ts` - Logger implementation itself (lines 146, 149, 152, 156)

## Verification

After implementation, verify console statement removal:

```bash
rg "console\.(log|info|warn|error|debug)" --type ts --type js --type-add 'svelte:*.svelte' --type svelte
```

Expected result: Only logger.ts internal console calls and script files should remain.

## Summary Statistics

- **Total Files**: 95
- **Estimated Console Calls**: 400+
- **High Priority Files**: 15
- **Medium Priority Files**: 40
- **Low Priority Files**: 40
- **Files to Exclude**: 10

This audit provides a comprehensive roadmap for transitioning from console.log to structured logging throughout the ArgosFinal codebase.
