### INITIATIVE 7: REFINE THE API WITH A FORMAL SERVICE LAYER (RISK-MITIGATED)

- **Problem:** The API route at `src/routes/api/kismet/devices/+server.ts` contains complex logic: it fetches from multiple external endpoints, handles fallbacks, and transforms data. This mixing of concerns makes the code hard to read, hard to test, and not reusable.
- **Solution:** We will create a dedicated `KismetService` to encapsulate all this business logic. The API route will become a thin, clean "controller" whose only job is to handle the HTTP request and response, delegating the real work to the service.
- **Key Risks Addressed:** Service Layer Coupling, CSS Class Conflicts, Rollback Procedure Gaps

**[ ] Task 7.1: Locate and Validate KismetProxy (RISK-MITIGATED)** - **Risk Assessment:** KismetProxy dependency is referenced but not clearly defined or located - **Pre-Validation:** - Search for KismetProxy definition: `find . -name "*.ts" -o -name "*.js" | xargs grep -l "KismetProxy" | head -10` - Check if KismetProxy is imported in existing API routes - Verify KismetProxy.getDevices() and KismetProxy.proxyGet() methods exist - Test KismetProxy functionality against actual Kismet server - **Action:** Create comprehensive KismetProxy interface documentation - **Implementation:**
`typescript
      // Document required KismetProxy interface:
      export interface KismetProxyInterface {
        getDevices(): Promise<any[]>;
        proxyGet(endpoint: string): Promise<any>;
        // Add other methods as discovered
      }
      ` - **Action:** Create or locate KismetProxy implementation file - **Rollback Procedure:** If KismetProxy is missing, create stub implementation for development - **Checkpoint:** KismetProxy must be functional and accessible before service layer work - **Validation Command:** `grep -r "KismetProxy" src/ --include="*.ts" --include="*.js"`

**[ ] Task 7.2: Create the Kismet Service (RISK-MITIGATED)** - **Risk Assessment:** Service layer refactoring may break existing API functionality - **Pre-Validation:** - Test existing API endpoint functionality before refactoring - Document current API response format and behavior - Create backup of original API implementation - Verify all external dependencies (KismetProxy, GPS API) are working - **Action:** Create `src/lib/server/services/kismet.service.ts` - **Rollback Procedure:** - Restore original API route implementation if service layer fails - Remove service layer dependencies if they cause errors - Revert to embedded business logic if service abstraction breaks - **Action:** Create `src/lib/server/services/kismet.service.ts`. - **Action:** Add the following complete, refactored code to the file. This code is a direct translation of the logic currently in your API route.
```typescript
import { env } from '$lib/server/env';
      import logger from '$lib/server/logger';
import { KismetProxy } from '$lib/server/kismet';

      // Define a type for the transformed device for type safety
      export interface KismetDevice {
          id: string;
          mac: string;
          name: string;
          type: string;
          signal: number;
          channel: number;
          firstSeen: number;
          lastSeen: number;
          lat: number;
          lon: number;
          packets: number;
          manufacturer: string;
          encryption: string[];
      }

      class KismetService {
        private async getGpsPosition(fetch: typeof globalThis.fetch): Promise<{ lat: number; lon: number }> {
            try {
                const gpsResponse = await fetch('/api/gps/position');
                if (gpsResponse.ok) {
                    const gpsData = await gpsResponse.json();
                    if (gpsData.success && gpsData.data) {
                        return { lat: gpsData.data.latitude, lon: gpsData.data.longitude };
                    }
                }
            } catch (err) {
                logger.warn({ err }, 'Could not get GPS position, using defaults.');
            }
            return { lat: 50.083933333, lon: 8.274061667 };
        }

        public async getActiveDevices(fetch: typeof globalThis.fetch): Promise<{ devices: KismetDevice[], error: string | null, source: 'kismet' | 'fallback' }> {
            const { lat: baseLat, lon: baseLon } = await this.getGpsPosition(fetch);

            try {
                logger.info('Attempting to fetch devices from Kismet...');
                const timestamp = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
                const kismetDevices = await KismetProxy.proxyGet(`/devices/last-time/${timestamp}/devices.json`) as any[];

                if (Array.isArray(kismetDevices)) {
                    const devices = kismetDevices.map((d: any): KismetDevice => ({
                        id: (d['kismet.device.base.macaddr'] || 'unknown').replace(/:/g, ''),
                        mac: d['kismet.device.base.macaddr'] || 'Unknown',
                        name: d['kismet.device.base.name'] || 'Unknown Device',
                        type: d['kismet.device.base.type'] || 'Unknown',
                        signal: d['kismet.device.base.signal']?.['kismet.common.signal.last_signal'] || -100,
                        channel: d['kismet.device.base.channel'] || 0,
                        firstSeen: (d['kismet.device.base.first_time'] || 0) * 1000,
                        lastSeen: (d['kismet.device.base.last_time'] || 0) * 1000,
                        lat: d['kismet.device.base.location']?.['kismet.common.location.lat'] || baseLat + (Math.random() - 0.5) * 0.002,
                        lon: d['kismet.device.base.location']?.['kismet.common.location.lon'] || baseLon + (Math.random() - 0.5) * 0.002,
                        packets: d['kismet.device.base.packets.total'] || 0,
                        manufacturer: d['kismet.device.base.manuf'] || 'Unknown',
                        encryption: []
                    }));
                    logger.info(`Successfully fetched ${devices.length} devices from Kismet.`);
                    return { devices, error: null, source: 'kismet' };
                }
                throw new Error("Received non-array response from Kismet");
            } catch (err) {
                logger.error({ err }, 'Failed to fetch devices from Kismet. Using fallback data.');
                const fallbackDevices = this.getFallbackDevices(baseLat, baseLon);
                return { devices: fallbackDevices, error: (err as Error).message, source: 'fallback' };
            }
        }

        private getFallbackDevices(baseLat: number, baseLon: number): KismetDevice[] {
            return [
                { id: '92D8CF449CF6', mac: '92:D8:CF:44:9C:F6', name: 'Fallback Device 1', type: 'Wi-Fi', signal: -65, channel: 6, firstSeen: Date.now() - 300000, lastSeen: Date.now(), lat: baseLat + (Math.random() - 0.5) * 0.002, lon: baseLon + (Math.random() - 0.5) * 0.002, packets: 100, manufacturer: 'Fallback', encryption: [] },
                { id: 'F0AF85A9F886', mac: 'F0:AF:85:A9:F8:86', name: 'Fallback AP', type: 'Wi-Fi AP', signal: -55, channel: 1, firstSeen: Date.now() - 600000, lastSeen: Date.now(), lat: baseLat + (Math.random() - 0.5) * 0.002, lon: baseLon + (Math.random() - 0.5) * 0.002, packets: 200, manufacturer: 'Fallback', encryption: ['WPA2'] },
            ];
        }
      }

      export const kismetService = new KismetService();
      ```
    - **Checkpoint:** The service file must exist and contain the complete, refactored logic.

