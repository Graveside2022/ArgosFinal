### INITIATIVE 6: FORMALIZE THE DATA ACCESS LAYER (DAL) (RISK-MITIGATED)

- **Problem:** The application's Node.js backend has no direct access to its own database. All database logic is in external shell scripts. This makes the logic untestable, untyped, and completely disconnected from the application that relies on it.
- **Solution:** We will implement a formal Data Access Layer (DAL) using the `better-sqlite3` dependency. This will centralize all SQL queries within the type-safe TypeScript application, making them testable, maintainable, and robust.
- **Key Risks Addressed:** Data Access Layer Complexity, Database Schema Mismatch, Dependency Conflict Risk

**[ ] Task 6.1: Create the Database Singleton (RISK-MITIGATED)** - **Risk Assessment:** Database driver installation may conflict with existing dependencies or fail to connect - **Pre-Validation:** - Check existing database connection methods - Verify database file exists and is accessible - Test database permissions and file locks - Backup existing database before making changes - **Action:** Install `better-sqlite3` and create initial database connection - **Rollback Procedure:** - Remove better-sqlite3 if installation fails - Restore original database access methods
 - Revert to script-based database operations if needed - **Action:** Create `src/lib/server/database/index.ts`. - **Action:** Add the following code to create a single, shared database connection.
```typescript
import Database from 'better-sqlite3';
import { env } from '$lib/server/env';
      import logger from '$lib/server/logger';

      export const db = new Database(env.DATABASE_PATH, { verbose: logger.debug.bind(logger) });
      db.pragma('journal_mode = WAL');
      logger.info('Database connection established successfully.');
      ```
    - **Checkpoint:** The application must start without errors.

**[ ] Task 6.2: Create Type-Safe Repositories (RISK-MITIGATED)** - **Risk Assessment:** Database schema types may not match actual database structure - **Pre-Validation:** - Inspect actual database schema using SQLite browser or command line - Compare existing table structures with planned interfaces - Test database queries against actual data before creating repositories - **Action:** Create a new file `src/lib/server/database/schema.ts` to hold the TypeScript interfaces for your database tables. This provides a single source of truth for your data shapes. - **Rollback Procedure:** - Remove schema.ts if type mismatches occur - Revert to dynamic typing if interfaces are incorrect - Use database introspection tools to verify actual schema
```typescript
// Corresponds to the 'devices' table
export interface Device {
id: number;
device_id: string;
type: string;
manufacturer: string | null;
first_seen: number;
last_seen: number;
avg_power: number | null;
freq_min: number | null;
freq_max: number | null;
metadata: string | null; // JSON string
}

      // Corresponds to the 'signals' table
      export interface Signal {
        id: number;
        signal_id: string;
        device_id: string | null;
        timestamp: number;
        latitude: number;
        longitude: number;
        power: number;
        frequency: number;
        bandwidth: number | null;
        modulation: string | null;
        source: string;
        metadata: string | null; // JSON string
      }
      ```
    - **Action:** Create a new file: `src/lib/server/database/signals.repository.ts`.
    - **Action:** Add the following code to provide type-safe methods for accessing signal data.
      ```typescript
      import { db } from './index';
      import type { Signal } from './schema';

      export const signalsRepository = {
        findById(id: string): Signal | null {
          const stmt = db.prepare('SELECT * FROM signals WHERE signal_id = ?');
          return stmt.get(id) as Signal | null;
        },
        findRecent(limit = 100): Signal[] {
          const stmt = db.prepare('SELECT * FROM signals ORDER BY timestamp DESC LIMIT ?');
          return stmt.all(limit) as Signal[];
        }
      };
      ```
    - **Checkpoint:** The files must exist and be free of type errors.
