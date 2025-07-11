### INITIATIVE 8: CENTRALIZE AND STANDARDIZE ERROR HANDLING

- **Problem:** The application currently lacks a global strategy for handling unexpected server-side errors. An unhandled exception in an API route could crash the server or leak sensitive stack trace information to the client.
- **Solution:** We will implement SvelteKit's `handleError` hook. This acts as a global try/catch for the entire server, allowing us to log every error consistently and return a safe, standardized error message to the user.

**[ ] Task 8.1: Implement the `handleError` Hook** - **Action:** Open `src/hooks.server.ts` and add the following hook.
```typescript
import type { HandleServerError } from '@sveltejs/kit';
import logger from '$lib/server/logger';
      import { dev } from '$app/environment';

      export const handleError: HandleServerError = ({ error, event }) => {
        const errorId = crypto.randomUUID();
        // Log the full error for debugging.
        logger.error({ errorId, url: event.url.pathname, error }, 'Unhandled server error');
        // Return a generic, safe response to the client.
        return {
          message: 'An internal server error occurred. We have been notified.',
          errorId,
          stack: dev && error instanceof Error ? error.stack : undefined,
        };
      };
      ```
    - **Checkpoint:** Create a temporary test route that throws an error. Verify that the standardized JSON response is returned and the error is logged. Then remove the test route. **This completes the final initiative.**
