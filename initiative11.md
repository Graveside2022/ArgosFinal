# Initiative 11: TypeScript Error Audit and Remediation Plan (Part 3)

This document lists TypeScript errors 51 through 75 found in the codebase as of 2025-07-10, along with their recommended professional-grade A+ solutions.

---

## TypeScript Compiler Errors (`tsc`) and Recommended Solutions (51-75)

---

### File: `tests/integration/websocket.test.ts` (Continued)

43. **Error (L42:C7):** `Type 'WebSocket' is missing the following properties from type 'WebSocket': isPaused, ping, pong, terminate, and 17 more.`
    *   **Analysis:** Type mismatch between browser `WebSocket` and `ws` library's `WebSocket`.
    *   **A+ Solution:** Import `WebSocket` from `ws` for Node.js test environments.

44. **Error (L49:C7):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check: `if (ws) { ... }`.

45. **Error (L64:C7):** `Type 'WebSocket' is missing properties...`
    *   **Analysis:** Type mismatch.
    *   **A+ Solution:** Import `WebSocket` from `ws`.

46. **Error (L67:C7):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

47. **Error (L73:C7):** `Type 'WebSocket' is missing properties...`
    *   **Analysis:** Type mismatch.
    *   **A+ Solution:** Import `WebSocket` from `ws`.

48. **Error (L74:C14):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

49. **Error (L83:C7):** `Type 'WebSocket' is missing properties...`
    *   **Analysis:** Type mismatch.
    *   **A+ Solution:** Import `WebSocket` from `ws`.

50. **Error (L96:C7):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

51. **Error (L108:C7):** `Type 'WebSocket' is missing properties...`
    *   **Analysis:** Type mismatch.
    *   **A+ Solution:** Import `WebSocket` from `ws`.

52. **Error (L120:C7):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

53. **Error (L129:C7):** `Type 'WebSocket' is missing properties...`
    *   **Analysis:** Type mismatch.
    *   **A+ Solution:** Import `WebSocket` from `ws`.

54. **Error (L134:C7):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

55. **Error (L140:C9):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

56. **Error (L170:C7):** `Type 'WebSocket' is missing properties...`
    *   **Analysis:** Type mismatch.
    *   **A+ Solution:** Import `WebSocket` from `ws`.

57. **Error (L183:C7):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

58. **Error (L191:C7):** `Type 'WebSocket' is missing properties...`
    *   **Analysis:** Type mismatch.
    *   **A+ Solution:** Import `WebSocket` from `ws`.

59. **Error (L194:C7):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

60. **Error (L200:C14):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

61. **Error (L213:C7):** `'ws' is possibly 'null'.`
    *   **Analysis:** `ws` is accessed without a null check.
    *   **A+ Solution:** Add a null check.

---

### File: `tests/load/dataVolumes.test.ts`

62. **Error (L82:C32):** `Conversion of type 'Signal' to type 'SignalMarker' may be a mistake...`
    *   **Analysis:** Incompatible types are being asserted instead of transformed.
    *   **A+ Solution:** Implement a `toSignalMarker` mapping function.

63. **Error (L203:C19):** `Property 'avgResponseTime' does not exist on type 'PerformanceReport'.`
    *   **Analysis:** `PerformanceReport` interface is missing properties.
    *   **A+ Solution:** Add `avgResponseTime` to the `PerformanceReport` interface.

64. **Error (L204:C19):** `Property 'peakMemoryUsage' does not exist on type 'PerformanceReport'.`
    *   **Analysis:** `PerformanceReport` interface is missing properties.
    *   **A+ Solution:** Add `peakMemoryUsage` to the `PerformanceReport` interface.

65. **Error (L205:C19):** `Property 'errorRate' does not exist on type 'PerformanceReport'.`
    *   **Analysis:** `PerformanceReport` interface is missing properties.
    *   **A+ Solution:** Add `errorRate` to the `PerformanceReport` interface.

66. **Error (L269:C22):** `Conversion of type 'PerformanceReport' to type '{ avgMetric: (metric: string) => number; }' may be a mistake...`
    *   **Analysis:** Asserting methods on a data object.
    *   **A+ Solution:** Calculate metrics from the object's data in the test.

67. **Error (L270:C19):** `Conversion of type 'PerformanceReport' to type '{ maxMetric: (metric: string) => number; }' may be a mistake...`
    *   **Analysis:** Asserting methods on a data object.
    *   **A+ Solution:** Calculate metrics from the object's data in the test.

---

### File: `tests/performance/benchmarks.test.ts`

68. **Error (L105:C15):** `Conversion of type 'WebSocket' to type 'import("...").default' may be a mistake...`
    *   **Analysis:** Type mismatch between browser and Node.js `WebSocket`.
    *   **A+ Solution:** Import `WebSocket` from `ws`.

69. **Error (L167:C15):** `Conversion of type 'WebSocket' to type 'import("...").default' may be a mistake...`
    *   **Analysis:** Type mismatch between browser and Node.js `WebSocket`.
    *   **A+ Solution:** Import `WebSocket` from `ws`.

---

### File: `tests/services/map/signalClustering.test.ts`

70. **Error (L117:C46):** `Argument of type '{...}' is not assignable to parameter of type 'SignalCluster'.`
    *   **Analysis:** `SignalCluster` object is missing `lat` and `lon`.
    *   **A+ Solution:** Add `lat` and `lon` to the mock object creation.

71. **Error (L147:C35):** `Argument of type '{...}' is not assignable to parameter of type 'SignalCluster'.`
    *   **Analysis:** `SignalCluster` object is missing `lat` and `lon`.
    *   **A+ Solution:** Add `lat` and `lon` to the mock object creation.

72. **Error (L174:C40):** `Argument of type '{...}' is not assignable to parameter of type 'SignalCluster'.`
    *   **Analysis:** `SignalCluster` object is missing `lat` and `lon`.
    *   **A+ Solution:** Add `lat` and `lon` to the mock object creation.

73. **Error (L175:C40):** `Argument of type '{...}' is not assignable to parameter of type 'SignalCluster'.`
    *   **Analysis:** `SignalCluster` object is missing `lat` and `lon`.
    *   **A+ Solution:** Add `lat` and `lon` to the mock object creation.

---

### File: `tests/setup.ts`

74. **Error (L30:C1):** `Type 'CanvasRenderingContext2D | null' is not assignable to type '{...}'`
    *   **Analysis:** Mock for `getContext` is too simplistic for the overloaded function type.
    *   **A+ Solution:** Create a more realistic mock function that handles different `contextId` values.

---

### File: `tests/unit/components.test.ts`

75. **Error (L199:C32):** `'devices' is referenced directly or indirectly in its own type annotation.`
    *   **Analysis:** Circular type reference.
    *   **A+ Solution:** Define the `DeviceListProps` type separately before using it.
