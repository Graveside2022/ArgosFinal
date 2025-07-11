import Database from 'better-sqlite3';
import { env } from '$lib/server/env';
import { logInfo, logDebug } from '$lib/utils/logger';

// Create logger adapter to match expected interface
const logger = {
  debug: (message: string) => logDebug(message, { component: 'Database' }),
  info: (message: string) => logInfo(message, { component: 'Database' })
};

export const db = new Database(env.DATABASE_PATH, { verbose: logger.debug.bind(logger) });
db.pragma('journal_mode = WAL');
logger.info('Database connection established successfully.');