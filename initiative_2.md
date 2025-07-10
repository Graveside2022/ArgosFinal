### INITIATIVE 2: CENTRALIZE AND STANDARDIZE LOGGING (AUDIT-DRIVEN REDESIGN)

- **Problem:** Despite previous documentation claiming logging was "COMPLETE", empirical analysis reveals 204 console.\* statements across 61 files in the src/ directory. This represents a critical procedural gap between documented completion and actual implementation state.
- **Solution:** Implement a comprehensive audit-driven approach with empirical validation, risk stratification, and explicit audit-to-implementation mapping to ensure complete console.\* statement elimination.
- **Key Risks Addressed:** Logging Status Contradiction, Service Layer Coupling, Empirical Validation Gap

## EMPIRICAL AUDIT RESULTS (2025-07-09)

**Console Statement Distribution:**

- **Total Files with console statements:** 61
- **Total console statements:** 204
- **Statement Type Breakdown:**
    - console.error: 115 statements (56.4%) - Critical error logging
    - console.warn: 56 statements (27.5%) - Warning conditions
    - console.info: 31 statements (15.2%) - Informational logging
    - console.log: 2 statements (1.0%) - Debug logging
    - console.debug: 0 statements (0%) - Debug logging

**Risk Stratification by File Density:**

- **HIGH RISK (≥10 statements):** 5 files, 67 statements (32.8%)
    - src/lib/services/websocket/test-connection.ts: 21 statements
    - src/lib/services/kismet/kismetService.ts: 13 statements
    - src/routes/api/kismet/devices/+server.ts: 12 statements
    - src/lib/services/websocket/base.ts: 12 statements
    - src/routes/api/hackrf/start-sweep/+server.ts: 10 statements

- **MEDIUM RISK (5-9 statements):** 7 files, 49 statements (24.0%)
    - src/lib/server/websocket-server.ts: 5 statements
    - src/lib/services/websocket/hackrf.ts: 5 statements
    - src/routes/api/hackrf/debug-start/+server.ts: 9 statements
    - src/routes/api/hackrf/test-sweep/+server.ts: 7 statements
    - src/routes/api/signals/+server.ts: 7 statements
    - src/routes/kismet/+page.svelte: 8 statements
    - src/routes/tactical-map-simple/+page.svelte: 8 statements

- **LOW RISK (1-4 statements):** 49 files, 88 statements (43.1%)

**Critical System Areas:**

- **API Routes:** 22 files, 87 statements (42.6%)
- **Services Layer:** 12 files, 68 statements (33.3%)
- **UI Components:** 8 files, 18 statements (8.8%)
- **Server Infrastructure:** 4 files, 11 statements (5.4%)
- **Utilities:** 15 files, 20 statements (9.8%)

**[ ] Task 2.1: Empirical Console Statement Audit (COMPLETED)** - **Status:** ✅ COMPLETED - Full empirical audit conducted - **Results:** 204 console statements across 61 files verified - **Risk Assessment:** Critical procedural gap identified - previous "COMPLETE" status was inaccurate - **Command Executed:** `rg "console\." src/ | wc -l` → 204 statements - **Validation:** Comprehensive risk stratification completed - **Audit File:** Detailed breakdown documented in this plan

## AUDIT-TO-IMPLEMENTATION MAPPING

**Phase 1: High-Risk File Remediation (Priority 1)**

- **Target:** 5 files with ≥10 console statements
- **Impact:** 67 statements (32.8% of total)
- **Validation:** Pre-replacement functional testing of each service
- **Implementation:** Structured logging with context preservation

**Phase 2: API Route Standardization (Priority 2)**

- **Target:** 22 API route files
- **Impact:** 87 statements (42.6% of total)
- **Validation:** API endpoint functionality testing
- **Implementation:** Consistent error handling with structured logging

**Phase 3: Service Layer Integration (Priority 3)**

- **Target:** 12 service files
- **Impact:** 68 statements (33.3% of total)
- **Validation:** Service integration testing
- **Implementation:** Centralized logging with service context

**Phase 4: UI Component Cleanup (Priority 4)**

- **Target:** 8 UI component files
- **Impact:** 18 statements (8.8% of total)
- **Validation:** Frontend error handling verification
- **Implementation:** Client-side structured logging

## PRE/POST VALIDATION PROCEDURES

**Pre-Implementation Validation:**

1. **Functional Baseline Testing**
    - Execute `npm test` to establish baseline functionality
    - Verify all API endpoints respond correctly (`npm run dev` + manual testing)
    - Confirm WebSocket connections function properly
    - Validate UI component error handling

2. **Console Statement Audit**
    - Run `rg "console\." src/ | wc -l` to confirm current count
    - Document current statement locations and types
    - Identify critical error paths that must be preserved

**Post-Implementation Validation:**

