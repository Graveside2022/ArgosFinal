/**
 * Signal interpolation engine for smooth heatmap generation
 * Implements IDW and Kriging interpolation methods
 */

export type InterpolationMethod = 'none' | 'idw' | 'kriging' | 'bilinear';

export interface InterpolationPoint {
	lat: number;
	lon: number;
	intensity: number;
	weight?: number;
	timestamp: number;
}

export interface InterpolationConfig {
	power: number; // IDW power parameter (typically 2)
	searchRadius: number; // Maximum distance to consider neighbors (meters)
	minNeighbors: number; // Minimum neighbors for interpolation
	maxNeighbors: number; // Maximum neighbors to consider
	smoothing: number; // Smoothing factor (0-1)
}

export class SignalInterpolator {
	private defaultConfig: InterpolationConfig = {
		power: 2,
		searchRadius: 100, // 100 meters
		minNeighbors: 3,
		maxNeighbors: 12,
		smoothing: 0.5
	};

	private cache: Map<string, InterpolationPoint[]> = new Map();
	private cacheTimeout = 5000; // 5 seconds
	private worker: Worker | null = null;

	constructor() {
		// Try to initialize web worker for heavy calculations
		if (typeof Worker !== 'undefined') {
			try {
				this.worker = new Worker('/workers/interpolationWorker.js');
			} catch {
				console.warn('Interpolation worker not available, using main thread');
			}
		}
	}

	/**
	 * Interpolate signal points to create a smooth grid
	 */
	async interpolate(
		points: InterpolationPoint[],
		bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
		resolution: number,
		method: InterpolationMethod = 'idw',
		config?: Partial<InterpolationConfig>
	): Promise<InterpolationPoint[]> {
		const finalConfig = { ...this.defaultConfig, ...config };

		// Check cache
		const cacheKey = this.getCacheKey(points, bounds, resolution, method);
		const cached = this.cache.get(cacheKey);
		if (cached) {
			return cached;
		}

		let result: InterpolationPoint[];

		switch (method) {
			case 'none':
				result = points;
				break;
			case 'idw':
				result = await this.interpolateIDW(points, bounds, resolution, finalConfig);
				break;
			case 'kriging':
				result = await this.interpolateKriging(points, bounds, resolution, finalConfig);
				break;
			case 'bilinear':
				result = await this.interpolateBilinear(points, bounds, resolution, finalConfig);
				break;
			default:
				result = points;
		}

		// Cache result
		this.cache.set(cacheKey, result);
		setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

		return result;
	}

	/**
	 * Inverse Distance Weighting interpolation
	 */
	private async interpolateIDW(
		points: InterpolationPoint[],
		bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
		resolution: number,
		config: InterpolationConfig
	): Promise<InterpolationPoint[]> {
		if (this.worker) {
			// Use worker for parallel processing
			return this.interpolateIDWWorker(points, bounds, resolution, config);
		}

		// Main thread fallback
		const grid: InterpolationPoint[] = [];
		const latSteps = Math.ceil(
			this.getDistance(bounds.minLat, bounds.minLon, bounds.maxLat, bounds.minLon) /
				resolution
		);
		const lonSteps = Math.ceil(
			this.getDistance(bounds.minLat, bounds.minLon, bounds.minLat, bounds.maxLon) /
				resolution
		);

		const latStep = (bounds.maxLat - bounds.minLat) / latSteps;
		const lonStep = (bounds.maxLon - bounds.minLon) / lonSteps;

		// Build spatial index for efficient neighbor search
		const spatialIndex = this.buildSpatialIndex(points);

		for (let i = 0; i <= latSteps; i++) {
			for (let j = 0; j <= lonSteps; j++) {
				const lat = bounds.minLat + i * latStep;
				const lon = bounds.minLon + j * lonStep;

				// Find nearby points
				const neighbors = this.findNeighbors(lat, lon, points, spatialIndex, config);

				if (neighbors.length >= config.minNeighbors) {
					const intensity = this.calculateIDW(lat, lon, neighbors, config.power);
					grid.push({ lat, lon, intensity, timestamp: Date.now() });
				}
			}
		}

		return grid;
	}

