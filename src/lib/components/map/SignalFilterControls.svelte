<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		signalFilter,
		type FilteringOptions,
		DRONE_FREQUENCY_BANDS,
		INTERFERENCE_BANDS
	} from '$lib/services/map/signalFiltering';
	import { type DroneDetectionResult } from '$lib/services/map/droneDetection';

	export let signalCount = 0;
	export let filteredCount = 0;
	export let showControls = true;

	const dispatch = createEventDispatcher();

	// Filter settings
	let filterOptions: FilteringOptions = {
		minPower: -80,
		maxPower: 0,
		gridSize: 50,
		aggregationMethod: 'weighted',
		timeWindow: 30000 as number,
		maxSignalsPerArea: 10,
		priorityMode: 'anomalous',
		droneFrequencies: true,
		movingSignalsOnly: false
	};

	// Quick presets
	const filterPresets = {
		'drone-surveillance': {
			name: 'Drone Surveillance',
			description: 'Focus on drone control and video frequencies',
			options: {
				droneFrequencies: true,
				minPower: -70,
				priorityMode: 'anomalous',
				movingSignalsOnly: false,
				maxSignalsPerArea: 20
			}
		},
		'high-priority': {
			name: 'High Priority Only',
			description: 'Show only strongest and most anomalous signals',
			options: {
				minPower: -60,
				priorityMode: 'strongest',
				maxSignalsPerArea: 5,
				timeWindow: 10000
			}
		},
		'movement-tracking': {
			name: 'Movement Tracking',
			description: 'Focus on moving signals only',
			options: {
				movingSignalsOnly: true,
				minPower: -75,
				priorityMode: 'newest',
				timeWindow: 60000
			}
		},
		'dense-reduction': {
			name: 'Dense Area Reduction',
			description: 'Aggressive filtering for crowded areas',
			options: {
				gridSize: 100,
				maxSignalsPerArea: 3,
				aggregationMethod: 'max',
				minPower: -70
			}
		}
	};

	let selectedPreset = 'drone-surveillance';
	let showAdvanced = false;
	let droneDetectionEnabled = true;
	let droneResults: DroneDetectionResult | null = null;

	// Frequency band toggles
	let enabledBands = new Map<string, boolean>();

	// Initialize the Map with proper type safety
	DRONE_FREQUENCY_BANDS.forEach((band) => enabledBands.set(band.name, true));
	INTERFERENCE_BANDS.forEach((band) => enabledBands.set(band.name, false));

	// Apply filter preset
	function applyPreset(presetKey: string) {
		if (presetKey in filterPresets) {
			const preset = filterPresets[presetKey as keyof typeof filterPresets];
			filterOptions = { ...filterOptions, ...preset.options };
			selectedPreset = presetKey;
			applyFilters();
		}
	}

	// Apply current filters
	function applyFilters() {
		// Update frequency bands based on toggles
		const enabledFreqBands = [...DRONE_FREQUENCY_BANDS, ...INTERFERENCE_BANDS].filter((band) =>
			enabledBands.get(band.name)
		);

		const excludedFreqBands = [...DRONE_FREQUENCY_BANDS, ...INTERFERENCE_BANDS].filter(
			(band) => !enabledBands.get(band.name)
		);

		const options: FilteringOptions = {
			...filterOptions,
			frequencyBands: filterOptions.droneFrequencies ? undefined : enabledFreqBands,
			excludeBands: filterOptions.droneFrequencies ? undefined : excludedFreqBands
		};

		signalFilter.setOptions(options);

		dispatch('filterChange', {
			options,
			droneDetection: droneDetectionEnabled
		});
	}

	// Handle slider changes with debouncing
	let updateTimer: ReturnType<typeof setTimeout> | undefined;
	function handleSliderChange() {
		if (updateTimer) clearTimeout(updateTimer);
		updateTimer = setTimeout(applyFilters, 300);
	}

	// Update drone detection results
	export function updateDroneResults(results: DroneDetectionResult) {
		droneResults = results;
	}

	// Initialize
	applyPreset(selectedPreset);
</script>

