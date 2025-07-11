# Initiative 14: ESLint Error Resolution Plan

## Objective

Fix all 34 ESLint issues (4 errors, 30 warnings) to achieve Grade A+ code quality standards with zero ESLint violations.

## Total Issues to Fix: 34

### Phase 1: Critical Errors (4 issues) - Build Blockers

#### 1. Fix Unused Variable in signals.repository.test.ts

**Location**: Line 263
**Error**: `'unorderedSignals' is assigned a value but never used`
**Solution**:

- Option A: Use the variable in an assertion to verify it was created correctly
- Option B: Prefix with underscore: `_unorderedSignals`
- Option C: Remove the variable if truly not needed
  **Recommended**: Option A - Add assertion to verify the unordered signals

#### 2. Fix Unused Parameter in signals.repository.test.ts

**Location**: Line 322
**Error**: `'id' is defined but never used`
**Solution**:

- Option A: Use the id parameter in the test
- Option B: Prefix with underscore: `_id`
- Option C: Remove the parameter if not needed
  **Recommended**: Option B - Prefix with underscore since it's likely a callback parameter

#### 3. Replace @ts-ignore with @ts-expect-error

**Location**: Line 373 in signals.repository.test.ts
**Error**: `Use "@ts-expect-error" instead of "@ts-ignore"`
**Solution**: Simple replacement: `// @ts-ignore` → `// @ts-expect-error`
**Note**: Verify the error is still present after replacement

#### 4. Remove Unused Import

**Location**: Line 3 in kismet.service.test.ts
**Error**: `'KismetDevice' is defined but never used`
**Solution**: Remove the unused import
**Action**: Delete `KismetDevice` from the import statement

### Phase 2: Type Safety Warnings (30 issues) - Grade A+ Requirements

#### hooks.server.ts (1 warning)

**Line 82**: Replace `any` with proper error type

```typescript
// Current: (error as any)[prop]
// Solution: Create proper type or use unknown with type guards
...Object.getOwnPropertyNames(error).reduce((acc, prop) => {
  if (!['name', 'message', 'stack'].includes(prop)) {
    acc[prop] = (error as Record<string, unknown>)[prop];
  }
  return acc;
}, {} as Record<string, unknown>)
```

#### hackrf.ts WebSocket Service (13 warnings)

**Strategy**: Create proper type definitions for WebSocket messages

1. **Lines 32-33**: Define message validation types

```typescript
interface MessageValidation {
	isValid: boolean;
	error?: string;
}

// Replace any with proper types
const validateMessage = (msg: unknown): msg is ValidMessage => {
	// Implementation
};
```

2. **Lines 42-46**: Create sweep data type guards

```typescript
interface SweepDataValidation {
	frequency_start?: unknown;
	frequency_end?: unknown;
	bin_count?: unknown;
	bins?: unknown;
	sample_rate?: unknown;
}

// Implement proper type checking
const isSweepData = (data: unknown): data is SweepData => {
	if (!data || typeof data !== 'object') return false;
	const d = data as SweepDataValidation;
	// Check each field with proper types
};
```

3. **Lines 55-57**: Device info type guards

```typescript
interface DeviceInfoValidation {
	serial?: unknown;
	version?: unknown;
	status?: unknown;
}

const isDeviceInfo = (info: unknown): info is DeviceInfo => {
	// Proper validation
};
```

4. **Lines 66-67, 75**: Status and error type guards

```typescript
const isStatusMessage = (msg: unknown): msg is StatusMessage => {
	// Implementation
};

const hasErrorProperty = (data: unknown): data is { error: string } => {
	// Implementation
};
```

#### signals.repository.test.ts (16 warnings)

**Strategy**: Replace `any` in test assertions with `unknown` and proper type assertions

1. **Pattern for all test expectations**:

```typescript
// Current pattern:
expect((error as any).code).toBe('SOMETHING');

// Replace with:
expect((error as unknown as { code: string }).code).toBe('SOMETHING');

// Or better, create error type:
interface DatabaseError extends Error {
	code: string;
}
expect((error as DatabaseError).code).toBe('SOMETHING');
```

2. **Create test-specific type utilities**:

```typescript
// In test file setup
type TestError = Error & { code: string };

const isTestError = (error: unknown): error is TestError => {
	return error instanceof Error && 'code' in error;
};
```

## Implementation Order

### Step 1: Fix Critical Errors (Priority: IMMEDIATE)

1. Fix unused variable (line 263)
2. Fix unused parameter (line 322)
3. Replace @ts-ignore (line 373)
4. Remove unused import (line 3)

### Step 2: Create Shared Type Utilities (Priority: HIGH)

1. Create `src/lib/types/validation.ts` for type guards
2. Create `src/lib/types/errors.ts` for error types
3. Create `tests/types/test-helpers.ts` for test-specific types

### Step 3: Fix Type Warnings by File (Priority: HIGH)

1. Fix hooks.server.ts (1 warning)
2. Fix hackrf.ts (13 warnings) - Most complex
3. Fix signals.repository.test.ts (16 warnings)

### Step 4: Verification (Priority: CRITICAL)

1. Run `npm run lint` to verify all issues fixed
2. Run `npm run typecheck` to ensure type safety
3. Run `npm test` to ensure no test breakage
4. Commit with passing pre-commit hooks

## Success Criteria

- [ ] All 4 ESLint errors resolved
- [ ] All 30 ESLint warnings resolved
- [ ] `npm run lint` passes with 0 errors, 0 warnings
- [ ] All tests still pass
- [ ] Pre-commit hooks pass without `--no-verify`
- [ ] Grade A+ code quality achieved

## Time Estimate

- Phase 1 (Errors): 15 minutes
- Phase 2 (Warnings): 45 minutes
- Verification: 10 minutes
- Total: ~70 minutes

## Grade A+ Standards

1. **Zero ESLint violations** - No errors or warnings
2. **Explicit typing** - No `any` types anywhere
3. **Type safety** - Proper type guards and validations
4. **Test quality** - Tests use proper type assertions
5. **Maintainability** - Clear, reusable type definitions
