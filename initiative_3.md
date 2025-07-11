### INITIATIVE 3: FORMALIZE DATABASE MIGRATIONS (RISK-MITIGATED)

- **Problem:** The database schema is likely defined in loose SQL files or, worse, assumed to exist. My analysis of `scripts/db-cleanup.sh` shows direct `sqlite3` calls, which indicates schema is not managed in a version-controlled, automated way. This is extremely risky; there is no guarantee that the database schema in development matches production, leading to bugs and deployment failures.
- **Solution:** Implement a proper database migration system with version control and rollback capabilities, explicitly connecting schema audit findings to migration creation.
- **Key Risks Addressed:** Database Schema Mismatch, Rollback Procedure Gaps, Unverified Assumptions

**[ ] Task 3.1: Comprehensive Database Schema Audit (RISK-MITIGATED)** - **Risk Assessment:** Unknown database structure may cause migration failures and incorrect assumptions about existing schema - **Pre-Validation:** - Check if database file exists and its location: `find . -name "*.db" -o -name "*.sqlite*"` - Examine all `.sql` files in the project: `find . -name "*.sql" -exec echo "=== {} ===" \; -exec cat {} \;` - Analyze `scripts/db-cleanup.sh` for schema clues and table references - Look for any existing migration files or database initialization code - Verify database file accessibility and permissions - **Action:** Document current database schema with complete table definitions, relationships, and constraints - **Implementation Strategy:**
```bash # Step 1: Locate database file
find . -name "_.db" -o -name "_.sqlite\*" | head -10

      # Step 2: Extract complete schema
      sqlite3 [database_file] ".schema" > current_schema_raw.sql

      # Step 3: Format and analyze schema
      sqlite3 [database_file] ".tables" > tables_list.txt
      sqlite3 [database_file] ".indices" > indices_list.txt

      # Step 4: Analyze each table structure
      for table in $(cat tables_list.txt); do
        echo "=== $table ===" >> schema_analysis.txt
        sqlite3 [database_file] "PRAGMA table_info($table);" >> schema_analysis.txt
        sqlite3 [database_file] "SELECT sql FROM sqlite_master WHERE type='table' AND name='$table';" >> schema_analysis.txt
        echo "" >> schema_analysis.txt
      done
      ```
    - **Action:** Create comprehensive schema documentation in `docs/database-schema-audit.md`
    - **Rollback Procedure:** If schema analysis reveals critical issues, halt migration work and document blockers
    - **Checkpoint:** Complete understanding of current database structure with documented tables, columns, types, constraints, and relationships
    - **Validation Command:** `sqlite3 [database_file] ".schema" > current_schema.sql && wc -l current_schema.sql`

