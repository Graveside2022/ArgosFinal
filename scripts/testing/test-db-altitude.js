// Test script to verify altitude field in database
import { getRFDatabase } from './src/lib/server/db/database.js';
import { logError, logSuccess, logData, logSection } from './test-logger.js';

const db = getRFDatabase();

// Test signal with altitude
const testSignal = {
  id: `test_altitude_${Date.now()}`,
  lat: 37.7749,
  lon: -122.4194,
  frequency: 2450.5,
  power: -65,
  timestamp: Date.now(),
  altitude: 150.5, // 150.5 meters altitude
  source: 'hackrf',
  metadata: {
    signalType: 'test',
    description: 'Testing altitude field'
  }
};

logSection('Testing database with altitude field...');
logData(`Test signal: ${JSON.stringify(testSignal, null, 2)}`);

try {
  // Insert single signal
  const count = db.insertSignalsBatch([testSignal]);
  logSuccess(`✓ Inserted ${count} signal(s) with altitude`);
  
  // Query the signal back
  const results = db.findSignalsInRadius(testSignal.lat, testSignal.lon, 1000, 60);
  logSuccess(`✓ Found ${results.length} signal(s) in radius query`);
  
  if (results.length > 0) {
    const foundSignal = results[0];
    logData(`Retrieved signal: ${JSON.stringify({
      id: foundSignal.signal_id,
      altitude: foundSignal.altitude,
      lat: foundSignal.latitude,
      lon: foundSignal.longitude
    }, null, 2)}`);
    
    if (foundSignal.altitude !== undefined) {
      logSuccess('✓ Altitude field is properly stored and retrieved');
    } else {
      logError('✗ Altitude field is missing!');
    }
  }
  
  logSuccess('Database schema test completed successfully!');
} catch (error) {
  logError(`✗ Database test failed: ${error.message}`);
  process.exit(1);
}

// Close database
db.close();
process.exit(0);