**[ ] Task 7.2: Refactor the Kismet API Endpoint (RISK-MITIGATED)** - **Risk Assessment:** API endpoint refactoring may break existing client functionality - **Pre-Validation:** - Test current API endpoint with actual clients (tactical map, etc.) - Verify response format matches client expectations - Document all current API behaviors and edge cases - **Action:** Rewrite `src/routes/api/kismet/devices/+server.ts` to be a simple controller that delegates to the service. - **Rollback Procedure:** - Restore original endpoint implementation if clients break - Keep service layer but revert to original endpoint if needed - Test all dependent components after refactoring
```typescript
import { json } from '@sveltejs/kit';
import { kismetService } from '$lib/server/services/kismet.service';
      import type { RequestHandler } from './$types';

      export const GET: RequestHandler = async ({ fetch }) => {
        // The try/catch is no longer needed here, as the global
        // error handler will catch any exceptions from the service.
        const result = await kismetService.getActiveDevices(fetch);
        return json(result);
      };
      ```
    - **Checkpoint:** The `/api/kismet/devices` endpoint must function identically to before the refactor.

**[ ] Task 7.3: Create Unit Tests for New Layers (RISK-MITIGATED)** - **Risk Assessment:** New architectural layers may have untested edge cases or failures - **Pre-Validation:** - Verify test directory structure exists: `ls -la tests/unit/` - Check that vitest is properly configured for unit testing - Create test data fixtures for database operations - **Action:** Create comprehensive unit tests for Data Access Layer - **Implementation:** Create `tests/unit/signals.repository.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseAccessLayer } from '../../../src/lib/server/database/dal';
import { createTestDatabase } from '../helpers/testDatabase';

      describe('DatabaseAccessLayer', () => {
        let dal: DatabaseAccessLayer;
        let testDb: any;

        beforeEach(async () => {
          testDb = await createTestDatabase();
          dal = new DatabaseAccessLayer(testDb.path);
        });

        afterEach(async () => {
          await testDb.cleanup();
        });

        it('should retrieve devices from database', async () => {
          const devices = await dal.getDevices();
          expect(Array.isArray(devices)).toBe(true);
        });

        it('should handle database cleanup operations', async () => {
          await expect(dal.cleanup()).resolves.not.toThrow();
        });

        it('should handle connection errors gracefully', async () => {
          const invalidDal = new DatabaseAccessLayer('/invalid/path');
          await expect(invalidDal.getDevices()).rejects.toThrow();
        });
      });
      ```
    - **Action:** Create service layer unit tests at `tests/unit/kismet.service.test.ts`:
      ```typescript
      import { describe, it, expect, vi } from 'vitest';
      import { KismetService } from '../../../src/lib/server/services/kismet.service';

      describe('KismetService', () => {
        it('should handle successful device retrieval', async () => {
          const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => ({ success: true, data: { latitude: 50.0, longitude: 8.0 } })
          });

          const service = new KismetService();
          const result = await service.getActiveDevices(mockFetch);

          expect(result).toHaveProperty('devices');
          expect(result).toHaveProperty('error');
          expect(result).toHaveProperty('source');
        });

        it('should fallback gracefully when Kismet is unavailable', async () => {
          const mockFetch = vi.fn().mockRejectedValue(new Error('Connection failed'));

          const service = new KismetService();
          const result = await service.getActiveDevices(mockFetch);

          expect(result.source).toBe('fallback');
          expect(result.devices.length).toBeGreaterThan(0);
        });
      });
      ```
    - **Rollback Procedure:** If tests reveal critical issues, halt service layer deployment
    - **Checkpoint:** All unit tests must pass before proceeding with integration
    - **Validation Command:** `npm run test:unit && npm run build`
