# Initiative 16: SvelteKit Error Resolution

This document outlines the errors found by `svelte-check` and their proposed solutions.

---

### 1. `src/lib/components/hackrf/SignalAgeVisualization.svelte`

- **Errors:**
    - `:78:4 'ctx' is possibly 'null'. (ts)`
    - `:81:4 'ctx' is possibly 'null'. (ts)`
    - `:85:5 'ctx' is possibly 'null'. (ts)`
    - `:86:5 'ctx' is possibly 'null'. (ts)`
    - `:87:5 'ctx' is possibly 'null'. (ts)`
    - `:88:5 'ctx' is possibly 'null'. (ts)`
    - `:136:4 'ctx' is possibly 'null'. (ts)`
    - `:137:4 'ctx' is possibly 'null'. (ts)`
    - `:138:4 'ctx' is possibly 'null'. (ts)`
    - `:139:4 'ctx' is possibly 'null'. (ts)`
    - `:140:4 'ctx' is possibly 'null'. (ts)`
- **Cause:** The `ctx` variable is initialized as `null` and there's no guarantee it will be assigned a `CanvasRenderingContext2D` object before being used.
- **Solution:** Add a null check at the beginning of the `drawVisualization` function.

```typescript
function drawVisualization() {
	if (!ctx) return;
	// ... rest of the function
}
```

---

### 2. `src/lib/components/hackrf/SpectrumAnalysis.svelte`

- **Errors:**
    - `:84:6 'ctx' is possibly 'null'. (ts)`
    - `:86:6 'ctx' is possibly 'null'. (ts)`
- **Cause:** Similar to the previous file, `ctx` can be `null`.
- **Solution:** Add a null check at the beginning of the `drawSpectrum` function.

```typescript
function drawSpectrum() {
	if (!ctx || isDrawing) return;
	// ... rest of the function
}
```

---

### 3. `src/lib/components/hackrf/TimeFilterDemo.svelte`

- **Errors:**
    - `:29:4 Object literal may only specify known properties, and 'sweepId' does not exist in type 'SignalDetection'. (ts)`
    - `:47:3 Type 'Timeout' is not assignable to type 'number'. (ts)`
    - `:83:3 Type 'Timeout' is not assignable to type 'number'. (ts)`
- **Cause:**
    1.  The `SignalDetection` type does not have a `sweepId` property.
    2.  `setInterval` returns a `Timeout` object in Node.js, but the variable is typed as `number`.
- **Solution:**
    1.  Remove the `sweepId` property from the object literal or add it to the `SignalDetection` type definition.
    2.  Change the type of `generationInterval` and `droneInterval` to `any` or `NodeJS.Timeout`.

```typescript
// For sweepId
return {
	frequency: frequency * 1e6, // Convert to Hz
	power,
	bandwidth: bandwidth * 1e6, // Convert to Hz
	timestamp: Date.now(),
	// sweepId: `demo-${signalCount}`, // Remove this line
	modulation: Math.random() > 0.5 ? 'FM' : 'AM'
};

// For intervals
let generationInterval: NodeJS.Timeout | null = null;
let droneInterval: NodeJS.Timeout | null = null;
```

---

### 4. `src/lib/components/hackrf/TimeWindowControl.svelte`

- **Error:** `:92:3 Type 'Timeout' is not assignable to type 'number'. (ts)`
- **Cause:** `setInterval` returns a `Timeout` object.
- **Solution:** Change the type of `autoRemoveInterval` to `any` or `NodeJS.Timeout`.

```typescript
let autoRemoveInterval: NodeJS.Timeout | null = null;
```

---

### 5. `src/lib/components/kismet/StatisticsPanel.svelte`

- **Error:** `:32:3 Type 'Timeout' is not assignable to type 'number'. (ts)`
- **Cause:** `setInterval` returns a `Timeout` object.
- **Solution:** Change the type of `updateInterval` to `any` or `NodeJS.Timeout`.

```typescript
let updateInterval: NodeJS.Timeout;
```

---

### 6. `src/lib/components/map/MapControls.svelte`

- **Errors:**
    - `:165:36 Argument of type '"hackrf"' is not assignable to parameter of type 'SignalSource | undefined'. (ts)`
    - `:172:36 Argument of type '"kismet"' is not assignable to parameter of type 'SignalSource | undefined'. (ts)`
