import Database from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export function runMigrations(db: Database.Database, migrationsPath: string) {
	// Create migrations tracking table if not exists
	db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT UNIQUE NOT NULL,
      applied_at INTEGER NOT NULL
    )
  `);

	// Get list of applied migrations
	const appliedMigrations = new Set(
		(db.prepare('SELECT filename FROM migrations').all() as Array<{ filename: string }>).map(
			(row) => row.filename
		)
	);

	// Get all migration files
	const migrationFiles = readdirSync(migrationsPath)
		.filter((file) => file.endsWith('.sql'))
		.sort(); // Ensure migrations run in order

	// Apply pending migrations
	const applyMigration = db.transaction((filename: string, sql: string) => {
		db.exec(sql);
		db.prepare('INSERT INTO migrations (filename, applied_at) VALUES (?, ?)').run(
			filename,
			Date.now()
		);
		// Migration applied successfully
	});

	for (const filename of migrationFiles) {
		if (!appliedMigrations.has(filename)) {
			const sql = readFileSync(join(migrationsPath, filename), 'utf-8');
			applyMigration(filename, sql);
		}
	}
}
