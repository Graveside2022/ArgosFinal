# Initiative 9: TypeScript Error Audit and Remediation Plan (Part 1)

This document lists the first 25 TypeScript errors found in the codebase as of 2025-07-10, along with their recommended professional-grade A+ solutions.

---

## TypeScript Compiler Errors (`tsc`) and Recommended Solutions (1-25)

---

### File: `src/lib/services/db/dataAccessLayer.ts`

1.  **Error (L325:C50 & L325:C81):** `Property 'type' does not exist on type '{...}'`
    *   **Analysis:** The code is attempting to access a `type` property on an object whose inferred type does not include it. This indicates a mismatch between the expected data structure and the actual type definition.
    *   **A+ Solution:** Define a clear, explicit interface for the `device` object that includes the `type` property and apply it where the object is created or passed. This enforces a strict contract for the data structure.
        ```typescript
        // 1. Define a strict interface for the device object
        interface DeviceInfo {
          ssid?: string;
          mac?: string;
          channel?: number;
          encryption?: string;
          vendor?: string;
          signalType?: string;
          bandwidth?: number;
          modulation?: string;
          velocity?: { /* ... */ };
          flightPath?: { /* ... */ }[];
          type?: string; // Add the missing property
        }

        // 2. Apply this interface where the object is handled
        const devices: DeviceInfo[] = await this.getDevices(filter);
        if (devices.some(device => device.type === 'drone')) {
            // ...
        }
        ```

---

### File: `src/lib/services/db/signalDatabase.ts`

2.  **Error (L481:C30 & L488:C56):** `Property 'type' does not exist on type '{...}'`
    *   **Analysis:** Similar to the previous error, this is due to an incomplete type definition for a `device` object.
    *   **A+ Solution:** Reuse or create a comprehensive `Device` interface that accurately models the database schema or API response. Ensure this interface is imported and used consistently.
        ```typescript
        // Import a standardized Device interface
        import type { Device } from '$lib/types/devices';

        // Apply the type to the function parameter
        private async getDeviceVendor(device: Device): Promise<string> {
            // ...
        }
        ```

3.  **Error (L502:C4):** `Type '"rtl-sdr" | "other"' is not assignable to type '"kismet" | "hackrf" | "manual"'`
    *   **Analysis:** The `source` property in a `Signal` object is being assigned values that are not part of its allowed literal type union. The type definition is too restrictive for the actual data being processed.
    *   **A+ Solution:** Expand the `SignalSource` type to include all possible valid sources. This makes the type definition a more accurate representation of the system's capabilities.
        ```typescript
        // In the relevant types file (e.g., src/lib/types/signals.ts)
        export type SignalSource = 'kismet' | 'hackrf' | 'manual' | 'rtl-sdr' | 'other';

        // The assignment will now be valid
        const newSignal: Signal = {
            // ...
            source: 'rtl-sdr', // This is now a valid type
        };
        ```

---

### File: `src/lib/services/kismet/kismetService.ts`

4.  **Error (L214:C4 & L230:C4):** `Unused '@ts-expect-error' directive.`
    *   **Analysis:** `@ts-expect-error` comments are present but the following line does not produce a TypeScript error. This indicates that a previous issue was fixed, but the directive was not removed, leading to code clutter.
    *   **A+ Solution:** Remove the unnecessary `@ts-expect-error` comments. This ensures that future, legitimate errors on those lines are not accidentally suppressed.

5.  **Error (L259:C42 & L416:C44):** `Expected 1 arguments, but got 2.`
    *   **Analysis:** A function is being called with more arguments than its definition allows.
    *   **A+ Solution:** Correct the function call to pass only the expected arguments. If the second argument is necessary, update the function's signature to accept it, preferably with a clear type definition.
        ```typescript
        // Assuming the function `this.emit` only takes one argument
        // BEFORE
        this.emit('stateChange', this.currentState);

        // AFTER
        this.emit({ type: 'stateChange', payload: this.currentState });

        // OR, if the function signature needs changing:
        // function emit(eventName: string, data: any) { /* ... */ }
        ```

