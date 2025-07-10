import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { KismetProxy } from '$lib/server/kismet';

export const GET: RequestHandler = async ({ fetch }) => {
	try {
		// Get current GPS position
		let baseLat = 50.083933333;
		let baseLon = 8.274061667;

		try {
			const gpsResponse = await fetch('/api/gps/position');
			if (gpsResponse.ok) {
				const gpsData = (await gpsResponse.json()) as Record<string, unknown>;
				if (gpsData.success && gpsData.data) {
					baseLat = (gpsData.data as Record<string, unknown>).latitude as number;
					baseLon = (gpsData.data as Record<string, unknown>).longitude as number;
				}
			}
		} catch {
			console.warn('Could not get GPS position, using defaults');
		}

		// Try different Kismet API approaches
		let devices: unknown[] = [];
		let error: string | null = null;

		// Method 1: Try the KismetProxy getDevices method
		try {
			console.warn('Attempting to fetch devices from Kismet using KismetProxy...');
			const kismetDevices = await KismetProxy.getDevices();

			// Transform Kismet devices to our format
			devices = kismetDevices.map((device: unknown) => {
				const rawSignal = ((device as Record<string, unknown>).signal as number) || -100;
				const rawType = (device as Record<string, unknown>).type as string;

				return {
					mac: (device as Record<string, unknown>).mac as string,
					last_seen: new Date(
						(device as Record<string, unknown>).lastSeen as string
					).getTime(),
					signal: {
						last_signal: rawSignal,
						max_signal: rawSignal,
						min_signal: rawSignal
					},
					manufacturer:
						((device as Record<string, unknown>).manufacturer as string) || 'Unknown',
					type: rawType?.toLowerCase() || 'unknown',
					channel: ((device as Record<string, unknown>).channel as number) || 0,
					frequency:
						(((device as Record<string, unknown>).channel as number) || 0) * 5 + 2400, // Convert channel to freq
					packets: ((device as Record<string, unknown>).packets as number) || 0,
					datasize: ((device as Record<string, unknown>).packets as number) || 0,
					location: {
						lat:
							((
								(device as Record<string, unknown>).location as Record<
									string,
									unknown
								>
							)?.lat as number) || baseLat + (Math.random() - 0.5) * 0.002,
						lon:
							((
								(device as Record<string, unknown>).location as Record<
									string,
									unknown
								>
							)?.lon as number) || baseLon + (Math.random() - 0.5) * 0.002
					}
				};
			});

			console.warn(`Successfully fetched ${devices.length} devices from Kismet`);
		} catch (err: unknown) {
			error = (err as { message?: string }).message || 'Unknown error';
			console.error('KismetProxy.getDevices failed:', error);

			// Method 2: Try direct REST API endpoints
			try {
				console.warn('Attempting direct Kismet REST API...');

				// Try the last-time endpoint
				const timestamp = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
				const response = await KismetProxy.proxyGet(
					`/devices/last-time/${timestamp}/devices.json`
				);

				if (Array.isArray(response)) {
					// Debug: log first device to see signal structure
					if (response.length > 0) {
						console.warn(
							'Sample device signal data:',
							(response[0] as Record<string, unknown>)['kismet.device.base.signal']
						);
					}
					devices = response.map((device: unknown) => {
						const rawSignal =
							typeof (device as Record<string, unknown>)[
								'kismet.device.base.signal'
							] === 'object'
								? ((
										(device as Record<string, unknown>)[
											'kismet.device.base.signal'
										] as Record<string, unknown>
									)['kismet.common.signal.last_signal'] as number) ||
									((
										(device as Record<string, unknown>)[
											'kismet.device.base.signal'
										] as Record<string, unknown>
									)['kismet.common.signal.max_signal'] as number) ||
									-100
								: ((device as Record<string, unknown>)[
										'kismet.device.base.signal'
									] as number) || -100;
						const rawType =
							((device as Record<string, unknown>)[
								'kismet.device.base.type'
							] as string) || 'Unknown';

						return {
							mac:
								((device as Record<string, unknown>)[
									'kismet.device.base.macaddr'
								] as string) || 'Unknown',
							last_seen:
								(((device as Record<string, unknown>)[
									'kismet.device.base.last_time'
								] as number) || 0) * 1000,
							signal: {
								last_signal: rawSignal,
								max_signal: rawSignal,
								min_signal: rawSignal
							},
							manufacturer:
								((device as Record<string, unknown>)[
									'kismet.device.base.manuf'
								] as string) || 'Unknown',
							type: rawType.toLowerCase(),
							channel:
								((device as Record<string, unknown>)[
									'kismet.device.base.channel'
								] as number) || 0,
							frequency:
								(((device as Record<string, unknown>)[
									'kismet.device.base.channel'
								] as number) || 0) *
									5 +
								2400,
							packets:
								((device as Record<string, unknown>)[
									'kismet.device.base.packets.total'
								] as number) || 0,
							datasize:
								((device as Record<string, unknown>)[
									'kismet.device.base.packets.total'
								] as number) || 0,
							location: {
								lat:
									((
										(device as Record<string, unknown>)[
											'kismet.device.base.location'
										] as Record<string, unknown>
									)?.['kismet.common.location.lat'] as number) ||
									baseLat + (Math.random() - 0.5) * 0.002,
								lon:
									((
										(device as Record<string, unknown>)[
											'kismet.device.base.location'
										] as Record<string, unknown>
									)?.['kismet.common.location.lon'] as number) ||
									baseLon + (Math.random() - 0.5) * 0.002
							}
						};
					});

					console.warn(`Fetched ${devices.length} devices via last-time endpoint`);
					error = null;
				}
			} catch (err2: unknown) {
				console.error('Direct REST API failed:', (err2 as { message?: string }).message);

				// Method 3: Try simple devices endpoint
				try {
					const simpleResponse = await KismetProxy.proxyGet(
						'/devices/summary/devices.json'
					);
					if (Array.isArray(simpleResponse)) {
						devices = simpleResponse.slice(0, 50).map((device: unknown) => {
							const rawSignal =
								typeof (device as Record<string, unknown>)[
									'kismet.device.base.signal'
								] === 'object'
									? ((
											(device as Record<string, unknown>)[
												'kismet.device.base.signal'
											] as Record<string, unknown>
										)['kismet.common.signal.last_signal'] as number) ||
										((
											(device as Record<string, unknown>)[
												'kismet.device.base.signal'
											] as Record<string, unknown>
										)['kismet.common.signal.max_signal'] as number) ||
										-100
									: ((device as Record<string, unknown>)[
											'kismet.device.base.signal'
										] as number) || -100;
							const rawType =
								((device as Record<string, unknown>)[
									'kismet.device.base.type'
								] as string) || 'Unknown';

							return {
								mac:
									((device as Record<string, unknown>)[
										'kismet.device.base.macaddr'
									] as string) || 'Unknown',
								last_seen:
									(((device as Record<string, unknown>)[
										'kismet.device.base.last_time'
									] as number) || 0) * 1000,
								signal: {
									last_signal: rawSignal,
									max_signal: rawSignal,
									min_signal: rawSignal
								},
								manufacturer:
									((device as Record<string, unknown>)[
										'kismet.device.base.manuf'
									] as string) || 'Unknown',
								type: rawType.toLowerCase(),
								channel:
									((device as Record<string, unknown>)[
										'kismet.device.base.channel'
									] as number) || 0,
								frequency:
									(((device as Record<string, unknown>)[
										'kismet.device.base.channel'
									] as number) || 0) *
										5 +
									2400,
								packets:
									((device as Record<string, unknown>)[
										'kismet.device.base.packets.total'
									] as number) || 0,
								datasize:
									((device as Record<string, unknown>)[
										'kismet.device.base.packets.total'
									] as number) || 0,
								location: {
									lat: baseLat + (Math.random() - 0.5) * 0.002,
									lon: baseLon + (Math.random() - 0.5) * 0.002
								}
							};
						});
						error = null;
					}
				} catch (err3: unknown) {
					console.error(
						'Summary endpoint failed:',
						(err3 as { message?: string }).message
					);
				}
			}
		}

		// If all methods failed, return the real device MACs we see in logs as fallback
		if (devices.length === 0 && error) {
			console.warn('All Kismet API methods failed, using fallback devices from logs');
			devices = [
				{
					mac: '92:D8:CF:44:9C:F6',
					last_seen: Date.now(),
					signal: {
						last_signal: -65,
						max_signal: -65,
						min_signal: -65
					},
					manufacturer: 'Unknown',
					type: 'wifi',
					channel: 6,
					frequency: 2437,
					packets: Math.floor(Math.random() * 1000),
					datasize: Math.floor(Math.random() * 1000),
					location: {
						lat: baseLat + (Math.random() - 0.5) * 0.002,
						lon: baseLon + (Math.random() - 0.5) * 0.002
					}
				},
				{
					mac: 'F0:AF:85:A9:F8:86',
					last_seen: Date.now(),
					signal: {
						last_signal: -72,
						max_signal: -72,
						min_signal: -72
					},
					manufacturer: 'Unknown',
					type: 'wifi',
					channel: 11,
					frequency: 2462,
					packets: Math.floor(Math.random() * 500),
					datasize: Math.floor(Math.random() * 500),
					location: {
						lat: baseLat + (Math.random() - 0.5) * 0.002,
						lon: baseLon + (Math.random() - 0.5) * 0.002
					}
				},
				{
					mac: '88:71:B1:95:65:3A',
					last_seen: Date.now(),
					signal: {
						last_signal: -55,
						max_signal: -55,
						min_signal: -55
					},
					manufacturer: 'ARRIS',
					type: 'wifi ap',
					channel: 1,
					frequency: 2412,
					packets: Math.floor(Math.random() * 2000),
					datasize: Math.floor(Math.random() * 2000),
					location: {
						lat: baseLat + (Math.random() - 0.5) * 0.002,
						lon: baseLon + (Math.random() - 0.5) * 0.002
					}
				},
				{
					mac: 'B0:D8:88:31:C0:04',
					last_seen: Date.now(),
					signal: {
						last_signal: -78,
						max_signal: -78,
						min_signal: -78
					},
					manufacturer: 'Mobile Device',
					type: 'wifi client',
					channel: 6,
					frequency: 2437,
					packets: Math.floor(Math.random() * 300),
					datasize: Math.floor(Math.random() * 300),
					location: {
						lat: baseLat + (Math.random() - 0.5) * 0.002,
						lon: baseLon + (Math.random() - 0.5) * 0.002
					}
				}
			];
		}

		console.warn(`Returning ${devices.length} devices (real: ${!error}, fallback: ${!!error})`);
		return json({
			devices,
			error: error || null,
			source: error ? 'fallback' : 'kismet'
		});
	} catch (error: unknown) {
		console.error('Error in Kismet devices endpoint:', error);
		return json({ devices: [], error: (error as { message?: string }).message });
	}
};