**[ ] Task 3.1.5: Schema Validation and Assumption Verification (RISK-MITIGATED)** - **Risk Assessment:** Assumptions about database schema may be incorrect, leading to migration failures - **Pre-Validation:** - Compare documented schema with actual database structure - Verify all tables referenced in code exist in database - Check that column types and constraints match code expectations - Validate relationships between tables are properly defined - **Action:** Create schema validation report that connects audit findings to migration requirements - **Implementation Strategy:**
```bash # Validate schema assumptions against actual database
echo "=== SCHEMA VALIDATION REPORT ===" > schema_validation_report.md

      # Check table existence for all referenced tables
      echo "## Table Existence Validation" >> schema_validation_report.md
      for table in devices signals relationships patterns networks; do
        if sqlite3 [database_file] "SELECT name FROM sqlite_master WHERE type='table' AND name='$table';" | grep -q "$table"; then
          echo "✓ Table '$table' exists" >> schema_validation_report.md
        else
          echo "✗ Table '$table' MISSING" >> schema_validation_report.md
        fi
      done

      # Validate column types against code expectations
      echo "## Column Type Validation" >> schema_validation_report.md
      sqlite3 [database_file] "PRAGMA table_info(devices);" >> schema_validation_report.md
      sqlite3 [database_file] "PRAGMA table_info(signals);" >> schema_validation_report.md

      # Check for foreign key constraints
      echo "## Foreign Key Validation" >> schema_validation_report.md
      sqlite3 [database_file] "PRAGMA foreign_key_list(signals);" >> schema_validation_report.md
      sqlite3 [database_file] "PRAGMA foreign_key_list(relationships);" >> schema_validation_report.md
      ```
    - **Action:** Document schema-to-migration transformation process
    - **Implementation:**
      ```markdown
      # Schema-to-Migration Transformation Process

      ## Current Schema Analysis Results
      - Tables identified: [from audit]
      - Missing tables: [from validation]
      - Schema inconsistencies: [from validation]

      ## Migration Requirements Derived from Schema
      1. CREATE TABLE statements for missing tables
      2. ALTER TABLE statements for schema modifications
      3. CREATE INDEX statements for missing indexes
      4. Data migration scripts for existing data

      ## Rollback Strategy
      - DOWN migration for each UP migration
      - Data backup before schema changes
      - Rollback verification scripts
      ```
    - **Rollback Procedure:** If validation reveals critical schema mismatches, halt migration work and address schema issues first
    - **Checkpoint:** Schema validation report must show all expected tables exist and match code expectations
    - **Validation Command:** `cat schema_validation_report.md | grep -c "✓"`

**[ ] Task 3.2: Install Migration Tools (RISK-MITIGATED)** - **Risk Assessment:** Migration tool dependencies may conflict with existing packages - **Pre-Validation:** - Check current package.json for existing database tools - Verify npm registry access for package installation - Create backup of package.json before installation - **Action:** Install required migration tools explicitly - **Command:** `npm install db-migrate db-migrate-sqlite3 --save-dev` - **Rollback Procedure:** If installation fails, restore package.json.backup and run `npm install` - **Checkpoint:** Migration tools must be installed and accessible - **Validation Command:** `npx db-migrate --help && npm run build`