6.  **Error (L408:C22, L420:C22, L431:C22, etc.):** `Argument of type '"...""' is not assignable to parameter of type 'WebSocketEventType'.`
    *   **Analysis:** The code is using string literals for event types that are not defined in the `WebSocketEventType` union type.
    *   **A+ Solution:** Update the `WebSocketEventType` type definition to include all valid event strings. This provides robust type safety and autocompletion for event handling.
        ```typescript
        // In the type definition file
        export type WebSocketEventType = 'stateChange' | 'error' | 'connect' | 'disconnect' | 'device_new' | 'device_update' | 'device_remove' | 'stats_update' | 'status_update';

        // The function call will now be valid
        this.on('connect', () => { /* ... */ });
        ```

7.  **Error (L415:C9 & L416:C55):** `Variable 'currentState' is used before being assigned.`
    *   **Analysis:** The `currentState` variable is read before it has been initialized, which could lead to runtime errors.
    *   **A+ Solution:** Ensure `currentState` has a default value upon declaration.
        ```typescript
        private currentState: SystemState = 'initializing'; // Assign a default state
        ```

8.  **Error (L427:C32):** `Conversion of type 'WebSocketEvent' to type 'Error' may be a mistake...`
    *   **Analysis:** The code is attempting a direct type assertion from `WebSocketEvent` to `Error`, but the types are not compatible.
    *   **A+ Solution:** Use a type guard or create a new `Error` object from the event data. This ensures type safety and prevents runtime errors.
        ```typescript
        // BEFORE
        this.handleError(event as Error);

        // AFTER (Option 1: Type Guard)
        if (event instanceof Error) {
            this.handleError(event);
        }

        // AFTER (Option 2: Create a new Error)
        const error = new Error('WebSocket event error');
        // Optionally attach the event for debugging
        (error as any).event = event;
        this.handleError(error);
        ```

---

### File: `src/lib/services/map/gridProcessor.ts`

9.  **Error (L85:C24):** `Type 'unknown' is not assignable to type 'string'.`
    *   **Analysis:** A value of type `unknown` (likely from a `postMessage` event) is being directly assigned to a variable typed as `string`.
    *   **A+ Solution:** Implement a type guard to validate that the `unknown` value is indeed a string before assigning it.
        ```typescript
        // BEFORE
        const gridKey: string = e.data.gridKey;

        // AFTER
        if (typeof e.data.gridKey !== 'string') {
            throw new Error('Invalid gridKey received in worker');
        }
        const gridKey: string = e.data.gridKey;
        ```

10. **Error (L94:C20):** `Argument of type 'unknown' is not assignable to parameter of type 'GridProcessResult | { error: string; }'.`
    *   **Analysis:** The `resolve` function of a promise expects a specific type, but is being called with `unknown`.
    *   **A+ Solution:** Validate and cast the `unknown` data to the correct type before resolving the promise.
        ```typescript
        // Assuming a validation function exists
        if (!isGridProcessResult(data)) {
            reject(new Error('Invalid data received from worker'));
            return;
        }
        resolve(data as GridProcessResult);
        ```

11. **Error (L193:C19):** `Conversion of type 'GridProcessResult' to type '{...}' may be a mistake...`
    *   **Analysis:** An incorrect type assertion is being made. The source and target types do not have sufficient overlap.
    *   **A+ Solution:** Ensure the `GridProcessResult` type correctly includes all properties of the target type, or map the properties from the source object to a new object of the target type.
        ```typescript
        // Assuming GridProcessResult is missing properties
        // Fix the interface
        interface GridProcessResult {
            totalSignals: number;
            avgPower: number;
            maxPower: number;
            minPower: number;
            processingTime: number;
            // ... other properties
        }
        ```

---

### File: `src/lib/services/map/heatmapService.ts`

12. **Error (L226:C42):** `Argument of type '"gridProcessingTime"' is not assignable to parameter of type 'keyof PerformanceMetrics'.`
    *   **Analysis:** The string `"gridProcessingTime"` is not a defined key in the `PerformanceMetrics` type.
    *   **A+ Solution:** Add `gridProcessingTime` as a property to the `PerformanceMetrics` interface.
        ```typescript
        interface PerformanceMetrics {
            // ... existing properties
            gridProcessingTime?: number;
        }
        ```

