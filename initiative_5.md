### INITIATIVE 5: IMPLEMENT TYPE-SAFE ENVIRONMENT VARIABLE MANAGEMENT (RISK-MITIGATED)

- **Problem:** The project relies on `.env` files, but nothing validates their presence or correctness at runtime. A missing `KISMET_API_URL`, for example, would cause a cryptic `fetch` error deep inside the application instead of a clear, immediate error on startup.
- **Solution:** We will use `zod` to parse and validate `process.env`. This enforces the "fail-fast" principle: the application will refuse to start if the configuration is invalid, making it more reliable and easier to debug.
- **Key Risks Addressed:** Configuration Validation Gap, Service Layer Coupling

**[ ] Task 5.1: Create and Configure `.env` File (RISK-MITIGATED)** - **Risk Assessment:** Missing or invalid environment variables may cause application startup failures - **Pre-Validation:** - Check if `.env.example` exists: `ls -la .env.example` - Verify current environment variables: `printenv | grep -E "(KISMET|DATABASE|NODE_ENV)"` - Backup existing `.env` if it exists: `cp .env .env.backup` - **Action:** Copy the existing `.env.example` file to a new file named `.env`. - **Command:** `cp .env.example .env` - **Action:** Open the new `.env` file and ensure that `KISMET_API_URL` and any other necessary variables are present and have valid values for your local development environment. - **Rollback Procedure:** If configuration causes issues, restore from `.env.backup` - **Checkpoint:** A `.env` file must exist and be correctly configured, with all required URLs accessible

**[ ] Task 5.2: Install and Configure Zod (RISK-MITIGATED)** - **Risk Assessment:** New dependency may conflict with existing packages or cause TypeScript issues - **Pre-Validation:** - Check current package versions: `npm list zod` - Verify TypeScript configuration: `npx tsc --noEmit` - Create backup of package.json: `cp package.json package.json.backup` - **Command:** `npm install zod@3.25.76` - **Action:** Create `src/lib/server/env.ts`. - **Action:** Add the following schema definition:
```typescript
import { z } from 'zod';
import { config } from 'dotenv';
config(); // Load .env variables

      const envSchema = z.object({
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
        DATABASE_PATH: z.string().min(1).default('./rf_signals.db'),
        KISMET_API_URL: z.string().url({ message: "Invalid KISMET_API_URL" }),
      });

      export const env = envSchema.parse(process.env);
      ```
    - **Action:** In `src/hooks.server.ts`, add `import '$lib/server/env';` to the very top.
    - **Rollback Procedure:** If zod causes issues, restore package.json.backup and run `npm install`
    - **Validation Commands:**
      - `npm run build` (must succeed)
      - `npm run typecheck` (must pass)
      - Test server startup with invalid KISMET_API_URL to ensure validation works
    - **Checkpoint:** The server must fail to start if `KISMET_API_URL` is commented out or removed from `.env`