1. **Zero Console Statement Verification**
    - Run `rg "console\." src/ | wc -l` to confirm 0 statements
    - Verify no console statements remain in any src/ files
    - Confirm structured logging is properly implemented

2. **Functional Regression Testing**
    - Re-execute full test suite to ensure no functionality lost
    - Verify all error conditions still properly logged
    - Confirm log levels and formatting meet requirements

3. **Logging System Validation**
    - Verify structured logging captures all previous console output
    - Confirm log levels are properly configured
    - Validate log formatting and context preservation

**[ ] Task 2.2: High-Risk File Remediation (PRIORITY 1)** - **Status:** PENDING - Awaiting implementation - **Target Files:** 5 files with ≥10 console statements - **Pre-Validation:** - Test WebSocket connections work: `npm run dev` + WebSocket client test - Test Kismet service integration: API endpoints respond correctly - Test HackRF sweep functionality: Start/stop operations work - **Implementation Strategy:**
```typescript
// Before (src/lib/services/websocket/test-connection.ts):
console.error('WebSocket connection failed:', error);

      // After:
      import { createLogger } from '$lib/logger';
      const logger = createLogger('WebSocket');
      logger.error('WebSocket connection failed', { error: error.message });
      ```
    - **Rollback Procedure:** Keep original console statements in comments
    - **Post-Validation:** Verify WebSocket, Kismet, and HackRF services still function
    - **Success Metric:** 67 statements eliminated (32.8% reduction)
    - **Command:** `rg "console\." src/ | wc -l` (expect 137 remaining)

**[ ] Task 2.3: API Route Standardization (PRIORITY 2)** - **Status:** PENDING - Awaiting Task 2.2 completion - **Target Files:** 22 API route files - **Pre-Validation:** - Test all API endpoints return expected responses - Verify error handling doesn't break client applications - Confirm logging doesn't affect API performance - **Implementation Strategy:**
```typescript
// Before (src/routes/api/signals/+server.ts):
console.error('Database query failed:', error);

      // After:
      import { createLogger } from '$lib/logger';
      const logger = createLogger('SignalsAPI');
      logger.error('Database query failed', { error: error.message, query: 'signals' });
      ```
    - **Rollback Procedure:** API-specific rollback with endpoint testing
    - **Post-Validation:** Full API endpoint testing suite
    - **Success Metric:** 87 statements eliminated (42.6% reduction)
    - **Command:** `rg "console\." src/ | wc -l` (expect 50 remaining)

**[ ] Task 2.4: Service Layer Integration (PRIORITY 3)** - **Status:** PENDING - Awaiting Task 2.3 completion - **Target Files:** 12 service files - **Pre-Validation:** - Test service integration with dependent components - Verify service startup and shutdown procedures - Confirm logging doesn't affect service performance - **Implementation Strategy:**
```typescript
// Before (src/lib/services/streaming/dataStreamManager.ts):
console.warn('Stream buffer overflow detected');

      // After:
      import { createLogger } from '$lib/logger';
      const logger = createLogger('DataStream');
      logger.warn('Stream buffer overflow detected', { bufferSize: buffer.length });
      ```
    - **Rollback Procedure:** Service-specific rollback with integration testing
    - **Post-Validation:** Service integration testing
    - **Success Metric:** 68 statements eliminated (33.3% reduction)
    - **Command:** `rg "console\." src/ | wc -l` (expect 18 remaining)

**[ ] Task 2.5: UI Component Cleanup (PRIORITY 4)** - **Status:** PENDING - Awaiting Task 2.4 completion - **Target Files:** 8 UI component files - **Pre-Validation:** - Test UI error handling with user interactions - Verify client-side logging doesn't affect performance - Confirm error messages still reach users appropriately - **Implementation Strategy:**
```typescript
// Before (src/routes/tactical-map-simple/+page.svelte):
console.error('Failed to load map data:', error);

      // After:
      import { createLogger } from '$lib/logger';
      const logger = createLogger('TacticalMap');
      logger.error('Failed to load map data', { error: error.message });
      ```
    - **Rollback Procedure:** UI-specific rollback with user testing
    - **Post-Validation:** UI error handling verification
    - **Success Metric:** 18 statements eliminated (8.8% reduction)
    - **Command:** `rg "console\." src/ | wc -l` (expect 0 remaining)

**[ ] Task 2.6: Final Validation and Documentation (PRIORITY 5)** - **Status:** PENDING - Awaiting all previous tasks - **Pre-Validation:** Complete system functionality testing - **Implementation:** Final audit and documentation update - **Validation Commands:** - `rg "console\." src/ | wc -l` (must return 0) - `npm run build` (must succeed) - `npm run lint` (must pass) - `npm run typecheck` (must pass) - `npm test` (must pass) - **Post-Validation:** Zero console statement verification - **Success Metric:** 0 remaining console statements (100% elimination) - **Documentation:** Update SESSION_CONTINUITY.md with completion status
