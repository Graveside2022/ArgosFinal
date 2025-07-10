# Initiative 10: TypeScript Error Audit and Remediation Plan (Part 2)

This document lists TypeScript errors 26 through 50 found in the codebase as of 2025-07-10, along with their recommended professional-grade A+ solutions.

---

## TypeScript Compiler Errors (`tsc`) and Recommended Solutions (26-50)

---

### File: `tests/helpers/visual-helpers.ts`

26. **Error (L3:C21 & L4:C37):** `Could not find a declaration file for module 'pngjs'.`
    *   **Analysis:** The `pngjs` library is written in JavaScript and does not have built-in TypeScript types.
    *   **A+ Solution:** Install the community-provided type definitions for `pngjs`.
        ```bash
        npm install --save-dev @types/pngjs
        ```

27. **Error (L246:C7):** `Expected 1-2 arguments, but got 3.`
    *   **Analysis:** A function is being called with too many arguments.
    *   **A+ Solution:** Correct the function call to match its signature. If the third argument is a new requirement, update the function definition to accept it.

---

### File: `tests/integration/api.test.ts`

28. **Error (L143:C20):** `Argument of type '(device: Record<string, unknown>) => void' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => void'.`
    *   **Analysis:** The `forEach` method on an array of `unknown` provides `unknown` to its callback. The test is incorrectly assuming the element is a `Record<string, unknown>`.
    *   **A+ Solution:** First, assert that the response is an array. Then, use a type guard within the `forEach` callback to ensure each element is an object before accessing its properties.
        ```typescript
        expect(Array.isArray(body.devices)).toBe(true);
        body.devices.forEach((device: unknown) => {
            expect(typeof device).toBe('object');
            expect(device).not.toBeNull();
            expect(device).toHaveProperty('mac');
        });
        ```

---

### File: `tests/integration/app.test.ts`

29. **Error (L2:C20 & L2:C29):** `'Browser' is a type and must be imported using a type-only import...`
    *   **Analysis:** The `verbatimModuleSyntax` compiler option requires that imports used only as types be explicitly marked as such.
    *   **A+ Solution:** Use the `import type` syntax for type-only imports.
        ```typescript
        // BEFORE
        import { test, expect, Browser, Page } from '@playwright/test';

        // AFTER
        import { test, expect } from '@playwright/test';
        import type { Browser, Page } from '@playwright/test';
        ```

---

### File: `tests/integration/websocket.test.ts`

30. **Error (L18:C7, L23:C7, etc.):** `Type 'WebSocket' is missing the following properties from type 'WebSocket': isPaused, ping, pong...`
    *   **Analysis:** There is a type mismatch. The test is likely using the browser's `WebSocket` type, but the test environment (Node.js) is expecting the `ws` library's `WebSocket` type, which has more methods.
    *   **A+ Solution:** Ensure the correct `WebSocket` type is imported from the `ws` library for the test environment.
        ```typescript
        import { WebSocket } from 'ws'; // Use the Node.js WebSocket type
        import { vi } from 'vitest';

        // Mock the 'ws' library
        vi.mock('ws', () => {
            // ... mock implementation
        });
        ```

31. **Error (L19:C14, L34:C7, etc.):** `'ws' is possibly 'null'.`
    *   **Analysis:** The `ws` variable is initialized to `null` and accessed without being checked, typically in an `afterEach` or `afterAll` block.
    *   **A+ Solution:** Add a null check before attempting to close the WebSocket connection.
        ```typescript
        afterEach(() => {
            if (ws?.readyState === WebSocket.OPEN) {
                ws.close();
            }
            ws = null;
        });
        ```

---

### File: `tests/load/dataVolumes.test.ts`

32. **Error (L82:C32):** `Conversion of type 'Signal' to type 'SignalMarker' may be a mistake...`
    *   **Analysis:** The `Signal` and `SignalMarker` types are incompatible. The code is trying to assert a type instead of transforming the data.
    *   **A+ Solution:** Create a dedicated mapping function to transform a `Signal` object into a `SignalMarker` object, ensuring all required properties are correctly populated.
        ```typescript
        function toSignalMarker(signal: Signal): SignalMarker {
            return {
                lat: signal.latitude,
                lon: signal.longitude,
                power: signal.power,
                source: signal.source,
                // ... other properties
            };
        }

        const marker = toSignalMarker(signal as Signal);
        ```

33. **Error (L203:C19, L204:C19, etc.):** `Property '...' does not exist on type 'PerformanceReport'.`
    *   **Analysis:** The `PerformanceReport` type is missing several properties that the test is trying to access.
    *   **A+ Solution:** Update the `PerformanceReport` interface to include all the expected properties.
        ```typescript
        interface PerformanceReport {
            // ... existing properties
            avgResponseTime: number;
            peakMemoryUsage: number;
            errorRate: number;
        }
        ```

34. **Error (L269:C22 & L270:C19):** `Conversion of type 'PerformanceReport' to type '{...}' may be a mistake...`
    *   **Analysis:** The test is trying to assert that the `PerformanceReport` object has methods (`avgMetric`, `maxMetric`) that it does not.
    *   **A+ Solution:** Refactor the test to calculate these metrics from the `PerformanceReport` data rather than assuming they exist as methods on the object.