**[ ] Task 3.3: Create Migration Framework Based on Schema Audit (RISK-MITIGATED)** - **Risk Assessment:** Custom migration system may be incomplete or buggy, and may not properly reflect actual database schema - **Pre-Validation:** - Review schema audit results from Task 3.1 and validation report from Task 3.1.5 - Identify specific schema gaps that need migration scripts - Research existing Node.js migration libraries (knex, migrate, etc.) - Test chosen solution on a copy of the database - Ensure rollback capabilities work properly - **Action:** Implement database migration system with proper version control, using schema audit findings as blueprint - **Implementation:**
```typescript
// src/lib/database/migrations.ts
import { Database } from 'sqlite3';
import { createLogger } from '$lib/logger';

      const logger = createLogger('MigrationRunner');

      export interface Migration {
        version: number;
        name: string;
        description: string;
        up: (db: Database) => Promise<void>;
        down: (db: Database) => Promise<void>;
        // Added validation function to verify migration success
        validate: (db: Database) => Promise<boolean>;
      }

      export class MigrationRunner {
        private db: Database;

        constructor(dbPath: string) {
          this.db = new Database(dbPath);
        }

        async initialize(): Promise<void> {
          await this.createMigrationTable();
          logger.info('Migration system initialized');
        }

        async migrate(): Promise<void> {
          const pendingMigrations = await this.getPendingMigrations();
          logger.info(`Found ${pendingMigrations.length} pending migrations`);

          for (const migration of pendingMigrations) {
            try {
              logger.info(`Running migration: ${migration.name}`);
              await migration.up(this.db);

              // Validate migration success
              const isValid = await migration.validate(this.db);
              if (!isValid) {
                throw new Error(`Migration validation failed: ${migration.name}`);
              }

              await this.recordMigration(migration);
              logger.info(`Migration completed: ${migration.name}`);
            } catch (error) {
              logger.error(`Migration failed: ${migration.name}`, { error });
              throw error;
            }
          }
        }

        async rollback(): Promise<void> {
          const lastMigration = await this.getLastMigration();
          if (!lastMigration) {
            logger.warn('No migrations to rollback');
            return;
          }

          try {
            logger.info(`Rolling back migration: ${lastMigration.name}`);
            await lastMigration.down(this.db);
            await this.removeMigrationRecord(lastMigration);
            logger.info(`Rollback completed: ${lastMigration.name}`);
          } catch (error) {
            logger.error(`Rollback failed: ${lastMigration.name}`, { error });
            throw error;
          }
        }

        private async createMigrationTable(): Promise<void> {
          const sql = `
            CREATE TABLE IF NOT EXISTS migrations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              version INTEGER NOT NULL UNIQUE,
              name TEXT NOT NULL,
              description TEXT NOT NULL,
              executed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
              execution_time_ms INTEGER NOT NULL
            );
          `;
          await this.executeQuery(sql);
        }

        private async getPendingMigrations(): Promise<Migration[]> {
          // Implementation to get pending migrations based on schema audit
          return [];
        }

        private async getLastMigration(): Promise<Migration | null> {
          // Implementation to get last executed migration
          return null;
        }

        private async recordMigration(migration: Migration): Promise<void> {
          // Implementation to record successful migration
        }

        private async removeMigrationRecord(migration: Migration): Promise<void> {
          // Implementation to remove migration record on rollback
        }

        private async executeQuery(sql: string): Promise<void> {
          return new Promise((resolve, reject) => {
            this.db.run(sql, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }
      ```
    - **Action:** Create migration templates based on schema audit findings
    - **Implementation:**
      ```typescript
      // src/lib/database/migrations/templates/create-table.template.ts
      import type { Migration } from '../migrations';

      export const createTableMigration = (
        version: number,
        tableName: string,
        schema: string,
        indexStatements: string[] = []
      ): Migration => ({
        version,
        name: `create_${tableName}_table`,
        description: `Create ${tableName} table with schema from audit`,
        up: async (db) => {
          // Create table using schema from audit
          await new Promise((resolve, reject) => {
            db.run(schema, (err) => {
              if (err) reject(err);
              else resolve(undefined);
            });
          });

          // Create indexes
          for (const indexSql of indexStatements) {
            await new Promise((resolve, reject) => {
              db.run(indexSql, (err) => {
                if (err) reject(err);
                else resolve(undefined);
              });
            });
          }
        },
        down: async (db) => {
          // Drop indexes first
          for (const indexSql of indexStatements) {
            const indexName = indexSql.match(/CREATE INDEX (\w+)/)?.[1];
            if (indexName) {
              await new Promise((resolve, reject) => {
                db.run(`DROP INDEX IF EXISTS ${indexName}`, (err) => {
                  if (err) reject(err);
                  else resolve(undefined);
                });
              });
            }
          }

          // Drop table
          await new Promise((resolve, reject) => {
            db.run(`DROP TABLE IF EXISTS ${tableName}`, (err) => {
              if (err) reject(err);
              else resolve(undefined);
            });
          });
        },
        validate: async (db) => {
          // Validate table exists and has correct structure
          return new Promise((resolve) => {
            db.get(
              `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
              [tableName],
              (err, row) => {
                resolve(!err && !!row);
              }
            );
          });
        }
      });
      ```
    - **Rollback Procedure:** If migration system fails, revert to manual SQL scripts and restore from backup
    - **Command:** `npm run build && npm run lint && npm run typecheck`
    - **Checkpoint:** Migration framework functional, tested, and connected to schema audit findings
    - **Validation Command:** `npm run build && npm run lint && npm run typecheck && npm run test:unit`

**[ ] Task 3.4: Analyze db-cleanup.sh Script (RISK-MITIGATED)** - **Risk Assessment:** Complex database maintenance logic may be missed in DAL implementation - **Pre-Validation:** - Examine scripts/db-cleanup.sh for all database operations - Document backup creation and rotation logic (keeps last 7 backups) - Map SQL operations on signals, devices, relationships, patterns tables - Understand aggregation logic for signal_stats_hourly table - Note integrity checking and VACUUM optimization procedures - **Action:** Create comprehensive analysis document of db-cleanup.sh functionality - **Implementation:**
`bash
      # Critical operations identified in db-cleanup.sh:
      # 1. Backup creation with compression and rotation
      # 2. Complex deletion logic:
      #    - DELETE FROM signals WHERE signal_id IN (SELECT signal_id FROM signals_to_delete LIMIT 10000)
      #    - DELETE FROM devices WHERE device_id IN (SELECT device_id FROM devices_to_delete)
      #    - DELETE FROM relationships WHERE id IN (SELECT id FROM relationships_to_delete)
      #    - DELETE FROM patterns WHERE pattern_id IN (SELECT pattern_id FROM expired_patterns)
      # 3. Aggregation table updates for signal_stats_hourly
      # 4. Database optimization: ANALYZE and conditional VACUUM (>10% fragmentation)
      # 5. Integrity checking with PRAGMA integrity_check
      # 6. Log rotation for cleanup.log files
      ` - **Action:** Create mapping document: `docs/db-cleanup-analysis.md` - **Rollback Procedure:** If analysis reveals critical gaps, halt DAL implementation - **Checkpoint:** Complete understanding of all database maintenance operations - **Validation Command:** `cat scripts/db-cleanup.sh | grep -E '(DELETE|INSERT|UPDATE|VACUUM|ANALYZE)' > db_operations.txt`

**[ ] Task 3.5: Create Database Access Layer Using Schema Audit Results (RISK-MITIGATED)** - **Risk Assessment:** New DAL may not handle edge cases or connection failures, and may not align with actual database schema - **Pre-Validation:** - Review schema audit findings from Task 3.1 and validation report from Task 3.1.5 - Analyze current data access patterns in API routes using actual schema - Identify all database queries and their purposes based on verified table structure - Test DAL with actual database operations using confirmed schema - Verify all table names, column names, and data types from schema audit - **Action:** Create a proper Data Access Layer to replace direct shell script calls, using verified schema structure - **Implementation:**
```typescript
// src/lib/database/dal.ts
import { Database } from 'sqlite3';
import { createLogger } from '$lib/logger';

      const logger = createLogger('DAL');

      // Schema interfaces based on actual database structure from audit
      interface DatabaseDevice {
        id: number;
        device_id: string;
        type: string;
        manufacturer: string | null;
        first_seen: number;
        last_seen: number;
        avg_power: number | null;
        freq_min: number | null;
        freq_max: number | null;
        metadata: string | null;
      }

      interface DatabaseSignal {
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
        metadata: string | null;
      }

      export class DatabaseAccessLayer {
        private db: Database;

        constructor(dbPath: string) {
          this.db = new Database(dbPath);
        }

        async getDevices(): Promise<DatabaseDevice[]> {
          return new Promise((resolve, reject) => {
            // Using actual column names from schema audit
            this.db.all(
              'SELECT id, device_id, type, manufacturer, first_seen, last_seen, avg_power, freq_min, freq_max, metadata FROM devices',
              (err, rows) => {
                if (err) {
                  logger.error('Failed to get devices', { error: err.message });
                  reject(err);
                } else {
                  resolve(rows as DatabaseDevice[]);
                }
              }
            );
          });
        }

        async getRecentSignals(limit: number = 100): Promise<DatabaseSignal[]> {
          return new Promise((resolve, reject) => {
            // Using actual column names from schema audit
            this.db.all(
              'SELECT id, signal_id, device_id, timestamp, latitude, longitude, power, frequency, bandwidth, modulation, source, metadata FROM signals ORDER BY timestamp DESC LIMIT ?',
              [limit],
              (err, rows) => {
                if (err) {
                  logger.error('Failed to get recent signals', { error: err.message });
                  reject(err);
                } else {
                  resolve(rows as DatabaseSignal[]);
                }
              }
            );
          });
        }

        async cleanup(): Promise<void> {
          // Replace db-cleanup.sh functionality with verified schema operations
          logger.info('Starting database cleanup operations');

          try {
            // 1. Create backup (following db-cleanup.sh pattern)
            await this.createBackup();

            // 2. Clean up old signals based on retention policy
            await this.cleanupOldSignals();

            // 3. Clean up orphaned devices
            await this.cleanupOrphanedDevices();

            // 4. Clean up orphaned relationships
            await this.cleanupOrphanedRelationships();

            // 5. Clean up expired patterns
            await this.cleanupExpiredPatterns();

            // 6. Update aggregation tables
            await this.updateAggregationTables();

            // 7. Optimize database
            await this.optimizeDatabase();

            logger.info('Database cleanup completed successfully');
          } catch (error) {
            logger.error('Database cleanup failed', { error });
            throw error;
          }
        }

        private async createBackup(): Promise<void> {
          // Implementation based on db-cleanup.sh backup logic
          logger.info('Creating database backup');
          // Backup creation logic here
        }

        private async cleanupOldSignals(): Promise<void> {
          return new Promise((resolve, reject) => {
            // Based on retention_policy_violations view from schema audit
            this.db.run(
              `DELETE FROM signals WHERE signal_id IN (
                SELECT signal_id FROM signals
                WHERE timestamp < (strftime('%s', 'now') * 1000 -
                  CASE
                    WHEN source = 'hackrf' AND frequency > 2400 THEN 3600000
                    WHEN source IN ('kismet', 'wifi') THEN 604800000
                    ELSE 3600000
                  END
                )
                LIMIT 10000
              )`,
              (err) => {
                if (err) {
                  logger.error('Failed to cleanup old signals', { error: err.message });
                  reject(err);
                } else {
                  logger.info('Old signals cleaned up successfully');
                  resolve();
                }
              }
            );
          });
        }

        private async cleanupOrphanedDevices(): Promise<void> {
          return new Promise((resolve, reject) => {
            // Based on devices_to_delete view from schema audit
            this.db.run(
              `DELETE FROM devices WHERE device_id IN (
                SELECT d.device_id FROM devices d
                WHERE NOT EXISTS (
                  SELECT 1 FROM signals s
                  WHERE s.device_id = d.device_id
                  AND s.timestamp > (strftime('%s', 'now') * 1000 - 604800000)
                )
              )`,
              (err) => {
                if (err) {
                  logger.error('Failed to cleanup orphaned devices', { error: err.message });
                  reject(err);
                } else {
                  logger.info('Orphaned devices cleaned up successfully');
                  resolve();
                }
              }
            );
          });
        }

        private async cleanupOrphanedRelationships(): Promise<void> {
          return new Promise((resolve, reject) => {
            // Based on relationships_to_delete view from schema audit
            this.db.run(
              `DELETE FROM relationships WHERE id IN (
                SELECT r.id FROM relationships r
                WHERE NOT EXISTS (SELECT 1 FROM devices WHERE device_id = r.source_device_id)
                OR NOT EXISTS (SELECT 1 FROM devices WHERE device_id = r.target_device_id)
              )`,
              (err) => {
                if (err) {
                  logger.error('Failed to cleanup orphaned relationships', { error: err.message });
                  reject(err);
                } else {
                  logger.info('Orphaned relationships cleaned up successfully');
                  resolve();
                }
              }
            );
          });
        }

        private async cleanupExpiredPatterns(): Promise<void> {
          return new Promise((resolve, reject) => {
            // Based on expired_patterns view from schema audit
            this.db.run(
              `DELETE FROM patterns WHERE pattern_id IN (
                SELECT pattern_id FROM patterns
                WHERE expires_at IS NOT NULL
                AND expires_at < strftime('%s', 'now') * 1000
              )`,
              (err) => {
                if (err) {
                  logger.error('Failed to cleanup expired patterns', { error: err.message });
                  reject(err);
                } else {
                  logger.info('Expired patterns cleaned up successfully');
                  resolve();
                }
              }
            );
          });
        }

        private async updateAggregationTables(): Promise<void> {
          // Update signal_stats_hourly and other aggregation tables
          logger.info('Updating aggregation tables');
          // Implementation here based on schema audit findings
        }

        private async optimizeDatabase(): Promise<void> {
          return new Promise((resolve, reject) => {
            // Based on db-cleanup.sh optimization logic
            this.db.run('ANALYZE', (err) => {
              if (err) {
                logger.error('Failed to analyze database', { error: err.message });
                reject(err);
              } else {
                // Check fragmentation and run VACUUM if needed
                this.db.get('PRAGMA freelist_count', (err, row: any) => {
                  if (err) {
                    reject(err);
                  } else {
                    const fragmentationRatio = row.freelist_count / 1000; // Simplified calculation
                    if (fragmentationRatio > 0.1) {
                      this.db.run('VACUUM', (vacuumErr) => {
                        if (vacuumErr) {
                          logger.error('Failed to vacuum database', { error: vacuumErr.message });
                          reject(vacuumErr);
                        } else {
                          logger.info('Database optimized successfully');
                          resolve();
                        }
                      });
                    } else {
                      logger.info('Database optimization skipped (low fragmentation)');
                      resolve();
                    }
                  }
                });
              }
            });
          });
        }
      }
      ```
    - **Rollback Procedure:** If DAL fails, revert to shell script calls temporarily and restore from backup
    - **Command:** `npm run build && npm run lint && npm run typecheck`
    - **Checkpoint:** DAL functional, replaces shell script dependencies, and uses verified schema structure
    - **Validation Command:** `npm run build && npm run lint && npm run typecheck && npm run test`

**[ ] Task 3.6: Integrate Database Layer with API Routes Using Verified Schema (RISK-MITIGATED)** - **Risk Assessment:** API integration may break existing functionality due to schema mismatches - **Pre-Validation:** - Test each API route individually after DAL integration using verified schema - Verify data formats match expected outputs based on schema audit findings - Check error handling works properly with actual database structure - Validate that API responses conform to client expectations - Ensure database connection uses correct path from schema audit - **Action:** Update API routes to use DAL instead of external scripts, with schema-validated interfaces - **Implementation Strategy:**
```typescript
// In API routes, replace shell calls with DAL calls using verified schema
import { DatabaseAccessLayer } from '$lib/database/dal';
      import { env } from '$lib/server/env';

      // Use database path from schema audit and environment validation
      const dal = new DatabaseAccessLayer(env.DATABASE_PATH);

      // Replace external script calls with DAL methods that use verified schema
      const devices = await dal.getDevices(); // Returns DatabaseDevice[] with confirmed schema
      const signals = await dal.getRecentSignals(100); // Returns DatabaseSignal[] with confirmed schema

      // Transform database objects to API response format
      const apiDevices = devices.map(device => ({
        id: device.device_id,
        mac: device.device_id, // Based on schema audit findings
        type: device.type,
        manufacturer: device.manufacturer || 'Unknown',
        firstSeen: device.first_seen,
        lastSeen: device.last_seen,
        avgPower: device.avg_power,
        freqMin: device.freq_min,
        freqMax: device.freq_max
      }));
      ```
    - **Action:** Create migration plan for gradual API route updates:
      ```typescript
      // Phase 1: Update /api/kismet/devices route
      // Phase 2: Update /api/signals routes
      // Phase 3: Update /api/cleanup routes
      // Phase 4: Remove all external script dependencies
      ```
    - **Rollback Procedure:** If API integration fails, revert to shell script calls and restore original API implementations
    - **Command:** `npm run build && npm run lint && npm run typecheck`
    - **Checkpoint:** All API routes use DAL with verified schema, no external database scripts, all tests pass
    - **Validation Command:** `npm run build && npm run lint && npm run typecheck && npm run test:smoke && npm run test:unit`