13. **Error (L272:C9):** `Type 'InterpolationPoint[]' is not assignable to type 'HeatmapPoint[]'.`
    *   **Analysis:** The `InterpolationPoint` type is missing the `timestamp` property, which is required by `HeatmapPoint`.
    *   **A+ Solution:** Add the `timestamp` property to the `InterpolationPoint` interface or ensure it's added during the transformation process before the assignment.
        ```typescript
        // Solution 1: Add to interface
        interface InterpolationPoint {
            x: number;
            y: number;
            value: number;
            timestamp: number; // Add missing property
        }

        // Solution 2: Map the property during creation
        const interpolationPoints: InterpolationPoint[] = rawPoints.map(p => ({
            // ...
            timestamp: p.timestamp || Date.now() // Ensure timestamp is present
        }));
        ```

---

### File: `src/lib/services/map/performanceMonitor.ts`

14. **Error (L149:C6):** `Conversion of type 'PerformanceMetrics' to type 'Record<string, number>' may be a mistake...`
    *   **Analysis:** The `PerformanceMetrics` interface does not have a string index signature, so it cannot be safely converted to `Record<string, number>`.
    *   **A+ Solution:** Add a string index signature to the `PerformanceMetrics` interface.
        ```typescript
        interface PerformanceMetrics {
            [key: string]: number | undefined; // Allow string indexing
            totalTime?: number;
            // ... other specific properties
        }
        ```

---

### File: `src/lib/services/monitoring/systemHealth.ts`

15. **Error (L208:C15, L209:C15, L210:C19):** `'data.network' is possibly 'undefined'.`
    *   **Analysis:** The `data.network` object might be undefined, but the code accesses its properties without checking.
    *   **A+ Solution:** Use optional chaining (`?.`) to safely access nested properties that may not exist.
        ```typescript
        // BEFORE
        const tx = data.network.tx_bytes;

        // AFTER
        const tx = data.network?.tx_bytes;
        ```

---

### File: `src/lib/services/websocket/hackrf.ts`

16. **Error (L31:C17):** `Property 'url' is missing in type '{}' but required in type 'HackRFWebSocketConfig'.`
    *   **Analysis:** The constructor is being called with an empty object, but the `HackRFWebSocketConfig` type requires a `url` property.
    *   **A+ Solution:** Ensure the `url` is always provided when creating a new `HackRFWebSocketClient`, likely by passing it through the constructor and `super` call.
        ```typescript
        // In the constructor
        constructor(config: HackRFWebSocketConfig) {
            // Pass the full config object to the parent
            super(config);
            // ...
        }
        ```

17. **Error (L33:C13):** `'url' is specified more than once...`
    *   **Analysis:** The `url` property is being set twice in the same object, which is redundant and confusing.
    *   **A+ Solution:** Remove the duplicate `url` property assignment. The spread `...config` already includes it.
        ```typescript
        // BEFORE
        super({ ...config, url: config.url });

        // AFTER
        super({ ...config });
        ```

18. **Error (L49:C37, L54:C36, etc.):** `Argument of type 'unknown' is not assignable to parameter of type '...'.`
    *   **Analysis:** Data from the WebSocket (`message.data`) is of type `unknown` and is being passed to a function expecting a specific type.
    *   **A+ Solution:** Parse and validate the `unknown` data before passing it to the typed function. Use a type guard or a validation library like Zod.
        ```typescript
        // Assuming a type guard function `isSpectrumData` exists
        const parsedData = JSON.parse(message.data as string);
        if (isSpectrumData(parsedData)) {
            this.emit('spectrumData', parsedData);
        } else {
            this.emit('error', new Error('Invalid spectrum data received'));
        }
        ```

19. **Error (L193:C13):** `Type 'unknown' is not assignable to type 'DeviceInfo | undefined'.`
    *   **Analysis:** The result of a `this.sendRequest` call is `unknown` but is being assigned to a typed variable.
    *   **A+ Solution:** Ensure the `sendRequest` method is generic and returns a typed promise. Validate the response before returning.
        ```typescript
        // In sendRequest method
        async sendRequest<T>(command: string, payload?: any): Promise<T> {
            // ... logic
            const response = await this.waitForResponse();
            // Add validation here
            return response.data as T;
        }

        // The call site
        const deviceInfo = await this.sendRequest<DeviceInfo>('get_device_info');
        ```

