# Initiative 14: ESLint Error Resolution

## Overview

This document captures all ESLint errors and warnings that need to be addressed for Grade A+ code quality standards.

## ESLint Errors (4 total)

### Error 1: Unused variable in test file

**File**: `/home/pi/projects/ArgosFinal/tests/unit/server/database/signals.repository.test.ts`
**Line**: 263
**Error**: `'unorderedSignals' is assigned a value but never used. Allowed unused vars must match /^_/u`
**Rule**: `@typescript-eslint/no-unused-vars`

### Error 2: Unused parameter in test file

**File**: `/home/pi/projects/ArgosFinal/tests/unit/server/database/signals.repository.test.ts`
**Line**: 322
**Error**: `'id' is defined but never used. Allowed unused args must match /^_/u`
**Rule**: `@typescript-eslint/no-unused-vars`

### Error 3: Use of @ts-ignore instead of @ts-expect-error

**File**: `/home/pi/projects/ArgosFinal/tests/unit/server/database/signals.repository.test.ts`
**Line**: 373
**Error**: `Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free`
**Rule**: `@typescript-eslint/ban-ts-comment`

### Error 4: Unused import in test file

**File**: `/home/pi/projects/ArgosFinal/tests/unit/server/services/kismet.service.test.ts`
**Line**: 3
**Error**: `'KismetDevice' is defined but never used. Allowed unused vars must match /^_/u`
**Rule**: `@typescript-eslint/no-unused-vars`

## ESLint Warnings (30 total)

### Warnings in hooks.server.ts (1 warning)

**File**: `/home/pi/projects/ArgosFinal/src/hooks.server.ts`

- Line 82: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)

### Warnings in hackrf.ts WebSocket service (13 warnings)

**File**: `/home/pi/projects/ArgosFinal/src/lib/services/websocket/hackrf.ts`

- Line 32: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 33: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 42: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 43: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 44: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 45: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 46: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 55: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 56: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 57: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 66: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 67: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 75: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)

### Warnings in signals.repository.test.ts (16 warnings)

**File**: `/home/pi/projects/ArgosFinal/tests/unit/server/database/signals.repository.test.ts`

- Line 62: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 77: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 94: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 117: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 133: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 150: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 168: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 184: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 201: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 222: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 236: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 251: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 275: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 306: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 327: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Line 361: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)

## Summary

**Total Issues**: 34

- **Errors**: 4 (must be fixed for build to pass)
- **Warnings**: 30 (should be fixed for Grade A+ quality)

## Priority Order

1. **Critical Errors** (blocking build):
    - Unused variables/parameters
    - @ts-ignore usage
    - Unused imports

2. **Quality Warnings** (for Grade A+ standard):
    - Replace all `any` types with proper type definitions
    - Ensure all type safety measures are in place

## Grade A+ Requirements

For Grade A+ quality, all ESLint errors and warnings must be resolved:

- No unused variables or imports
- No `any` types - all types must be explicitly defined
- Use `@ts-expect-error` instead of `@ts-ignore`
- Follow all TypeScript strict mode requirements