---

### File: `tests/performance/benchmarks.test.ts`

35. **Error (L105:C15 & L167:C15):** `Conversion of type 'WebSocket' to type 'import("...").default' may be a mistake...`
    *   **Analysis:** This is another instance of a type mismatch between the browser `WebSocket` and the Node.js `ws` `WebSocket`.
    *   **A+ Solution:** Explicitly import and use the `WebSocket` type from the `ws` package throughout the test file.
        ```typescript
        import WebSocket from 'ws';
        // ...
        const ws: WebSocket = new WebSocket('ws://localhost:8080');
        ```

---

### File: `tests/services/map/signalClustering.test.ts`

36. **Error (L117:C46, L147:C35, etc.):** `Argument of type '{...}' is not assignable to parameter of type 'SignalCluster'.`
    *   **Analysis:** An object is being created that does not match the `SignalCluster` interface; specifically, it is missing `lat` and `lon`.
    *   **A+ Solution:** Ensure that when the test data object is created, it includes all properties required by the `SignalCluster` interface.
        ```typescript
        const mockCluster: SignalCluster = {
            id: 'cluster1',
            lat: 40.7128, // Add missing property
            lon: -74.0060, // Add missing property
            position: { lat: 40.7128, lon: -74.0060 },
            // ... rest of the properties
        };
        ```

---

### File: `tests/setup.ts`

37. **Error (L30:C1):** `Type 'CanvasRenderingContext2D | null' is not assignable to type '{...}'`
    *   **Analysis:** The mock for `getContext` is returning a simple value, but the actual type is a complex overloaded function.
    *   **A+ Solution:** Improve the mock to more accurately represent the overloaded nature of the `getContext` function.
        ```typescript
        global.HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
            if (contextId === '2d') {
                // Return a mock 2D context object
                return {
                    fillRect: vi.fn(),
                    // ... other mocked 2d context methods
                };
            }
            return null;
        }) as any; // Use 'as any' to bypass complex overload issues in test setup
        ```

---

### File: `tests/unit/components.test.ts`

38. **Error (L199:C32):** `'devices' is referenced directly or indirectly in its own type annotation.`
    *   **Analysis:** This is a circular reference where a variable's type annotation refers to the variable itself.
    *   **A+ Solution:** Break the circular reference by defining the type separately before using it in the variable annotation.
        ```typescript
        // Define the type of the component's props first
        type DeviceListProps = { devices: any[] };

        // Now render the component with correctly typed props
        const { getByText } = render<DeviceListProps>(DeviceList, {
            props: { devices: mockDevices }
        });
        ```

---

### File: `tests/unit/services/map/signalClustering.test.ts`

39. **Error (L3:C50):** `Cannot find module '$lib/types/signals' or its corresponding type declarations.`
    *   **Analysis:** The test file is trying to import a module using a SvelteKit path alias (`$lib`), but the test environment (Vitest) is not configured to resolve these aliases.
    *   **A+ Solution:** Configure Vitest to resolve SvelteKit path aliases by updating the `vitest.config.ts` file.
        ```typescript
        // in vitest.config.ts
        import { defineConfig } from 'vitest/config';
        import { svelte } from '@sveltejs/vite-plugin-svelte';
        import path from 'path';

        export default defineConfig({
            plugins: [svelte({ hot: !process.env.VITEST })],
            test: {
                environment: 'jsdom',
            },
            resolve: {
                alias: {
                    $lib: path.resolve(__dirname, './src/lib')
                }
            }
        });
        ```

---

### File: `tests/utils/testDataGenerator.ts`

40. **Error (L148:C11):** `Object literal may only specify known properties, but 'altitude' does not exist in type 'DroneSignal'. Did you mean to write 'latitude'?`
    *   **Analysis:** The code is trying to assign a property `altitude` that is not defined in the `DroneSignal` type. The compiler helpfully suggests `latitude` as a possible typo.
    *   **A+ Solution:** Correct the typo from `altitude` to `latitude` to match the `DroneSignal` interface definition.
        ```typescript
        // BEFORE
        altitude: 34.0522,

        // AFTER
        latitude: 34.0522,
        ```

---

### File: `tests/visual/visual-regression.test.ts`

41. **Error (L4:C21):** `Could not find a declaration file for module 'pngjs'.`
    *   **Analysis:** Same as the error in `visual-helpers.ts`. The type definitions are missing.
    *   **A+ Solution:** Ensure `@types/pngjs` is installed as a dev dependency.
        ```bash
        npm install --save-dev @types/pngjs
        ```

42. **Error (L73:C29):** `No overload matches this call.`
    *   **Analysis:** The `screenshot` method in Playwright is being called with an invalid `path` option. The type expects a path ending in a specific image extension.
    *   **A+ Solution:** Ensure the `path` provided to the `screenshot` function is a valid file path with a `.png`, `.jpg`, or `.webp` extension.
        ```typescript
        // BEFORE
        await page.screenshot({ path: 'my-screenshot' });

        // AFTER
        await page.screenshot({ path: `path/to/my-screenshot.png` });
        ```
