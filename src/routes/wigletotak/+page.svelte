<script lang="ts">
	import { onMount } from 'svelte';
	import { logError, logInfo, logWarn } from '$lib/utils/logger';
	
	// Type definitions for API responses
	interface ApiResponse {
		status: string;
		message?: string;
	}
	
	interface TakSettingsResponse extends ApiResponse {
		data?: unknown;
	}
	
	interface MulticastStateResponse extends ApiResponse {
		enabled?: boolean;
	}
	
	interface AnalysisModeResponse extends ApiResponse {
		mode?: string;
	}
	
	interface AntennaSettingsResponse extends ApiResponse {
		antenna_type?: string;
		custom_factor?: number;
	}
	
	interface WigleFilesResponse extends ApiResponse {
		files?: string[];
	}
	
	interface BroadcastResponse extends ApiResponse {
		data?: unknown;
	}
	
	interface WhitelistResponse extends ApiResponse {
		data?: unknown;
	}
	
	interface BlacklistResponse extends ApiResponse {
		data?: unknown;
	}
	
	// State variables
	let activeTab = 'settings';
	let isConnected = false;
	let isBroadcasting = false;
	
	// TAK Settings
	let takServerIp = '0.0.0.0';
	let takServerPort = '6666';
	let multicastEnabled = false;
	
	// Analysis Mode
	let analysisMode = 'realtime';
	
	// Antenna Settings
	let antennaType = 'Standard';
	let customSensitivity = '1.0';
	
	// Directory Settings
	let wigleDirectory = '/home/pi/kismet_ops';
	let wigleFiles: string[] = [];
	let selectedFile = '';
	
	// Whitelist/Blacklist
	let whitelistSSID = '';
	let whitelistMAC = '';
	let blacklistSSID = '';
	let blacklistMAC = '';
	let blacklistColor = '-65281';
	
	// API functions
	async function updateTakSettings() {
		try {
			const response = await fetch('http://100.68.185.86:8000/update_tak_settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tak_server_ip: takServerIp,
					tak_server_port: parseInt(takServerPort)
				})
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as TakSettingsResponse;
			if (data.status === 'success') {
				alert('TAK settings updated successfully');
				logInfo('TAK settings updated successfully', { takServerIp, takServerPort });
			} else {
				logWarn('TAK settings update failed', { response: data });
				alert('Failed to update TAK settings');
			}
		} catch (error) {
			logError('Error updating TAK settings', { error: error instanceof Error ? error.message : String(error) });
			alert('Failed to update TAK settings');
		}
	}
	
	async function updateMulticastState() {
		try {
			const response = await fetch('http://100.68.185.86:8000/update_multicast_state', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ enabled: multicastEnabled })
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as MulticastStateResponse;
			logInfo('Multicast state updated', { enabled: multicastEnabled, response: data });
		} catch (error) {
			logError('Error updating multicast state', { error: error instanceof Error ? error.message : String(error) });
		}
	}
	
	async function updateAnalysisMode() {
		try {
			const response = await fetch('http://100.68.185.86:8000/update_analysis_mode', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mode: analysisMode })
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as AnalysisModeResponse;
			logInfo('Analysis mode updated', { mode: analysisMode, response: data });
		} catch (error) {
			logError('Error updating analysis mode', { error: error instanceof Error ? error.message : String(error) });
		}
	}
	
	async function updateAntennaSensitivity() {
		try {
			const response = await fetch('http://100.68.185.86:8000/update_antenna_sensitivity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					antenna_type: antennaType,
					custom_factor: antennaType === 'Custom' ? parseFloat(customSensitivity) : null
				})
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as AntennaSettingsResponse;
			if (data.status === 'success') {
				alert('Antenna sensitivity updated successfully');
				logInfo('Antenna sensitivity updated successfully', { antennaType, customSensitivity });
			} else {
				logWarn('Antenna sensitivity update failed', { response: data });
				alert('Failed to update antenna sensitivity');
			}
		} catch (error) {
			logError('Error updating antenna sensitivity', { error: error instanceof Error ? error.message : String(error) });
			alert('Failed to update antenna sensitivity');
		}
	}
	
	async function loadAntennaSettings() {
		try {
			const response = await fetch('http://100.68.185.86:8000/get_antenna_settings');
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as AntennaSettingsResponse;
			if (data.antenna_type) {
				antennaType = data.antenna_type;
				if (data.custom_factor) {
					customSensitivity = data.custom_factor.toString();
				}
				logInfo('Antenna settings loaded', { antennaType, customSensitivity });
			}
		} catch (error) {
			logError('Error loading antenna settings', { error: error instanceof Error ? error.message : String(error) });
		}
	}
	
	async function listWigleFiles() {
		try {
			const response = await fetch(`http://100.68.185.86:8000/list_wigle_files?directory=${encodeURIComponent(wigleDirectory)}`, {
				mode: 'cors',
				headers: {
					'Accept': 'application/json'
				}
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as WigleFilesResponse;
			if (data.files) {
				wigleFiles = data.files;
				if (wigleFiles.length > 0 && !selectedFile) {
					selectedFile = wigleFiles[0];
				}
				logInfo('Wigle files listed', { directory: wigleDirectory, fileCount: wigleFiles.length });
			}
		} catch (error) {
			logError('Error listing files', { error: error instanceof Error ? error.message : String(error) });
			// Don't show alert on initial load
		}
	}
	
	async function startBroadcast() {
		if (!selectedFile) {
			alert('Please select a file to broadcast');
			return;
		}
		
		try {
			const response = await fetch('http://100.68.185.86:8000/start_broadcast', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					directory: wigleDirectory,
					filename: selectedFile
				})
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as BroadcastResponse;
			if (data.status === 'success') {
				isBroadcasting = true;
				logInfo('Broadcast started successfully', { directory: wigleDirectory, filename: selectedFile });
			} else {
				logWarn('Broadcast start failed', { response: data });
				alert('Failed to start broadcast');
			}
		} catch (error) {
			logError('Error starting broadcast', { error: error instanceof Error ? error.message : String(error) });
			alert('Failed to start broadcast');
		}
	}
	
	async function stopBroadcast() {
		try {
			const response = await fetch('http://100.68.185.86:8000/stop_broadcast', {
				method: 'POST'
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as BroadcastResponse;
			if (data.status === 'success') {
				isBroadcasting = false;
				logInfo('Broadcast stopped successfully');
			} else {
				logWarn('Broadcast stop failed', { response: data });
				alert('Failed to stop broadcast');
			}
		} catch (error) {
			logError('Error stopping broadcast', { error: error instanceof Error ? error.message : String(error) });
			alert('Failed to stop broadcast');
		}
	}
	
	async function addToWhitelist() {
		if (!whitelistSSID && !whitelistMAC) {
			alert('Please enter an SSID or MAC address');
			return;
		}
		
		try {
			const response = await fetch('http://100.68.185.86:8000/add_to_whitelist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ssid: whitelistSSID || null,
					mac: whitelistMAC || null
				})
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as WhitelistResponse;
			if (data.status === 'success') {
				alert('Added to whitelist');
				logInfo('Added to whitelist', { ssid: whitelistSSID, mac: whitelistMAC });
				whitelistSSID = '';
				whitelistMAC = '';
			} else {
				logWarn('Add to whitelist failed', { response: data });
				alert('Failed to add to whitelist');
			}
		} catch (error) {
			logError('Error adding to whitelist', { error: error instanceof Error ? error.message : String(error) });
			alert('Failed to add to whitelist');
		}
	}
	
	async function addToBlacklist() {
		if (!blacklistSSID && !blacklistMAC) {
			alert('Please enter an SSID or MAC address');
			return;
		}
		
		try {
			const response = await fetch('http://100.68.185.86:8000/add_to_blacklist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ssid: blacklistSSID || null,
					mac: blacklistMAC || null,
					argbColor: parseInt(blacklistColor)
				})
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json() as BlacklistResponse;
			if (data.status === 'success') {
				alert('Added to blacklist');
				logInfo('Added to blacklist', { ssid: blacklistSSID, mac: blacklistMAC, color: blacklistColor });
				blacklistSSID = '';
				blacklistMAC = '';
			} else {
				logWarn('Add to blacklist failed', { response: data });
				alert('Failed to add to blacklist');
			}
		} catch (error) {
			logError('Error adding to blacklist', { error: error instanceof Error ? error.message : String(error) });
			alert('Failed to add to blacklist');
		}
	}
	
	onMount(() => {
		void loadAntennaSettings();
		// Don't auto-list files on mount to avoid CORS errors
		// User will click "List Files" button when ready
	});
</script>

<div class="wigletotak-container">
	<!-- Header -->
	<div class="wigletotak-header">
		<div class="flex items-center justify-between mb-6">
			<a href="/" class="text-gray-400 hover:text-white transition-colors">
				← Back to Console
			</a>
			<div class="flex items-center gap-3">
				<span class="text-sm {isConnected ? 'text-green-500' : 'text-red-500'}">
					● {isConnected ? 'Connected' : 'Disconnected'}
				</span>
			</div>
		</div>
		
		<h1 class="page-title">
			<span class="highlight">Wigle</span>ToTAK
		</h1>
		<p class="page-subtitle">WiFi Device Tracker & TAK Broadcaster</p>
		
		<!-- Status Row -->
		<div class="flex justify-center gap-6 mt-6">
			<div class="status-item">
				<span class="status-label">TAK:</span>
				<span class="{isBroadcasting ? 'text-green-500' : 'text-gray-500'}">
					{isBroadcasting ? 'Broadcasting' : 'Inactive'}
				</span>
			</div>
			<div class="status-item">
				<span class="status-label">Mode:</span>
				<span class="text-blue-500">{analysisMode === 'realtime' ? 'Real-time' : 'Post-collection'}</span>
			</div>
		</div>
	</div>
	
	<!-- Main Content -->
	<div class="main-content">
		<!-- Tab Navigation -->
		<div class="tab-navigation">
			<button 
				class="tab-button {activeTab === 'settings' ? 'active' : ''}"
				on:click={() => activeTab = 'settings'}
			>
				⚙️ Settings
			</button>
			<button 
				class="tab-button {activeTab === 'devices' ? 'active' : ''}"
				on:click={() => activeTab = 'devices'}
			>
				📱 Devices
			</button>
			<button 
				class="tab-button {activeTab === 'filters' ? 'active' : ''}"
				on:click={() => activeTab = 'filters'}
			>
				🔧 Filters
			</button>
			<button 
				class="tab-button {activeTab === 'messages' ? 'active' : ''}"
				on:click={() => activeTab = 'messages'}
			>
				💬 Messages
			</button>
		</div>
		
		<!-- Tab Content -->
		<div class="tab-content">
			{#if activeTab === 'settings'}
				<div class="settings-grid">
					<!-- TAK Settings Card -->
					<div class="settings-card">
						<h3 class="card-title">TAK Server Settings</h3>
						<div class="form-group">
							<label for="takServerIp">Server IP</label>
							<input id="takServerIp" type="text" bind:value={takServerIp} placeholder="0.0.0.0" />
						</div>
						<div class="form-group">
							<label for="takServerPort">Server Port</label>
							<input id="takServerPort" type="number" bind:value={takServerPort} placeholder="6666" />
						</div>
						<div class="checkbox-group">
							<label>
								<input type="checkbox" bind:checked={multicastEnabled} on:change={() => void updateMulticastState()} />
								<span>Enable Multicast (239.2.3.1:6969)</span>
							</label>
						</div>
						<button class="btn btn-primary" on:click={() => void updateTakSettings()}>
							Save Settings
						</button>
					</div>
					
					<!-- Analysis Mode Card -->
					<div class="settings-card">
						<h3 class="card-title">Analysis Mode</h3>
						<div class="radio-group">
							<label>
								<input type="radio" bind:group={analysisMode} value="realtime" on:change={() => void updateAnalysisMode()} />
								<span>Real-time Analysis</span>
							</label>
							<label>
								<input type="radio" bind:group={analysisMode} value="postcollection" on:change={() => void updateAnalysisMode()} />
								<span>Post-collection Analysis</span>
							</label>
						</div>
						<p class="help-text">
							Real-time: Continuously monitors and broadcasts new devices<br>
							Post-collection: Processes entire file in chunks
						</p>
					</div>
					
					<!-- Antenna Settings Card -->
					<div class="settings-card">
						<h3 class="card-title">Antenna Sensitivity</h3>
						<div class="form-group">
							<label for="antennaType">Antenna Type</label>
							<select id="antennaType" bind:value={antennaType}>
								<option value="Standard">Standard (1.0x)</option>
								<option value="Alfa Card">Alfa Card (1.5x)</option>
								<option value="High Gain">High Gain (2.0x)</option>
								<option value="RPi Internal">RPi Internal (0.7x)</option>
								<option value="Custom">Custom</option>
							</select>
						</div>
						{#if antennaType === 'Custom'}
							<div class="form-group">
								<label for="customSensitivity">Custom Factor</label>
								<input id="customSensitivity" type="number" bind:value={customSensitivity} step="0.1" placeholder="1.0" />
							</div>
						{/if}
						<button class="btn btn-primary" on:click={() => void updateAntennaSensitivity()}>
							Save Antenna Settings
						</button>
					</div>
					
					<!-- Directory Settings Card -->
					<div class="settings-card">
						<h3 class="card-title">Wigle CSV Directory</h3>
						<div class="form-group">
							<label for="wigleDirectory">Directory Path</label>
							<div class="input-with-button">
								<input id="wigleDirectory" type="text" bind:value={wigleDirectory} placeholder="/home/pi/kismet_ops" />
								<button class="btn btn-secondary" on:click={() => void listWigleFiles()}>
									List Files
								</button>
							</div>
						</div>
						{#if wigleFiles.length > 0}
							<div class="form-group">
								<label for="selectedFile">Select File</label>
								<select id="selectedFile" bind:value={selectedFile}>
									{#each wigleFiles as file}
										<option value={file}>{file}</option>
									{/each}
								</select>
							</div>
							<div class="button-group">
								<button class="btn btn-success" on:click={() => void startBroadcast()} disabled={isBroadcasting}>
									Start Broadcast
								</button>
								<button class="btn btn-danger" on:click={() => void stopBroadcast()} disabled={!isBroadcasting}>
									Stop Broadcast
								</button>
							</div>
						{/if}
					</div>
				</div>
			{:else if activeTab === 'devices'}
				<div class="empty-state">
					<p>Device listing not yet implemented</p>
				</div>
			{:else if activeTab === 'filters'}
				<div class="filters-grid">
					<!-- Whitelist Card -->
					<div class="filter-card">
						<h3 class="card-title">Whitelist</h3>
						<div class="form-group">
							<label for="whitelistSSID">SSID</label>
							<input id="whitelistSSID" type="text" bind:value={whitelistSSID} placeholder="Network name" />
						</div>
						<div class="form-group">
							<label for="whitelistMAC">MAC Address</label>
							<input id="whitelistMAC" type="text" bind:value={whitelistMAC} placeholder="00:00:00:00:00:00" />
						</div>
						<button class="btn btn-primary" on:click={() => void addToWhitelist()}>
							Add to Whitelist
						</button>
					</div>
					
					<!-- Blacklist Card -->
					<div class="filter-card">
						<h3 class="card-title">Blacklist</h3>
						<div class="form-group">
							<label for="blacklistSSID">SSID</label>
							<input id="blacklistSSID" type="text" bind:value={blacklistSSID} placeholder="Network name" />
						</div>
						<div class="form-group">
							<label for="blacklistMAC">MAC Address</label>
							<input id="blacklistMAC" type="text" bind:value={blacklistMAC} placeholder="00:00:00:00:00:00" />
						</div>
						<div class="form-group">
							<label for="blacklistColor">Color</label>
							<select id="blacklistColor" bind:value={blacklistColor}>
								<option value="-65536">Red</option>
								<option value="-256">Yellow</option>
								<option value="-16776961">Blue</option>
								<option value="-23296">Orange</option>
								<option value="-65281">Purple</option>
							</select>
						</div>
						<button class="btn btn-primary" on:click={() => void addToBlacklist()}>
							Add to Blacklist
						</button>
					</div>
				</div>
			{:else if activeTab === 'messages'}
				<div class="empty-state">
					<p>Message history not yet implemented</p>
				</div>
			{/if}
		</div>
		
		<!-- Instructions Panel -->
		<div class="instructions-panel">
			<h4>Configuration Instructions</h4>
			<ul>
				<li>• TAK Server: Set to 0.0.0.0 for all interfaces or specific IP</li>
				<li>• Multicast: Sends to standard TAK multicast address</li>
				<li>• Antenna sensitivity adjusts signal strength calculations</li>
				<li>• Select .wiglecsv files from Kismet output directory</li>
			</ul>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	
	.wigletotak-container {
		min-height: 100vh;
		background: #0a0a0a;
		color: #fff;
		font-family: Inter, system-ui, -apple-system, sans-serif;
	}
	
	.wigletotak-header {
		background: rgba(20, 20, 20, 0.8);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid #262626;
		padding: 2rem;
		position: relative;
		text-align: center;
	}
	
	.page-title {
		font-size: 2.5rem;
		font-weight: 800;
		text-align: center;
		margin-bottom: 0.5rem;
	}
	
	.highlight {
		color: #fb923c;
	}
	
	.page-subtitle {
		text-align: center;
		color: #a3a3a3;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 0;
	}
	
	.status-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
	}
	
	.status-label {
		color: #737373;
	}
	
	.main-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.tab-navigation {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		border-bottom: 1px solid #262626;
		padding-bottom: 1rem;
	}
	
	.tab-button {
		background: none;
		border: none;
		color: #737373;
		font-size: 1rem;
		font-weight: 500;
		padding: 0.5rem 1rem;
		cursor: pointer;
		transition: color 0.2s;
		font-family: inherit;
	}
	
	.tab-button:hover {
		color: #a3a3a3;
	}
	
	.tab-button.active {
		color: #fb923c;
		border-bottom: 2px solid #fb923c;
	}
	
	.tab-content {
		margin-bottom: 2rem;
	}
	
	.settings-grid, .filters-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}
	
	.settings-card, .filter-card {
		background: #141414;
		border: 1px solid #262626;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
	
	.card-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #fb923c;
	}
	
	.form-group {
		margin-bottom: 1rem;
	}
	
	.form-group label {
		display: block;
		font-size: 0.875rem;
		color: #a3a3a3;
		margin-bottom: 0.25rem;
	}
	
	.form-group input[type="text"],
	.form-group input[type="number"],
	.form-group select {
		width: 100%;
		background: #0a0a0a;
		border: 1px solid #262626;
		border-radius: 0.25rem;
		padding: 0.5rem;
		color: #fff;
		font-family: inherit;
	}
	
	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #fb923c;
	}
	
	.checkbox-group,
	.radio-group {
		margin-bottom: 1rem;
	}
	
	.checkbox-group label,
	.radio-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #a3a3a3;
		cursor: pointer;
		margin-bottom: 0.5rem;
	}
	
	.input-with-button {
		display: flex;
		gap: 0.5rem;
	}
	
	.input-with-button input {
		flex: 1;
	}
	
	.button-group {
		display: flex;
		gap: 0.5rem;
	}
	
	.btn {
		background: #262626;
		border: 1px solid #404040;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
		color: #fff;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
	}
	
	.btn:hover {
		background: #2d2d2d;
	}
	
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.btn-primary {
		background: #fb923c;
		border-color: #fb923c;
		color: #000;
	}
	
	.btn-primary:hover {
		background: #f97316;
	}
	
	.btn-secondary {
		background: #404040;
		border-color: #525252;
	}
	
	.btn-success {
		background: #10b981;
		border-color: #10b981;
		color: #000;
	}
	
	.btn-success:hover {
		background: #059669;
	}
	
	.btn-danger {
		background: #ef4444;
		border-color: #ef4444;
		color: #fff;
	}
	
	.btn-danger:hover {
		background: #dc2626;
	}
	
	.help-text {
		font-size: 0.875rem;
		color: #737373;
		line-height: 1.5;
	}
	
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: #737373;
	}
	
	.instructions-panel {
		background: #141414;
		border: 1px solid #262626;
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-top: 2rem;
	}
	
	.instructions-panel h4 {
		color: #fb923c;
		margin-bottom: 1rem;
	}
	
	.instructions-panel ul {
		list-style: none;
		padding: 0;
		margin: 0;
		color: #a3a3a3;
		font-size: 0.875rem;
		line-height: 1.75;
	}
</style>