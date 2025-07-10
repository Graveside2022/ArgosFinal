# Initiative 12: TypeScript Error Audit and Remediation Plan (Part 4)

This document lists the final 26 TypeScript errors (76 through 101) found in the codebase as of 2025-07-10, along with their recommended professional-grade A+ solutions.

---

## TypeScript Compiler Errors (`tsc`) and Recommended Solutions (76-101)

---

### File: `tests/unit/services/map/signalClustering.test.ts`

76. **Error (L3:C50):** `Cannot find module '$lib/types/signals' or its corresponding type declarations.`
    *   **Analysis:** The test environment (Vitest) is not configured to resolve SvelteKit's `$lib` path alias.
    *   **A+ Solution:** Configure path aliases in `vitest.config.ts` to mirror the SvelteKit configuration.
        ```typescript
        // in vitest.config.ts
        import { defineConfig } from 'vitest/config';
        import path from 'path';

        export default defineConfig({
            // ... other config
            resolve: {
                alias: {
                    $lib: path.resolve(__dirname, './src/lib')
                }
            }
        });
        ```

---

### File: `tests/utils/testDataGenerator.ts`

77. **Error (L148:C11):** `Object literal may only specify known properties, but 'altitude' does not exist in type 'DroneSignal'. Did you mean to write 'latitude'?`
    *   **Analysis:** A typo exists in the property name (`altitude` instead of `latitude`).
    *   **A+ Solution:** Correct the property name to `latitude` to match the `DroneSignal` interface.

---

### File: `tests/visual/visual-regression.test.ts`

78. **Error (L4:C21):** `Could not find a declaration file for module 'pngjs'.`
    *   **Analysis:** Missing type definitions for the `pngjs` library.
    *   **A+ Solution:** Install the type definitions from DefinitelyTyped.
        ```bash
        npm install --save-dev @types/pngjs
        ```

79. **Error (L73:C29):** `No overload matches this call.`
    *   **Analysis:** The `path` option for Playwright's `screenshot` method requires a valid image file extension.
    *   **A+ Solution:** Append `.png` or another valid extension to the screenshot path.
        ```typescript
        await page.screenshot({ path: `path/to/screenshot.png` });
        ```

---
### Remaining Errors (Consolidated)

The following errors are duplicates of issues already analyzed, primarily stemming from the `tests/integration/websocket.test.ts` file. The solutions are the same as those prescribed for errors #30 and #31.

*   **Analysis:** The core issues are a type mismatch between the browser's `WebSocket` and the `ws` library's `WebSocket`, and a failure to check for `null` before accessing the `ws` variable in test teardown hooks.
*   **A+ Solution:**
    1.  Consistently import `WebSocket` from the `ws` library in all Node.js test files.
    2.  Use optional chaining (`ws?.close()`) or an if-block (`if (ws) { ... }`) in `afterEach`/`afterAll` hooks to prevent runtime errors when the WebSocket connection was never established.

80. **Error:** `tests/integration/websocket.test.ts(42,7): error TS2740: Type 'WebSocket' is missing properties...`
81. **Error:** `tests/integration/websocket.test.ts(49,7): error TS18047: 'ws' is possibly 'null'.`
82. **Error:** `tests/integration/websocket.test.ts(64,7): error TS2740: Type 'WebSocket' is missing properties...`
83. **Error:** `tests/integration/websocket.test.ts(67,7): error TS18047: 'ws' is possibly 'null'.`
84. **Error:** `tests/integration/websocket.test.ts(73,7): error TS2740: Type 'WebSocket' is missing properties...`
85. **Error:** `tests/integration/websocket.test.ts(74,14): error TS18047: 'ws' is possibly 'null'.`
86. **Error:** `tests/integration/websocket.test.ts(83,7): error TS2740: Type 'WebSocket' is missing properties...`
87. **Error:** `tests/integration/websocket.test.ts(96,7): error TS18047: 'ws' is possibly 'null'.`
88. **Error:** `tests/integration/websocket.test.ts(108,7): error TS2740: Type 'WebSocket' is missing properties...`
89. **Error:** `tests/integration/websocket.test.ts(120,7): error TS18047: 'ws' is possibly 'null'.`
90. **Error:** `tests/integration/websocket.test.ts(129,7): error TS2740: Type 'WebSocket' is missing properties...`
91. **Error:** `tests/integration/websocket.test.ts(134,7): error TS18047: 'ws' is possibly 'null'.`
92. **Error:** `tests/integration/websocket.test.ts(140,9): error TS18047: 'ws' is possibly 'null'.`
93. **Error:** `tests/integration/websocket.test.ts(170,7): error TS2740: Type 'WebSocket' is missing properties...`
94. **Error:** `tests/integration/websocket.test.ts(183,7): error TS18047: 'ws' is possibly 'null'.`
95. **Error:** `tests/integration/websocket.test.ts(191,7): error TS2740: Type 'WebSocket' is missing properties...`
96. **Error:** `tests/integration/websocket.test.ts(194,7): error TS18047: 'ws' is possibly 'null'.`
97. **Error:** `tests/integration/websocket.test.ts(200,14): error TS18047: 'ws' is possibly 'null'.`
98. **Error:** `tests/integration/websocket.test.ts(213,7): error TS18047: 'ws' is possibly 'null'.`
99. **Error:** `src/lib/services/db/dataAccessLayer.ts(325,81): error TS2339: Property 'type' does not exist...` (Duplicate of #1)
100. **Error:** `src/lib/services/db/signalDatabase.ts(488,56): error TS2339: Property 'type' does not exist...` (Duplicate of #2)
101. **Error:** `src/lib/services/kismet/kismetService.ts(230,4): error TS2578: Unused '@ts-expect-error' directive.` (Duplicate of #4)
