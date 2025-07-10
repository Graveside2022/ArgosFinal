import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logError, logSuccess, logSection } from './test-logger.js';

logSection('Testing SQLite database implementation...');

// Create test database
const db = new Database('./test_rf_signals.db');
db.pragma('journal_mode = WAL');

try {
  // Load schema
  const schemaPath = join(process.cwd(), 'src/lib/server/db/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  logSuccess('✓ Schema loaded successfully');

  // Test signal insertion
  const insertSignal = db.prepare(`
    INSERT INTO signals (
      signal_id, device_id, timestamp, latitude, longitude, 
      power, frequency, source
    ) VALUES (
      @signal_id, @device_id, @timestamp, @latitude, @longitude,
      @power, @frequency, @source
    )
  `);

  const testSignal = {
    signal_id: 'test_' + Date.now(),
    device_id: 'test_device_1',
    timestamp: Date.now(),
    latitude: 40.7128,
    longitude: -74.0060,
    power: -65,
    frequency: 2412,
    source: 'hackrf'
  };

  insertSignal.run(testSignal);
  logSuccess('✓ Signal inserted successfully');

  // Test spatial query
  const findSignals = db.prepare(`
    SELECT * FROM signals
    WHERE CAST(latitude * 10000 AS INTEGER) BETWEEN @lat_min AND @lat_max
      AND CAST(longitude * 10000 AS INTEGER) BETWEEN @lon_min AND @lon_max
    ORDER BY timestamp DESC
    LIMIT 10
  `);

  const results = findSignals.all({
    lat_min: 407120,
    lat_max: 407130,
    lon_min: -740070,
    lon_max: -740050
  });

  logSuccess(`✓ Spatial query returned ${results.length} results`);

  // Test device aggregation
  const deviceStats = db.prepare(`
    SELECT COUNT(DISTINCT device_id) as device_count,
           AVG(power) as avg_power,
           COUNT(*) as signal_count
    FROM signals
  `).get();

  logSuccess(`✓ Device stats: ${deviceStats.device_count} devices, ${deviceStats.signal_count} signals`);

  // Test views
  const activeDevices = db.prepare('SELECT COUNT(*) as count FROM active_devices').get();
  logSuccess(`✓ Active devices view works: ${activeDevices.count} active devices`);

  logSuccess('✅ All database tests passed!');

} catch (error) {
  logError(`❌ Database test failed: ${error.message}`);
} finally {
  db.close();
  // Clean up test database
  const fs = await import('fs');
  try {
    fs.unlinkSync('./test_rf_signals.db');
    fs.unlinkSync('./test_rf_signals.db-wal');
    fs.unlinkSync('./test_rf_signals.db-shm');
  } catch {
    // Ignore cleanup errors
  }
}