---

### File: `src/lib/services/websocket/index.ts`

20. **Error (L29:C13 & L34:C13):** `This comparison appears to be unintentional because the types '...Config | undefined' and 'boolean' have no overlap.`
    *   **Analysis:** An object is being compared to a boolean, which will always be false. The intent was likely to check if the config object exists.
    *   **A+ Solution:** Correct the check to be a truthiness check on the object itself, not a comparison to `true`.
        ```typescript
        // BEFORE
        if (this.hackrfConfig === true) { /* ... */ }

        // AFTER
        if (this.hackrfConfig) { /* ... */ }
        ```

---

### File: `src/lib/services/websocket/kismet.ts`

21. **Error (L21:C14):** `Class 'KismetWebSocketClient' incorrectly extends base class 'BaseWebSocket'. Property 'lastHeartbeat' is private in type 'KismetWebSocketClient' but not in type 'BaseWebSocket'.`
    *   **Analysis:** The access modifier for `lastHeartbeat` differs between the base and child classes. TypeScript requires consistency for overridden properties.
    *   **A+ Solution:** Change the `lastHeartbeat` property in `KismetWebSocketClient` from `private` to `protected`. This allows the child class to access it while maintaining encapsulation and resolving the inheritance error.
        ```typescript
        // In BaseWebSocket
        protected lastHeartbeat: number;

        // In KismetWebSocketClient
        protected lastHeartbeat: number; // Now matches the base class
        ```

22. **Error (L24:C17 & L26:C13):** `Property 'url' is missing...` and `'url' is specified more than once...`
    *   **Analysis:** This is the same constructor pattern issue seen in `hackrf.ts`.
    *   **A+ Solution:** Apply the same fix: ensure the full config object (which includes the `url`) is passed to the `super()` call and remove the redundant property assignment.
        ```typescript
        constructor(config: BaseWebSocketConfig) {
            super(config); // Pass the whole config object
        }
        ```

---

### File: `src/lib/stores/notifications.ts`

23. **Error (L28:C17):** `'newNotification.duration' is possibly 'undefined'.`
    *   **Analysis:** The `duration` property on `newNotification` is optional, but `setTimeout` requires a number.
    *   **A+ Solution:** Provide a default value for the duration using the nullish coalescing operator (`??`).
        ```typescript
        // BEFORE
        setTimeout(() => { /* ... */ }, newNotification.duration);

        // AFTER
        const duration = newNotification.duration ?? 5000; // Default to 5 seconds
        setTimeout(() => { /* ... */ }, duration);
        ```

---

### File: `src/routes/api/hackrf/data-stream/+server.ts`

24. **Error (L71:C74):** `Argument of type 'Error' is not assignable to parameter of type 'Record<string, unknown>'.`
    *   **Analysis:** An `Error` object is being passed to a function expecting a generic `Record`. `Error` objects don't have a string index signature.
    *   **A+ Solution:** Create a new plain object from the `Error` properties to pass to the logger. This ensures compatibility and provides structured log data.
        ```typescript
        // BEFORE
        logger.error('Error streaming data', err);

        // AFTER
        logger.error('Error streaming data', {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        ```

---

### File: `src/routes/api/hackrf/status/+server.ts`

25. **Error (L12:C14):** `This comparison appears to be unintentional because the types ... and '"sweeping"' have no overlap.`
    *   **Analysis:** The `status` variable can be one of several values, but `"sweeping"` is not one of them, making the comparison always false.
    *   **A+ Solution:** Add `"sweeping"` to the allowed literal types for the status, or correct the comparison to use a valid status value.
        ```typescript
        // Assuming 'sweeping' should be a valid status
        type HackRFStatus = 'error' | 'running' | 'idle' | 'stopping' | 'sweeping';

        // The comparison is now valid
        if (status === 'sweeping') { /* ... */ }
        ```