	/**
	 * Worker-based IDW interpolation
	 */
	private interpolateIDWWorker(
		points: InterpolationPoint[],
		bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
		resolution: number,
		config: InterpolationConfig
	): Promise<InterpolationPoint[]> {
		return new Promise((resolve, reject) => {
			if (!this.worker) {
				reject(new Error('Worker not available'));
				return;
			}

			const messageHandler = (event: MessageEvent) => {
				const data = event.data as { type: string; result?: unknown; error?: string };
				if (data.type === 'idwComplete') {
					if (this.worker) this.worker.removeEventListener('message', messageHandler);
					resolve(data.result as InterpolationPoint[]);
				} else if (data.type === 'error') {
					if (this.worker) this.worker.removeEventListener('message', messageHandler);
					reject(new Error(data.error || 'Unknown error'));
				}
			};

			this.worker.addEventListener('message', messageHandler);
			this.worker.postMessage({
				type: 'interpolateIDW',
				points,
				bounds,
				resolution,
				config
			});
		});
	}

	/**
	 * Calculate IDW value for a single point
	 */
	private calculateIDW(
		lat: number,
		lon: number,
		neighbors: InterpolationPoint[],
		power: number
	): number {
		let weightedSum = 0;
		let weightSum = 0;

		for (const neighbor of neighbors) {
			const distance = this.getDistance(lat, lon, neighbor.lat, neighbor.lon);

			// Avoid division by zero
			if (distance < 0.0001) {
				return neighbor.intensity;
			}

			const weight = Math.pow(1 / distance, power);
			weightedSum += neighbor.intensity * weight;
			weightSum += weight;
		}

		return weightSum > 0 ? weightedSum / weightSum : 0;
	}

	/**
	 * Kriging interpolation (simplified ordinary kriging)
	 */
	private async interpolateKriging(
		points: InterpolationPoint[],
		bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
		resolution: number,
		config: InterpolationConfig
	): Promise<InterpolationPoint[]> {
		// For now, fall back to IDW with adjusted parameters
		// Full kriging implementation would require variogram modeling
		return this.interpolateIDW(points, bounds, resolution, {
			...config,
			power: 3, // Higher power for kriging-like behavior
			smoothing: 0.7
		});
	}

	/**
	 * Bilinear interpolation for regular grids
	 */
	private interpolateBilinear(
		points: InterpolationPoint[],
		bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
		resolution: number,
		_config: InterpolationConfig
	): Promise<InterpolationPoint[]> {
		// Create initial sparse grid from points
		const sparseGrid = this.createSparseGrid(points, bounds, resolution);

		// Fill in missing values with bilinear interpolation
		return Promise.resolve(this.fillBilinear(sparseGrid, bounds, resolution));
	}

	/**
	 * Create sparse grid from irregular points
	 */
	private createSparseGrid(
		points: InterpolationPoint[],
		bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
		resolution: number
	): Map<string, InterpolationPoint> {
		const grid = new Map<string, InterpolationPoint>();

		// Snap points to grid
		points.forEach((point) => {
			const gridLat = this.snapToGrid(point.lat, bounds.minLat, resolution, true);
			const gridLon = this.snapToGrid(point.lon, bounds.minLon, resolution, false);
			const key = `${gridLat},${gridLon}`;

			// Average if multiple points in same cell
			const existing = grid.get(key);
			if (existing) {
				existing.intensity = (existing.intensity + point.intensity) / 2;
			} else {
				grid.set(key, {
					lat: gridLat,
					lon: gridLon,
					intensity: point.intensity,
					timestamp: point.timestamp
				});
			}
		});

		return grid;
	}

	/**
	 * Fill sparse grid using bilinear interpolation
	 */
	private fillBilinear(
		sparseGrid: Map<string, InterpolationPoint>,
		bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
		resolution: number
	): InterpolationPoint[] {
		const filled: InterpolationPoint[] = [];
		const latSteps = Math.ceil(
			this.getDistance(bounds.minLat, bounds.minLon, bounds.maxLat, bounds.minLon) /
				resolution
		);
		const lonSteps = Math.ceil(
			this.getDistance(bounds.minLat, bounds.minLon, bounds.minLat, bounds.maxLon) /
				resolution
		);

		const latStep = (bounds.maxLat - bounds.minLat) / latSteps;
		const lonStep = (bounds.maxLon - bounds.minLon) / lonSteps;

		for (let i = 0; i <= latSteps; i++) {
			for (let j = 0; j <= lonSteps; j++) {
				const lat = bounds.minLat + i * latStep;
				const lon = bounds.minLon + j * lonStep;
				const key = `${lat},${lon}`;

				// Check if we have a value
				const existing = sparseGrid.get(key);
				if (existing) {
					filled.push(existing);
				} else {
					// Find surrounding points for bilinear interpolation
					const corners = this.findBilinearCorners(
						lat,
						lon,
						sparseGrid,
						latStep,
						lonStep
					);
					if (corners) {
						const intensity = this.bilinearInterpolate(lat, lon, corners);
						filled.push({ lat, lon, intensity, timestamp: Date.now() });
					}
				}
			}
		}

		return filled;
	}