- **Cause:** The `clearSignals` function expects a `SignalSource` type, but is being passed a plain string.
- **Solution:** The `clearSignals` function in `$lib/stores/map/signals.ts` needs to be updated to accept a string literal type.

```typescript
// in $lib/stores/map/signals.ts
export function clearSignals(source?: 'hackrf' | 'kismet') {
	// ...
}
```

---

### 7. `src/lib/components/map/SignalFilterControls.svelte`

- **Errors:**
    - `:76:47 No overload matches this call. ...`
    - `:85:7 Type '{...}' is not assignable to type 'FilteringOptions'.`
    - `:363:26 'filterOptions.timeWindow' is possibly 'undefined'. (ts)`
- **Cause:**
    1.  The `Map` constructor is being passed an array of mixed types.
    2.  The `priorityMode` in the preset options is a generic `string`, but `FilteringOptions` expects a specific literal type.
    3.  `timeWindow` is an optional property on `filterOptions`.
- **Solution:**
    1.  Ensure the array passed to the `Map` constructor has the correct type.
    2.  Assert the type of `preset.options`.
    3.  Use optional chaining or a default value for `timeWindow`.

```typescript
// For Map constructor
let enabledBands = new Map<string, boolean>([
    ...DRONE_FREQUENCY_BANDS.map(band => [band.name, true] as [string, boolean]),
    ...INTERFERENCE_BANDS.map(band => [band.name, false] as [string, boolean])
]);

// For preset options
if (preset) {
  filterOptions = { ...filterOptions, ...(preset.options as Partial<FilteringOptions>) };
  selectedPreset = presetKey;
  applyFilters();
}

// For timeWindow
value={filterOptions.timeWindow ?? 0 / 1000}
```

---

### 8. `src/lib/components/map/SignalInfoCard.svelte`

- **Error:** `:2:37 Cannot find module '../../../types/signals' or its corresponding type declarations. (ts)`
- **Cause:** The relative path to the type definition is incorrect.
- **Solution:** Correct the import path. It should likely be a `$lib` alias.

```typescript
import type { SignalMarker } from '$lib/types/signals';
```

---

### 9. `src/routes/kismet-dashboard/+page.svelte`

- **Error:** `:143:80 Argument of type 'number | undefined' is not assignable to parameter of type 'number'.`
- **Cause:** `device.signal` can be `undefined`.
- **Solution:** Provide a default value when calling `getSignalColor`.

```typescript
<td class="px-6 py-4 whitespace-nowrap text-sm {getSignalColor(device.signal ?? -100)}">
  {device.signal ? `${device.signal} dBm` : '-'}
</td>
```

---

### 10. `src/routes/tactical-map-simple/+page.svelte`

- **Errors:**
    - `:844:9 'this' implicitly has type 'any' because it does not have a type annotation. (ts)`
    - `:847:20 Argument of type 'LeafletMap | null' is not assignable to parameter of type 'LeafletMap'.`
    - `:1043:7 'this' implicitly has type 'any' because it does not have a type annotation. (ts)`
    - `:1160:5 Type 'Timeout' is not assignable to type 'number'. (ts)`
    - `:1174:3 Type 'typeof import("leaflet")' is missing the following properties from type 'LeafletLibrary': map, tileLayer, marker, circle, and 3 more. (ts)`
- **Cause:**
    1.  `this` in the event handler is not typed.
    2.  `map` can be `null`.
    3.  `setTimeout` returns a `Timeout` object.
    4.  The dynamically imported `leaflet` module is not being correctly assigned to the `L` variable with the expected type.
- **Solution:**
    1.  The existing type assertion `(this as LeafletMarker)` is a reasonable approach. This seems to be a linting rule preference.
    2.  Add a null check for `map`.
    3.  Change the type of `_clearTimeout` on the `SimplifiedSignal` interface.
    4.  The dynamic import of leaflet is tricky. A type assertion might be needed.

```typescript
// For 'this' errors, the existing code is a valid solution.

// For map null check
if (map) {
	marker.addTo(map);
}

// For timeout
interface SimplifiedSignal {
	// ...
	_clearTimeout?: NodeJS.Timeout;
}

// For leaflet import
L = leafletModule.default as unknown as LeafletLibrary;
```
