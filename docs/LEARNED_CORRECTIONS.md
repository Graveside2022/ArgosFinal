# Learned Corrections

## Always Test Before Declaring Completion

**Date:** 2025-07-06
**Issue:** Declared tactical-map-simple page as fully implemented without testing
**Error:** 500 Internal Server Error - Leaflet SSR issue

### Problem

- Created new tactical map page without testing it
- Imported Leaflet library directly in the script section
- Leaflet uses `window` object which doesn't exist during SSR
- This caused "ReferenceError: window is not defined"

### Solution

1. Import Leaflet dynamically only on client side:

```typescript
// Import Leaflet only on client side
let L: any;

onMount(async () => {
	// Import Leaflet dynamically on client side
	const leafletModule = await import('leaflet');
	L = leafletModule.default;
	await import('leaflet/dist/leaflet.css');

	// Continue with initialization
});
```

### Key Lessons

1. **ALWAYS test new pages before declaring them complete**
2. Check for SSR compatibility when using browser-only libraries
3. Use dynamic imports in onMount for libraries that require browser APIs
4. Test with actual HTTP requests, not just build success
5. Check server logs when encountering 500 errors

### Prevention

- After creating any new route, immediately test it with curl or browser
- For libraries using browser APIs (window, document, navigator), always use dynamic imports
- Check systemd journal logs for detailed error messages