	/**
	 * Find corner points for bilinear interpolation
	 */
	private findBilinearCorners(
		_lat: number,
		_lon: number,
		_grid: Map<string, InterpolationPoint>,
		_latStep: number,
		_lonStep: number
	): {
		q11: InterpolationPoint;
		q12: InterpolationPoint;
		q21: InterpolationPoint;
		q22: InterpolationPoint;
	} | null {
		// Implementation would find the four surrounding grid points
		// For now, return null to skip interpolation
		return null;
	}

	/**
	 * Perform bilinear interpolation
	 */
	private bilinearInterpolate(
		_lat: number,
		_lon: number,
		_corners: {
			q11: InterpolationPoint;
			q12: InterpolationPoint;
			q21: InterpolationPoint;
			q22: InterpolationPoint;
		}
	): number {
		// Standard bilinear interpolation formula
		// Q11, Q12, Q21, Q22 are the four corner values
		// This is a placeholder - full implementation would calculate weights
		return 0.5;
	}

	/**
	 * Build spatial index for efficient neighbor search
	 */
	private buildSpatialIndex(points: InterpolationPoint[]): Map<string, InterpolationPoint[]> {
		const index = new Map<string, InterpolationPoint[]>();
		const cellSize = 0.001; // ~100m at equator

		points.forEach((point) => {
			const cellLat = Math.floor(point.lat / cellSize);
			const cellLon = Math.floor(point.lon / cellSize);

			// Add to multiple cells for overlap
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					const key = `${cellLat + i},${cellLon + j}`;
					if (!index.has(key)) {
						index.set(key, []);
					}
					const cell = index.get(key);
					if (cell) cell.push(point);
				}
			}
		});

		return index;
	}

	/**
	 * Find neighbors efficiently using spatial index
	 */
	private findNeighbors(
		lat: number,
		lon: number,
		points: InterpolationPoint[],
		spatialIndex: Map<string, InterpolationPoint[]>,
		config: InterpolationConfig
	): InterpolationPoint[] {
		const cellSize = 0.001;
		const cellLat = Math.floor(lat / cellSize);
		const cellLon = Math.floor(lon / cellSize);
		const key = `${cellLat},${cellLon}`;

		const candidates = spatialIndex.get(key) || [];

		// Calculate distances and filter
		const neighbors = candidates
			.map((point) => ({
				point,
				distance: this.getDistance(lat, lon, point.lat, point.lon)
			}))
			.filter((item) => item.distance <= config.searchRadius)
			.sort((a, b) => a.distance - b.distance)
			.slice(0, config.maxNeighbors)
			.map((item) => item.point);

		return neighbors;
	}

	/**
	 * Calculate distance between two points in meters
	 */
	private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const R = 6371e3; // Earth's radius in meters
		const φ1 = (lat1 * Math.PI) / 180;
		const φ2 = (lat2 * Math.PI) / 180;
		const Δφ = ((lat2 - lat1) * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	/**
	 * Snap coordinate to grid
	 */
	private snapToGrid(coord: number, min: number, resolution: number, isLat: boolean): number {
		const metersPerDegree = isLat ? 111320 : 111320 * Math.cos((coord * Math.PI) / 180);
		const step = resolution / metersPerDegree;
		return min + Math.round((coord - min) / step) * step;
	}

	/**
	 * Generate cache key
	 */
	private getCacheKey(
		points: InterpolationPoint[],
		bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
		resolution: number,
		method: string
	): string {
		// Simple hash based on parameters
		const pointsHash = points.length;
		const boundsHash = `${bounds.minLat},${bounds.maxLat},${bounds.minLon},${bounds.maxLon}`;
		return `${method}-${resolution}-${boundsHash}-${pointsHash}`;
	}

	/**
	 * Clear interpolation cache
	 */
	clearCache(): void {
		this.cache.clear();
	}

	/**
	 * Destroy interpolator and clean up resources
	 */
	destroy(): void {
		this.clearCache();
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}
	}
}