<div class="signal-filter-controls {showControls ? 'expanded' : 'collapsed'}">
	<div class="controls-header">
		<button
			class="toggle-btn"
			on:click={() => (showControls = !showControls)}
			aria-label="Toggle filter controls"
		>
			<svg
				class="w-4 h-4 transform transition-transform {showControls ? 'rotate-180' : ''}"
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
				/>
			</svg>
		</button>

		<div class="header-info">
			<h3 class="text-sm font-semibold text-white">Signal Filtering</h3>
			<div class="signal-counts">
				<span class="count-badge total">{signalCount}</span>
				<svg
					class="w-4 h-4 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 7l5 5m0 0l-5 5m5-5H6"
					/>
				</svg>
				<span class="count-badge filtered">{filteredCount}</span>
				{#if signalCount > 0}
					<span class="reduction-badge">
						-{Math.round((1 - filteredCount / signalCount) * 100)}%
					</span>
				{/if}
			</div>
		</div>
	</div>

	{#if showControls}
		<div class="controls-body">
			<!-- Quick Presets -->
			<div class="preset-section">
				<label class="section-label">Quick Presets</label>
				<div class="preset-grid">
					{#each Object.entries(filterPresets) as [key, preset]}
						<button
							class="preset-btn {selectedPreset === key ? 'active' : ''}"
							on:click={() => applyPreset(key)}
							title={preset.description}
						>
							{preset.name}
						</button>
					{/each}
				</div>
			</div>

			<!-- Signal Strength Filter -->
			<div class="filter-section">
				<label class="section-label">Signal Strength (dBm)</label>
				<div class="range-slider">
					<input
						type="range"
						min="-100"
						max="0"
						bind:value={filterOptions.minPower}
						on:input={handleSliderChange}
						class="slider min-slider"
					/>
					<input
						type="range"
						min="-100"
						max="0"
						bind:value={filterOptions.maxPower}
						on:input={handleSliderChange}
						class="slider max-slider"
					/>
					<div class="range-values">
						<span>{filterOptions.minPower}</span>
						<span>to</span>
						<span>{filterOptions.maxPower}</span>
					</div>
				</div>
			</div>

			<!-- Spatial Aggregation -->
			<div class="filter-section">
				<label class="section-label">Spatial Aggregation</label>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<label class="sub-label">Grid Size (m)</label>
						<select
							bind:value={filterOptions.gridSize}
							on:change={applyFilters}
							class="select-input"
						>
							<option value={25}>25m (Fine)</option>
							<option value={50}>50m (Default)</option>
							<option value={100}>100m (Coarse)</option>
							<option value={200}>200m (Very Coarse)</option>
						</select>
					</div>
					<div>
						<label class="sub-label">Max per Cell</label>
						<input
							type="number"
							min="1"
							max="50"
							bind:value={filterOptions.maxSignalsPerArea}
							on:change={applyFilters}
							class="number-input"
						/>
					</div>
				</div>
			</div>

			<!-- Priority Mode -->
			<div class="filter-section">
				<label class="section-label">Priority Mode</label>
				<select
					bind:value={filterOptions.priorityMode}
					on:change={applyFilters}
					class="select-input"
				>
					<option value="anomalous">Anomalous Signals</option>
					<option value="strongest">Strongest Signals</option>
					<option value="newest">Newest Signals</option>
					<option value="persistent">Persistent Signals</option>
				</select>
			</div>

			<!-- Drone Detection -->
			<div class="filter-section">
				<label class="flex items-center space-x-2 cursor-pointer">
					<input
						type="checkbox"
						bind:checked={droneDetectionEnabled}
						on:change={applyFilters}
						class="checkbox"
					/>
					<span class="text-sm text-gray-300">Enable Drone Detection</span>
				</label>

				{#if droneDetectionEnabled && droneResults}
					<div class="drone-stats">
						<div class="stat-item">
							<span class="stat-label">Active Drones:</span>
							<span class="stat-value">{droneResults.activeDrones.length}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Alerts:</span>
							<span class="stat-value alerts">{droneResults.alerts.length}</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Movement Filter -->
			<div class="filter-section">
				<label class="flex items-center space-x-2 cursor-pointer">
					<input
						type="checkbox"
						bind:checked={filterOptions.movingSignalsOnly}
						on:change={applyFilters}
						class="checkbox"
					/>
					<span class="text-sm text-gray-300">Moving Signals Only</span>
				</label>
			</div>

			<!-- Advanced Options -->
			<button class="advanced-toggle" on:click={() => (showAdvanced = !showAdvanced)}>
				{showAdvanced ? 'Hide' : 'Show'} Advanced Options
				<svg
					class="w-4 h-4 ml-1 transform transition-transform {showAdvanced
						? 'rotate-180'
						: ''}"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fill-rule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					/>
				</svg>
			</button>

			{#if showAdvanced}
				<div class="advanced-section">
					<!-- Frequency Bands -->
					<div class="filter-section">
						<label class="section-label">Frequency Bands</label>
						<div class="frequency-toggles">
							<div class="freq-group">
								<h4 class="freq-group-title">Drone Frequencies</h4>
								{#each DRONE_FREQUENCY_BANDS as band}
									<label class="freq-toggle">
										<input
											type="checkbox"
											checked={enabledBands.get(band.name)}
											on:change={(e) => {
												enabledBands.set(
													band.name,
													e.currentTarget.checked
												);
												applyFilters();
											}}
											class="checkbox"
										/>
										<span class="freq-label">
											{band.name}
											<span class="freq-range"
												>({band.minFreq}-{band.maxFreq} MHz)</span
											>
										</span>
									</label>
								{/each}
							</div>

							<div class="freq-group">
								<h4 class="freq-group-title">Common Interference</h4>
								{#each INTERFERENCE_BANDS as band}
									<label class="freq-toggle">
										<input
											type="checkbox"
											checked={enabledBands.get(band.name)}
											on:change={(e) => {
												enabledBands.set(
													band.name,
													e.currentTarget.checked
												);
												applyFilters();
											}}
											class="checkbox"
										/>
										<span class="freq-label">
											{band.name}
											<span class="freq-range"
												>({band.minFreq}-{band.maxFreq} MHz)</span
											>
										</span>
									</label>
								{/each}
							</div>
						</div>
					</div>

					<!-- Temporal Settings -->
					<div class="filter-section">
						<label class="section-label">Temporal Settings</label>
						<div class="grid grid-cols-2 gap-2">
							<div>
								<label class="sub-label">Time Window (s)</label>
								<input
									type="number"
									min="5"
									max="300"
									value={filterOptions.timeWindow / 1000}
									on:change={(e) => {
										filterOptions.timeWindow =
											parseInt(e.currentTarget.value) * 1000;
										applyFilters();
									}}
									class="number-input"
								/>
							</div>
							<div>
								<label class="sub-label">Aggregation</label>
								<select
									bind:value={filterOptions.aggregationMethod}
									on:change={applyFilters}
									class="select-input"
								>
									<option value="max">Maximum</option>
									<option value="avg">Average</option>
									<option value="weighted">Weighted</option>
									<option value="density">Density</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.signal-filter-controls {
		@apply bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg;
		@apply transition-all duration-300;
		max-width: 320px;
	}

	.signal-filter-controls.collapsed {
		@apply bg-gray-900/90;
	}

	.controls-header {
		@apply p-3 flex items-center space-x-3;
	}

	.toggle-btn {
		@apply p-1 rounded hover:bg-gray-800 transition-colors;
		@apply text-gray-400 hover:text-white;
	}

	.header-info {
		@apply flex-1;
	}

	.signal-counts {
		@apply flex items-center space-x-2 mt-1;
	}

	.count-badge {
		@apply px-2 py-0.5 rounded text-xs font-mono;
	}

	.count-badge.total {
		@apply bg-gray-700 text-gray-300;
	}

	.count-badge.filtered {
		@apply bg-cyan-600/20 text-cyan-400 border border-cyan-600/30;
	}

	.reduction-badge {
		@apply px-2 py-0.5 rounded text-xs font-bold;
		@apply bg-green-600/20 text-green-400 border border-green-600/30;
	}

	.controls-body {
		@apply px-3 pb-3 space-y-3;
	}

	.preset-section {
		@apply space-y-2;
	}

	.preset-grid {
		@apply grid grid-cols-2 gap-2;
	}

	.preset-btn {
		@apply px-3 py-2 rounded text-xs font-medium;
		@apply bg-gray-800 text-gray-300 hover:bg-gray-700;
		@apply border border-gray-700 hover:border-gray-600;
		@apply transition-all duration-200;
	}

	.preset-btn.active {
		@apply bg-cyan-600/20 text-cyan-400 border-cyan-600/50;
		@apply hover:bg-cyan-600/30 hover:border-cyan-600/70;
	}

	.filter-section {
		@apply space-y-2;
	}

	.section-label {
		@apply block text-sm font-medium text-gray-300;
	}

	.sub-label {
		@apply block text-xs text-gray-400 mb-1;
	}

	.range-slider {
		@apply relative h-12;
	}

	.slider {
		@apply absolute w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer;
		top: 50%;
		transform: translateY(-50%);
	}

	.slider::-webkit-slider-thumb {
		@apply appearance-none w-4 h-4 bg-cyan-500 rounded-full cursor-pointer;
		@apply hover:bg-cyan-400 transition-colors;
	}

	.range-values {
		@apply absolute bottom-0 left-0 right-0;
		@apply flex items-center justify-center space-x-2;
		@apply text-xs text-gray-400;
	}

	.select-input {
		@apply w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded;
		@apply text-sm text-white focus:border-cyan-500 focus:outline-none;
	}

	.number-input {
		@apply w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded;
		@apply text-sm text-white focus:border-cyan-500 focus:outline-none;
	}

	.checkbox {
		@apply w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded;
		@apply focus:ring-cyan-500 focus:ring-offset-0;
	}

	.drone-stats {
		@apply mt-2 p-2 bg-gray-800/50 rounded border border-gray-700;
		@apply grid grid-cols-2 gap-2;
	}

	.stat-item {
		@apply flex items-center justify-between;
	}

	.stat-label {
		@apply text-xs text-gray-400;
	}

	.stat-value {
		@apply text-sm font-bold text-white;
	}

	.stat-value.alerts {
		@apply text-orange-400;
	}

	.advanced-toggle {
		@apply w-full px-3 py-2 mt-2 flex items-center justify-center;
		@apply text-sm text-gray-400 hover:text-white;
		@apply bg-gray-800/50 hover:bg-gray-800 rounded;
		@apply transition-colors duration-200;
	}

	.advanced-section {
		@apply mt-3 pt-3 border-t border-gray-800;
		@apply space-y-3;
	}

	.frequency-toggles {
		@apply space-y-3;
	}

	.freq-group {
		@apply space-y-1;
	}

	.freq-group-title {
		@apply text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1;
	}

	.freq-toggle {
		@apply flex items-center space-x-2 cursor-pointer py-1;
		@apply hover:bg-gray-800/50 rounded px-1;
	}

	.freq-label {
		@apply text-xs text-gray-300;
	}

	.freq-range {
		@apply text-gray-500 ml-1;
	}
</style>
