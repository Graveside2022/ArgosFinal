import type { SweepConfig, SweepStatus, SpectrumData, HackRFHealth } from './types';
import { EventEmitter } from 'events';
import { spawn, exec, type ChildProcess } from 'child_process';
import { logInfo, logError, logWarn, logDebug } from '$lib/utils/logger';
import { SystemStatus } from '$lib/types/enums';

/**
 * Manages HackRF sweep operations - direct port from SweeperService
 * Maintains exact functionality from the original implementation
 */
export class SweepManager extends EventEmitter {
	// State management
	private status: SweepStatus = { state: SystemStatus.Idle };
	private isRunning = false;
	private isCycling = false;
	private inFrequencyTransition = false;

	// Process management
	private sweepProcess: ChildProcess | null = null;
	private sweepProcessPgid: number | null = null;
	private actualProcessPid: number | null = null;
	private processStartTime: number | null = null;
	private processRegistry = new Map<number, ChildProcess>();
	private processMonitorInterval: ReturnType<typeof setInterval> | null = null;
	private dataTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

	// Frequency cycling
	private frequencies: Array<{ value: number; unit: string }> = [];
	private currentIndex = 0;
	private cycleTime = 10000; // Default 10 seconds
	private cycleTimer: ReturnType<typeof setTimeout> | null = null;
	private switchTimer: ReturnType<typeof setTimeout> | null = null;
	private switchingTime = 3000; // Default 3 seconds

	// Timeouts
	private processTimeout: ReturnType<typeof setTimeout> | null = null;
	private processStartupTimeout: ReturnType<typeof setTimeout> | null = null;
	private processTimeoutMs = 20000; // 20 seconds
	private processStartupDetectionMs = 2500; // 2.5 seconds
	private processHealthCheckIntervalMs = 1000;
	private frequencySwitchTimeoutMs = 15000; // 15 seconds

	// Line buffering for stdout
	private stdoutBuffer = '';
	private maxBufferSize = 1024 * 1024; // 1MB max buffer
	private bufferOverflowCount = 0;

	// Error tracking
	private consecutiveErrors = 0;
	private maxConsecutiveErrors = 8;
	private frequencyErrors = new Map<number, number>();
	private frequencyBlacklist = new Set<number>();
	private recentFailures: number[] = [];
	private maxFailuresPerMinute = 5;

	// Device state tracking
	private deviceState = {
		status: 'unknown' as 'unknown' | 'available' | 'busy' | 'stuck' | 'disconnected',
		lastSuccessfulOperation: null as Date | null,
		consecutiveBusyErrors: 0,
		recoveryState: 'none' as 'none' | 'retrying' | 'escalating' | 'cooling_down'
	};

	// Health monitoring
	private cyclingHealth = {
		status: SystemStatus.Idle,
		processHealth: 'unknown' as string,
		processStartupPhase: 'none' as string,
		lastSwitchTime: null as Date | null,
		lastDataReceived: null as Date | null,
		recovery: {
			recoveryAttempts: 0,
			maxRecoveryAttempts: 3,
			lastRecoveryAttempt: null as Date | null,
			isRecovering: false
		}
	};

	private healthMonitorInterval: ReturnType<typeof setInterval>;
	private isInitialized = false;

	// SSE emitter reference
	private sseEmitter: ((event: string, data: unknown) => void) | null = null;

	constructor() {
		super();

		// Start health monitoring with longer interval
		this.healthMonitorInterval = setInterval(() => {
			this._performHealthCheck().catch((error) => {
				logError('Error performing health check', {
					error: error instanceof Error ? error.message : String(error)
				});
			});
		}, 30000); // Check every 30 seconds instead of 5

		// Perform startup validation
		this._performStartupValidation();
	}

	/**
	 * Set SSE emitter for sending events to clients
	 */
	setSseEmitter(emitter: ((event: string, data: unknown) => void) | null): void {
		this.sseEmitter = emitter;
	}

	/**
	 * Perform startup state validation
	 */
	private _performStartupValidation(): void {
		logInfo('🔍 SweepManager: Performing startup state validation...');

		// Reset all state
		this.isRunning = false;
		this.isCycling = false;
		this.frequencies = [];
		this.currentIndex = 0;
		this.sweepProcess = null;
		this.sweepProcessPgid = null;
		this.inFrequencyTransition = false;

		// Clear any lingering timers
		if (this.cycleTimer) {
			clearTimeout(this.cycleTimer);
			this.cycleTimer = null;
		}

		if (this.switchTimer) {
			clearTimeout(this.switchTimer);
			this.switchTimer = null;
		}

		if (this.processTimeout) {
			clearTimeout(this.processTimeout);
			this.processTimeout = null;
		}

		// Reset error tracking
		this.consecutiveErrors = 0;
		this.recentFailures = [];

		// Clear stdout buffer
		this.stdoutBuffer = '';
		this.bufferOverflowCount = 0;

		// Reset health status
		this.cyclingHealth.status = SystemStatus.Idle;
		this.cyclingHealth.processHealth = 'stopped';
		this.cyclingHealth.lastDataReceived = null;
		this.cyclingHealth.recovery.recoveryAttempts = 0;
		this.cyclingHealth.recovery.lastRecoveryAttempt = null;
		this.cyclingHealth.recovery.isRecovering = false;

		this.isInitialized = true;
		logInfo('✅ SweepManager startup validation complete');
	}

	/**
	 * Perform health check
	 */
	private async _performHealthCheck(): Promise<void> {
		// Only perform health checks if we're actually running
		if (!this.isRunning || !this.sweepProcess) {
			return;
		}

		const now = Date.now();

		// Log health check details
		logInfo('🏥 Health check:', {
			isRunning: this.isRunning,
			hasSweepProcess: !!this.sweepProcess,
			pid: this.actualProcessPid,
			inFrequencyTransition: this.inFrequencyTransition,
			isCycling: this.isCycling,
			lastDataReceived: this.cyclingHealth.lastDataReceived?.toISOString(),
			processStartTime: this.processStartTime
				? new Date(this.processStartTime).toISOString()
				: null,
			recoveryAttempts: this.cyclingHealth.recovery.recoveryAttempts,
			isRecovering: this.cyclingHealth.recovery.isRecovering
		});

		// Check system memory periodically
		try {
			const memInfo = await this._checkSystemMemory();
			logInfo(
				`💾 Memory: ${memInfo.availablePercent}% available (${memInfo.availableMB}MB / ${memInfo.totalMB}MB)`
			);
			if (memInfo.availablePercent < 10) {
				logWarn(`⚠️ Low memory: ${memInfo.availablePercent}% available`);
			}
		} catch (e) {
			logError('Failed to check memory:', { error: (e as Error).message });
		}

		// Check if we're already recovering
		if (this.cyclingHealth.recovery.isRecovering) {
			logInfo('⏳ Already in recovery, skipping health check');
			return;
		}

		// Check multiple health indicators
		let needsRecovery = false;
		let reason = '';

		// 1. Check if process has been running too long without data
		if (this.cyclingHealth.lastDataReceived) {
			const timeSinceData = now - this.cyclingHealth.lastDataReceived.getTime();
			logInfo(`📊 Time since last data: ${Math.round(timeSinceData / 1000)}s`);
			if (timeSinceData > 7200000) {
				// 2 hours without data (changed from 2 minutes for long-term monitoring)
				needsRecovery = true;
				reason = 'No data received for 2 hours';
			}
		} else if (this.processStartTime && now - this.processStartTime > 60000) {
			// No data ever received and process has been running for 60 seconds
			const runTime = Math.round((now - this.processStartTime) / 1000);
			logWarn(`⏱️ Process running for ${runTime}s with no data`);
			needsRecovery = true;
			reason = 'No initial data received';
		}

		// 2. Check if process is stuck (only if we're not in frequency transition)
		// Note: For single frequency mode, we shouldn't trigger this check
		// Disabled runtime limit for long-term monitoring sessions
		// Runtime limit disabled for 4+ hour monitoring sessions
		// if (!this.inFrequencyTransition && this.isCycling && this.processStartTime && now - this.processStartTime > 180000) {
		//   const runTime = Math.round((now - this.processStartTime) / 1000);
		//   logWarn(`⏱️ Process running for ${runTime}s without cycling`);
		//   needsRecovery = true;
		//   reason = 'Process running too long without cycling';
		// }

		// 3. Check if process is still alive
		if (this.sweepProcess && this.actualProcessPid) {
			try {
				// Check if process exists
				process.kill(this.actualProcessPid, 0);
				logInfo(`✅ Process ${this.actualProcessPid} is still alive`);
			} catch {
				// Process no longer exists or cannot be signaled
				needsRecovery = true;
				reason = 'Process no longer exists';
			}
		}

		// Perform recovery if needed
		if (needsRecovery) {
			logWarn(`⚠️ Health check failed: ${reason}`);
			this.cyclingHealth.processHealth = 'unhealthy';
			await this._performRecovery(reason);
		} else if (this.cyclingHealth.lastDataReceived) {
			this.cyclingHealth.processHealth = 'healthy';
		}
	}

	/**
	 * Start a new sweep operation
	 */
	async startSweep(config: SweepConfig): Promise<void> {
		if (this.status.state === SystemStatus.Running) {
			throw new Error('Sweep already in progress');
		}

		// Convert single frequency config to multi-frequency format
		const frequencies = config.frequencies || [
			{
				value: config.centerFrequency,
				unit: 'Hz'
			}
		];

		// Start cycling with configured parameters
		const success = await this.startCycle(frequencies, config.cycleTime || 10000);
		if (!success) {
			throw new Error('Failed to start sweep');
		}
	}

	/**
	 * Start frequency cycling
	 */
	async startCycle(
		frequencies: Array<{ value: number; unit: string }>,
		cycleTime: number
	): Promise<boolean> {
		// Verify service is initialized
		if (!this.isInitialized) {
			logWarn('Service not yet initialized');
			return false;
		}

		// Force cleanup existing processes before starting
		await this._forceCleanupExistingProcesses();

		// Additional startup delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (this.isRunning) {
			this._emitError('Sweep is already running', 'state_check');
			return false;
		}

		if (!frequencies || frequencies.length === 0) {
			this._emitError('No frequencies provided', 'input_validation');
			return false;
		}

		try {
			// Normalize frequencies
			const validatedFreqs = this._normalizeFrequencies(frequencies);

			if (validatedFreqs.length === 0) {
				this._emitError('No valid frequencies provided', 'frequency_validation');
				return false;
			}

			// Check device availability
			logInfo('🔍 Checking HackRF device availability...');
			const deviceCheck = await this._testHackrfAvailability();
			if (!deviceCheck.available) {
				this._emitError(`HackRF not available: ${deviceCheck.reason}`, 'device_check');
				return false;
			}

			// Initialize cycling state
			this.frequencies = validatedFreqs;
			this.currentIndex = 0;
			this.cycleTime = cycleTime || 10000;

			// Dynamically adjust switching time
			this.switchingTime = Math.min(3000, Math.max(500, Math.floor(this.cycleTime * 0.25)));

			this.isCycling = validatedFreqs.length > 1;
			this.isRunning = true;
			this._resetErrorTracking();

			// Update status
			this.status = {
				state: SystemStatus.Running,
				currentFrequency: this._convertToHz(
					validatedFreqs[0].value,
					validatedFreqs[0].unit
				),
				sweepProgress: 0,
				totalSweeps: validatedFreqs.length,
				completedSweeps: 0,
				startTime: Date.now()
			};

			// Emit events
			this._emitEvent('status', this.status);
			this._emitEvent('cycle_config', {
				frequencies: this.frequencies,
				cycleTime: this.cycleTime,
				totalCycleTime: this.frequencies.length * this.cycleTime,
				isCycling: this.isCycling
			});

			// Start the first frequency
			try {
				await this._runNextFrequency();
				return true;
			} catch (runError: unknown) {
				const error = runError as Error;
				logError('❌ Error in _runNextFrequency:', { error: error.message });
				if (error.stack) {
					logError('Stack:', { stack: error.stack });
				}

				// Don't fail the whole cycle start, just log the error
				// The sweep manager status is already set to running
				return true;
			}
		} catch (error: unknown) {
			const err = error as Error;
			this._emitError(`Failed to start cycle: ${err.message}`, 'cycle_startup', err);
			return false;
		}
	}

	/**
	 * Stop the current sweep operation
	 */
	async stopSweep(): Promise<void> {
		logInfo('🛑 Stopping sweep... Current state:', { state: this.status.state });

		// Allow stopping from any state except idle
		if (this.status.state === SystemStatus.Idle) {
			logInfo('Sweep already stopped');
			return;
		}

		this.status.state = SystemStatus.Stopping;
		this._emitEvent('status', this.status);

		// Stop cycling first
		this.isCycling = false;
		this.isRunning = false;
		this.inFrequencyTransition = false;

		// Clear all timers
		if (this.cycleTimer) {
			clearTimeout(this.cycleTimer);
			this.cycleTimer = null;
		}

		if (this.switchTimer) {
			clearTimeout(this.switchTimer);
			this.switchTimer = null;
		}

		if (this.processTimeout) {
			clearTimeout(this.processTimeout);
			this.processTimeout = null;
		}

		if (this.processStartupTimeout) {
			clearTimeout(this.processStartupTimeout);
			this.processStartupTimeout = null;
		}

		// Stop the sweep process
		await this._stopSweepProcess();

		// Clear any remaining state
		this.stdoutBuffer = '';
		this.consecutiveErrors = 0;

		// Update status
		this.status = { state: SystemStatus.Idle };
		this._emitEvent('status', this.status);
		this._emitEvent('status_change', { status: 'stopped' });

		// Force emit idle status to ensure UI updates
		setTimeout(() => {
			this._emitEvent('status', { state: SystemStatus.Idle });
		}, 100);

		logInfo('Sweep stopped successfully');
	}

	/**
	 * Emergency stop - forcefully terminate all operations
	 */
	async emergencyStop(): Promise<void> {
		logWarn('Emergency stop initiated');

		// Force stop everything immediately
		this.isCycling = false;
		this.isRunning = false;
		this.inFrequencyTransition = false;

		// Clear all timers
		const timers = [
			this.cycleTimer,
			this.switchTimer,
			this.processTimeout,
			this.processStartupTimeout,
			this.dataTimeoutTimer
		];

		timers.forEach((timer) => {
			if (timer) clearTimeout(timer);
		});

		this.cycleTimer = null;
		this.switchTimer = null;
		this.processTimeout = null;
		this.processStartupTimeout = null;
		this.dataTimeoutTimer = null;

		// Clear intervals
		if (this.processMonitorInterval) {
			clearInterval(this.processMonitorInterval);
			this.processMonitorInterval = null;
		}

		// Force kill process with all methods available
		if (this.sweepProcess || this.actualProcessPid) {
			try {
				// Try to kill by PID first
				if (this.actualProcessPid) {
					try {
						process.kill(this.actualProcessPid, 'SIGKILL');
						logInfo(`Sent SIGKILL to PID: ${this.actualProcessPid}`);
					} catch {
						logInfo('Process already dead or kill failed');
					}
				}

				// Try to kill process group
				if (this.sweepProcessPgid) {
					try {
						process.kill(-this.sweepProcessPgid, 'SIGKILL');
						logInfo(`Sent SIGKILL to PGID: ${this.sweepProcessPgid}`);
					} catch {
						// Ignore errors
					}
				}
			} catch (e) {
				logError('Emergency kill failed', { error: e }, 'emergency-kill');
			}
		}

		// Clear process references
		this.sweepProcess = null;
		this.sweepProcessPgid = null;
		this.actualProcessPid = null;

		// Force cleanup all hackrf processes
		await this._forceCleanupExistingProcesses();

		// Reset all state
		this.stdoutBuffer = '';
		this.consecutiveErrors = 0;
		this.recentFailures = [];
		this.frequencyErrors.clear();
		this.frequencyBlacklist.clear();

		// Update status
		this.status = { state: SystemStatus.Idle };
		this._emitEvent('status', this.status);
		this._emitEvent('emergency_stop', { timestamp: new Date().toISOString() });

		logInfo('✅ Emergency stop completed');
	}

	/**
	 * Force cleanup of any lingering processes
	 */
	async forceCleanup(): Promise<void> {
		await this._forceCleanupExistingProcesses();
		this.status = { state: SystemStatus.Idle };
	}

	/**
	 * Get current sweep status
	 */
	getStatus(): SweepStatus {
		return { ...this.status };
	}

	/**
	 * Check HackRF device health
	 */
	async checkHealth(): Promise<HackRFHealth> {
		const check = await this._testHackrfAvailability();
		return {
			connected: check.available,
			deviceInfo: check.deviceInfo,
			error: check.available ? undefined : check.reason,
			lastUpdate: Date.now()
		};
	}

	/**
	 * Run the next frequency in the cycle
	 */
	private async _runNextFrequency(): Promise<void> {
		if (!this.isRunning || this.frequencies.length === 0) {
			return;
		}

		const frequency = this.frequencies[this.currentIndex];

		try {
			// Start sweep for this frequency
			await this._startSweepProcess(frequency);

			// Reset recovery attempts on successful start
			this.cyclingHealth.recovery.recoveryAttempts = 0;

			// If cycling, set up timer for next frequency
			if (this.isCycling && this.frequencies.length > 1) {
				this.cycleTimer = setTimeout(() => {
					this._cycleToNextFrequency().catch((error) => {
						logError('Error cycling to next frequency', {
							error: error instanceof Error ? error.message : String(error)
						});
					});
				}, this.cycleTime);
			}
		} catch (error: unknown) {
			logError('❌ Error starting sweep process:', { error: (error as Error).message });
			this._handleSweepError(error as Error, frequency);
		}
	}

	/**
	 * Cycle to the next frequency
	 */
	private async _cycleToNextFrequency(): Promise<void> {
		if (!this.isCycling || !this.isRunning) {
			return;
		}

		// Move to next frequency
		this.currentIndex = (this.currentIndex + 1) % this.frequencies.length;

		// Emit switching status
		const nextFreq = this.frequencies[this.currentIndex];
		this._emitEvent('status_change', {
			status: 'switching',
			nextFrequency: nextFreq
		});

		// Stop current process
		await this._stopSweepProcess();

		// Wait before switching
		this.switchTimer = setTimeout(() => {
			this._runNextFrequency().catch((error) => {
				logError('Error running next frequency', {
					error: error instanceof Error ? error.message : String(error)
				});
			});
		}, this.switchingTime);
	}

	/**
	 * Start the hackrf_sweep process
	 */
	private async _startSweepProcess(frequency: { value: number; unit: string }): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// Convert frequency to MHz
				const centerFreqMHz = this._convertToMHz(frequency.value, frequency.unit);
				const rangeMHz = 10; // Default 10 MHz range
				const freqMinMHz = centerFreqMHz - rangeMHz;
				const freqMaxMHz = centerFreqMHz + rangeMHz;

				// Validate range
				if (freqMinMHz < 1 || freqMaxMHz > 7250) {
					throw new Error(`Frequency ${centerFreqMHz} MHz out of range (1-7250 MHz)`);
				}

				// Prepare arguments
				// Using smaller bin width (20kHz) to reduce memory usage
				const args = [
					'-f',
					`${Math.floor(freqMinMHz)}:${Math.ceil(freqMaxMHz)}`,
					'-g',
					'20',
					'-l',
					'32',
					'-w',
					'20000' // Reduced from 100kHz to 20kHz
				];

				logInfo(`🚀 Starting hackrf_sweep for ${centerFreqMHz} MHz`);
				logInfo(`📋 Command: hackrf_sweep ${args.join(' ')}`);
				logInfo(`📍 Sweep parameters:`, {
					centerFreq: `${frequency.value} ${frequency.unit}`,
					range: `${freqMinMHz} - ${freqMaxMHz} MHz`,
					binWidth: `20000 Hz (20 kHz)`,
					gain: '20 dB',
					lnaGain: '32 dB'
				});

				// Update health state
				this.cyclingHealth.processStartupPhase = 'spawning';
				this.processStartTime = Date.now();

				// Spawn process
				this.sweepProcess = spawn('hackrf_sweep', args, {
					detached: true,
					stdio: ['ignore', 'pipe', 'pipe']
				});

				this.sweepProcessPgid = this.sweepProcess.pid || null;
				this.actualProcessPid = this.sweepProcess.pid || null;

				logInfo(
					`✅ Process spawned with PID: ${this.actualProcessPid}, PGID: ${this.sweepProcessPgid}`
				);

				let processStarted = false;
				let startupTimeout: ReturnType<typeof setTimeout> | null = null;

				// Set startup detection timeout
				startupTimeout = setTimeout(() => {
					if (!processStarted) {
						logInfo('⏰ Startup detection timeout - allowing process to continue');
						processStarted = true;
						resolve();
					}
				}, this.processStartupDetectionMs);

				// Handle stdout
				this.sweepProcess.stdout?.on('data', (data) => {
					if (!processStarted) {
						processStarted = true;
						logInfo('✅ Process startup detected via stdout');
						if (startupTimeout) {
							clearTimeout(startupTimeout);
						}
						resolve();
					}

					// Process output data with buffer overflow protection
					const newData = (data as Buffer).toString();

					// Check buffer size before appending
					if (this.stdoutBuffer.length + newData.length > this.maxBufferSize) {
						logWarn('⚠️ Buffer overflow detected, clearing buffer');
						this.bufferOverflowCount++;
						this.stdoutBuffer = newData; // Reset with just new data

						if (this.bufferOverflowCount > 10) {
							logError(
								'Too many buffer overflows, process may be outputting too fast',
								{ bufferOverflowCount: this.bufferOverflowCount },
								'buffer-overflow'
							);
							this._emitError(
								'Buffer overflow - process outputting too fast',
								'buffer_overflow'
							);
						}
					} else {
						this.stdoutBuffer += newData;
					}

					let newlineIndex;
					while ((newlineIndex = this.stdoutBuffer.indexOf('\n')) >= 0) {
						const line = this.stdoutBuffer.substring(0, newlineIndex).trim();
						this.stdoutBuffer = this.stdoutBuffer.substring(newlineIndex + 1);

						if (line) {
							try {
								this._handleProcessOutputLine(line, frequency);
							} catch (e) {
								logError('Error processing line', { error: e }, 'line-processing');
							}
						}
					}
				});

				// Handle stderr
				this.sweepProcess.stderr?.on('data', (data) => {
					const message = (data as Buffer).toString().trim();
					logWarn(
						'stderr from process',
						{ pid: this.actualProcessPid, message },
						'process-stderr'
					);

					// Check for USB errors that can occur during operation
					if (
						message.includes('libusb_submit_transfer') ||
						message.includes('hackrf_is_streaming') ||
						message.includes('USB error') ||
						message.includes('Device not found') ||
						message.includes('usb_claim_interface error') ||
						message.includes('HACKRF_ERROR')
					) {
						logError('USB/Device error detected', { message }, 'usb-error');
						this._emitError(`USB/Device error: ${message}`, 'usb_error');

						// Log device state
						logInfo(
							'Device state at error',
							{
								status: this.deviceState.status,
								lastSuccessful:
									this.deviceState.lastSuccessfulOperation?.toISOString(),
								consecutiveBusyErrors: this.deviceState.consecutiveBusyErrors
							},
							'device-error-state'
						);

						// Kill the process as it won't recover from USB errors
						if (this.sweepProcess) {
							logInfo('Killing process due to USB error', {}, 'usb-error-kill');
							this.sweepProcess.kill('SIGTERM');
						}
					}

					if (!processStarted && this._isCriticalStartupError(message)) {
						logError('Critical startup error detected', { message }, 'startup-error');
						if (startupTimeout) {
							clearTimeout(startupTimeout);
						}
						reject(new Error(message));
					}
				});

				// Handle process exit
				this.sweepProcess.on('exit', (code, signal) => {
					logInfo(
						'Process exit event',
						{
							code,
							signal,
							pid: this.actualProcessPid,
							state: {
								isRunning: this.isRunning,
								inFrequencyTransition: this.inFrequencyTransition
							},
							recovery: {
								attempts: this.cyclingHealth.recovery.recoveryAttempts,
								maxAttempts: this.cyclingHealth.recovery.maxRecoveryAttempts
							}
						},
						'process-exit'
					);

					// Log more details about the exit
					let exitReason = 'Unknown';
					if (code === 137 || signal === 'SIGKILL') {
						exitReason = 'Process was killed (possibly OOM)';
						logError(
							'Process was killed (possibly OOM)',
							{ code, signal },
							'process-kill-oom'
						);
					} else if (code === 139 || signal === 'SIGSEGV') {
						exitReason = 'Process segmentation fault';
						logError(
							'Process segmentation fault',
							{ code, signal },
							'process-segfault'
						);
					} else if (code === 1) {
						exitReason = 'Process general error (device issue?)';
						logError(
							'Process general error (device issue?)',
							{ code, signal },
							'process-general-error'
						);
					} else if (signal === 'SIGTERM') {
						exitReason = 'Process terminated with SIGTERM';
						logError(
							'Process terminated with SIGTERM',
							{ code, signal },
							'process-sigterm'
						);
					} else if (code !== 0 && code !== null) {
						exitReason = `Process exited with code ${code}`;
						logError(
							'Process exited with non-zero code',
							{ code, signal },
							'process-exit-error'
						);
					} else if (code === 0) {
						exitReason = 'Process exited normally';
						logInfo('Process exited normally', { code, signal }, 'process-exit-normal');
					}

					this.sweepProcess = null;
					this.sweepProcessPgid = null;
					this.actualProcessPid = null;

					// Clear monitoring
					if (this.processMonitorInterval) {
						clearInterval(this.processMonitorInterval);
						this.processMonitorInterval = null;
					}
					if (this.dataTimeoutTimer) {
						clearTimeout(this.dataTimeoutTimer);
						this.dataTimeoutTimer = null;
					}

					// If we're still supposed to be running, this is unexpected
					if (this.isRunning && !this.inFrequencyTransition) {
						logError(
							'Process died unexpectedly while isRunning=true',
							{ exitReason },
							'process-unexpected-death'
						);
						this._emitError(
							`HackRF process terminated unexpectedly: ${exitReason}`,
							'process_died'
						);

						// Trigger recovery
						this._performRecovery(`Process died unexpectedly: ${exitReason}`).catch(
							(error) => {
								logError('Error performing recovery', {
									error: error instanceof Error ? error.message : String(error)
								});
							}
						);
					} else {
						logInfo(
							'Process exit during expected state (not running or in transition)',
							{ exitReason },
							'process-expected-exit'
						);
					}
				});

				// Start process monitoring
				this._startProcessMonitoring();
			} catch (error) {
				reject(error instanceof Error ? error : new Error(String(error)));
			}
		});
	}

	/**
	 * Stop the sweep process
	 */
	private async _stopSweepProcess(): Promise<void> {
		if (!this.sweepProcess) {
			return;
		}

		logInfo(
			'Stopping sweep process',
			{ pid: this.actualProcessPid, pgid: this.sweepProcessPgid },
			'process-stopping'
		);

		// Clear monitoring first to prevent race conditions
		if (this.processMonitorInterval) {
			clearInterval(this.processMonitorInterval);
			this.processMonitorInterval = null;
		}
		if (this.dataTimeoutTimer) {
			clearTimeout(this.dataTimeoutTimer);
			this.dataTimeoutTimer = null;
		}

		try {
			// Try SIGTERM first for graceful shutdown
			if (this.actualProcessPid) {
				try {
					process.kill(this.actualProcessPid, 'SIGTERM');
					logInfo(
						'Sent SIGTERM to process',
						{ pid: this.actualProcessPid },
						'process-sigterm-sent'
					);
				} catch {
					logWarn(
						'Process already dead or SIGTERM failed',
						{ pid: this.actualProcessPid },
						'process-sigterm-failed'
					);
				}

				// Give it a moment to terminate gracefully
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Check if process still exists
				try {
					process.kill(this.actualProcessPid, 0);
					// Process still exists, force kill
					logWarn(
						'Process still alive, sending SIGKILL',
						{ pid: this.actualProcessPid },
						'process-sigkill-needed'
					);
					process.kill(this.actualProcessPid, 'SIGKILL');
				} catch {
					// Process is already dead
					logInfo(
						'Process terminated successfully',
						{ pid: this.actualProcessPid },
						'process-terminated'
					);
				}
			}

			// Also try to kill the entire process group if we're using detached mode
			if (this.sweepProcessPgid && this.sweepProcessPgid !== this.actualProcessPid) {
				try {
					process.kill(-this.sweepProcessPgid, 'SIGKILL');
					logInfo(
						'Killed process group',
						{ pgid: this.sweepProcessPgid },
						'process-group-killed'
					);
				} catch (e) {
					// Process group might already be dead
					logError(
						'Process group kill failed',
						{ error: e, pgid: this.sweepProcessPgid },
						'process-group-kill-failed'
					);
				}
			}
		} catch (error) {
			logError('Error during process termination', { error }, 'process-termination-error');
		}

		// Clear process references
		this.sweepProcess = null;
		this.sweepProcessPgid = null;
		this.actualProcessPid = null;

		// Ensure hackrf_sweep is not running using system command as backup
		try {
			await new Promise<void>((resolve) => {
				exec('pkill -9 -x hackrf_sweep', (error) => {
					if (error && error.code !== 1) {
						// Exit code 1 means no processes found
						logError('pkill error', { error }, 'pkill-error');
					}
					resolve();
				});
			});
		} catch (e) {
			logError('Failed to run pkill', { error: e }, 'pkill-failed');
		}

		// Wait for cleanup
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	/**
	 * Handle process output line
	 */
	private _handleProcessOutputLine(
		line: string,
		frequency: { value: number; unit: string }
	): void {
		try {
			const parsed = this._parseHackrfOutput(line);
			if (!parsed) return;

			// Log data received (only log every 10th line to reduce noise)
			if (Math.random() < 0.1) {
				logDebug(
					'Data received',
					{ frequency: parsed.frequency.toFixed(2), power: parsed.db.toFixed(2) },
					'hackrf-data-received'
				);
			}

			// Calculate target frequency
			// const _targetFreqMHz = this._convertToMHz(frequency.value, frequency.unit);

			// Create spectrum data
			const spectrumData: SpectrumData = {
				timestamp: new Date().toISOString(),
				frequency: parsed.frequency,
				power: parsed.db,
				unit: 'MHz',
				binData: parsed.dbValues,
				metadata: {
					targetFrequency: { value: frequency.value, unit: frequency.unit },
					currentIndex: this.currentIndex,
					totalFrequencies: this.frequencies.length,
					frequencyRange: parsed.frequencyRange,
					binWidth: parsed.binWidth,
					signalStrength: parsed.signalStrength
				}
			};

			// Update last data received time
			this.cyclingHealth.lastDataReceived = new Date();

			// Reset data timeout
			this._resetDataTimeout();

			// Emit data
			if (this.sseEmitter) {
				this.sseEmitter('sweep_data', spectrumData);
			}

			this.emit('spectrum', spectrumData);
		} catch (error) {
			logError('Error processing output line', { error, line }, 'output-processing-error');
		}
	}

	/**
	 * Parse hackrf_sweep output line
	 */
	private _parseHackrfOutput(line: string): {
		date: string;
		time: string;
		frequencyRange: {
			low: number;
			high: number;
			center: number;
		};
		binWidth: number;
		numSamples: number;
		maxDb: number;
		signalStrength: string;
		dbValues: number[];
		frequency: number;
		unit: string;
		db: number;
		peakBinIndex: number;
	} | null {
		const parts = line
			.trim()
			.split(/[,\s]+/)
			.filter((p) => p);

		if (parts.length < 7) return null;

		try {
			const date = parts[0];
			const time = parts[1];
			const freqLow = parseFloat(parts[2]); // in Hz
			const freqHigh = parseFloat(parts[3]); // in Hz
			const binWidth = parseFloat(parts[4]); // in Hz
			const numSamples = parseInt(parts[5]);

			const dbValues = [];
			for (let i = 6; i < parts.length; i++) {
				const db = parseFloat(parts[i]);
				if (!isNaN(db)) {
					dbValues.push(db);
				}
			}

			if (dbValues.length === 0) {
				return null;
			}

			// Find peak signal
			const maxDb = Math.max(...dbValues);
			const maxDbIndex = dbValues.indexOf(maxDb);

			// Calculate peak frequency
			const peakFrequencyHz = freqLow + maxDbIndex * binWidth + binWidth / 2;
			const sweepCenterFrequencyHz = (freqLow + freqHigh) / 2;

			return {
				date,
				time,
				frequencyRange: {
					low: freqLow,
					high: freqHigh,
					center: sweepCenterFrequencyHz
				},
				binWidth,
				numSamples,
				maxDb,
				signalStrength: this._getSignalStrength(maxDb),
				dbValues,
				frequency: peakFrequencyHz / 1000000, // Convert to MHz
				unit: 'MHz',
				db: maxDb,
				peakBinIndex: maxDbIndex
			};
		} catch (error) {
			logError('Error parsing hackrf output', { error }, 'hackrf-parsing-error');
			return null;
		}
	}

	/**
	 * Get signal strength category
	 */
	private _getSignalStrength(dB: number): string {
		if (dB < -90) return 'No Signal';
		if (dB >= -90 && dB < -70) return 'Very Weak';
		if (dB >= -70 && dB < -50) return 'Weak';
		if (dB >= -50 && dB < -30) return 'Moderate';
		if (dB >= -30 && dB < -10) return 'Strong';
		return 'Very Strong';
	}

	/**
	 * Test HackRF availability
	 */
	private async _testHackrfAvailability(): Promise<{
		available: boolean;
		reason: string;
		deviceInfo?: string;
	}> {
		return new Promise((resolve) => {
			exec('timeout 3 hackrf_info', (error, stdout, stderr) => {
				if (error) {
					if (error.code === 124) {
						resolve({ available: false, reason: 'Device check timeout' });
					} else {
						resolve({
							available: false,
							reason: `Device check failed: ${error.message}`
						});
					}
				} else if (stderr.includes('Resource busy')) {
					resolve({ available: false, reason: 'Device busy' });
				} else if (stderr.includes('No HackRF boards found')) {
					resolve({ available: false, reason: 'No HackRF found' });
				} else if (stdout.includes('Serial number')) {
					// Extract device info
					const deviceInfo = stdout
						.split('\n')
						.filter((line) => line.trim())
						.join(', ');
					resolve({ available: true, reason: 'HackRF detected', deviceInfo });
				} else {
					resolve({ available: false, reason: 'Unknown error' });
				}
			});
		});
	}

	/**
	 * Force cleanup existing processes
	 */
	private async _forceCleanupExistingProcesses(): Promise<void> {
		logInfo('Force cleaning up existing HackRF processes', {}, 'hackrf-cleanup-start');

		try {
			// Only kill hackrf_sweep processes that aren't ours
			if (this.sweepProcessPgid) {
				// Kill all hackrf_sweep processes except our current process group
				await new Promise<void>((resolve) => {
					exec(
						`pgrep -x hackrf_sweep | grep -v "^${this.sweepProcessPgid}$" | xargs -r kill -9`,
						() => resolve()
					);
				});
			} else {
				// No current process, safe to kill all
				await new Promise<void>((resolve) => {
					exec('pkill -9 -x hackrf_sweep', () => resolve());
				});
			}

			// Kill any hackrf_info processes
			await new Promise<void>((resolve) => {
				exec('pkill -9 -f hackrf_info', () => resolve());
			});

			// Wait for cleanup
			await new Promise((resolve) => setTimeout(resolve, 1000));

			logInfo('Cleanup complete', {}, 'hackrf-cleanup-complete');
		} catch (error) {
			logError('Cleanup failed', { error }, 'hackrf-cleanup-failed');
		}
	}

	/**
	 * Check if error is critical startup error
	 */
	private _isCriticalStartupError(message: string): boolean {
		const criticalErrors = [
			'No HackRF boards found',
			'hackrf_open() failed',
			'Resource busy',
			'Permission denied',
			'libusb_open() failed',
			'USB error',
			'hackrf_is_streaming() failed',
			'hackrf_start_rx() failed'
		];

		return criticalErrors.some((error) => message.toLowerCase().includes(error.toLowerCase()));
	}

	/**
	 * Normalize frequencies to standard format
	 */
	private _normalizeFrequencies(
		frequencies: (number | { frequency?: number; value?: number; unit?: string })[]
	): Array<{ value: number; unit: string }> {
		return frequencies
			.map((freq) => {
				if (typeof freq === 'number') {
					return { value: freq, unit: 'MHz' };
				} else if (freq.frequency !== undefined) {
					return { value: freq.frequency, unit: freq.unit || 'MHz' };
				} else if (freq.value !== undefined) {
					return { value: freq.value, unit: freq.unit || 'MHz' };
				}
				throw new Error('Invalid frequency format');
			})
			.filter((f) => f.value > 0);
	}

	/**
	 * Convert frequency to Hz
	 */
	private _convertToHz(value: number, unit: string): number {
		switch (unit.toLowerCase()) {
			case 'hz':
				return value;
			case 'khz':
				return value * 1000;
			case 'mhz':
				return value * 1000000;
			case 'ghz':
				return value * 1000000000;
			default:
				return value * 1000000; // Default to MHz
		}
	}

	/**
	 * Convert frequency to MHz
	 */
	private _convertToMHz(value: number, unit: string): number {
		switch (unit.toLowerCase()) {
			case 'hz':
				return value / 1000000;
			case 'khz':
				return value / 1000;
			case 'mhz':
				return value;
			case 'ghz':
				return value * 1000;
			default:
				return value;
		}
	}

	/**
	 * Reset error tracking
	 */
	private _resetErrorTracking(): void {
		this.consecutiveErrors = 0;
		this.recentFailures = [];
		this.frequencyErrors.clear();
	}

	/**
	 * Handle sweep errors
	 */
	private _handleSweepError(error: Error, frequency: { value: number; unit: string }): void {
		logError('Sweep error', { error, frequency }, 'sweep-error');

		this.consecutiveErrors++;
		this.recentFailures.push(Date.now());

		// Track frequency-specific errors
		const freqHz = this._convertToHz(frequency.value, frequency.unit);
		this.frequencyErrors.set(freqHz, (this.frequencyErrors.get(freqHz) || 0) + 1);

		// Check if we should blacklist this frequency
		if ((this.frequencyErrors.get(freqHz) || 0) > 3) {
			this.frequencyBlacklist.add(freqHz);
			logWarn(
				'Blacklisting frequency',
				{ frequency: frequency.value, unit: frequency.unit },
				'frequency-blacklisted'
			);
		}

		// Emit error event
		this._emitError(error.message, 'sweep_error', error);

		// Check if we should stop
		if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
			logError(
				'Too many consecutive errors - stopping sweep',
				{ consecutiveErrors: this.consecutiveErrors, maxErrors: this.maxConsecutiveErrors },
				'sweep-error-limit'
			);
			this.stopSweep().catch((error) => {
				logError('Error stopping sweep', {
					error: error instanceof Error ? error.message : String(error)
				});
			});
		}
	}

	/**
	 * Emit event via SSE and EventEmitter
	 */
	private _emitEvent(event: string, data: unknown): void {
		if (this.sseEmitter) {
			try {
				this.sseEmitter(event, data);
			} catch (error) {
				// SSE connection might be closed, clear the emitter
				logWarn('SSE emitter error, clearing reference', { error });
				this.sseEmitter = null;
			}
		}
		// Only emit to EventEmitter if there are listeners
		if (this.listenerCount(event) > 0) {
			this.emit(event, data);
		}
	}

	/**
	 * Emit error event
	 */
	private _emitError(message: string, type: string, error?: Error): void {
		const errorData = {
			message,
			type,
			timestamp: new Date().toISOString(),
			details: error?.stack
		};

		this._emitEvent('error', errorData);
		logError(`❌ ${type}: ${message}`, { type, details: error?.stack });
	}

	/**
	 * Perform recovery operation
	 */
	private async _performRecovery(reason: string): Promise<void> {
		logInfo(
			'Recovery triggered',
			{
				reason,
				attempts: this.cyclingHealth.recovery.recoveryAttempts,
				maxAttempts: this.cyclingHealth.recovery.maxRecoveryAttempts,
				isRecovering: this.cyclingHealth.recovery.isRecovering,
				lastRecovery: this.cyclingHealth.recovery.lastRecoveryAttempt?.toISOString()
			},
			'recovery-triggered'
		);

		// Check if we can still recover
		if (
			this.cyclingHealth.recovery.recoveryAttempts >=
			this.cyclingHealth.recovery.maxRecoveryAttempts
		) {
			logError(
				'Max recovery attempts reached, stopping sweep',
				{
					attempts: this.cyclingHealth.recovery.recoveryAttempts,
					reason: reason,
					processState: {
						isRunning: this.isRunning,
						sweepProcess: !!this.sweepProcess,
						pid: this.actualProcessPid
					}
				},
				'recovery-max-attempts'
			);
			this._emitError('Max recovery attempts reached', 'recovery_failed');
			// Ensure status is properly updated before stopping
			this.status = { state: SystemStatus.Stopping };
			this._emitEvent('status', this.status);
			await this.stopSweep();
			return;
		}

		// Check recovery cooldown (don't recover too frequently)
		if (this.cyclingHealth.recovery.lastRecoveryAttempt) {
			const timeSinceLastRecovery =
				Date.now() - this.cyclingHealth.recovery.lastRecoveryAttempt.getTime();
			if (timeSinceLastRecovery < 10000) {
				// 10 second cooldown
				logInfo(
					'Recovery cooldown active',
					{ timeSinceLastRecovery: Math.round(timeSinceLastRecovery / 1000) },
					'recovery-cooldown'
				);
				return;
			}
		}

		logInfo(
			'Starting recovery attempt',
			{
				attempt: this.cyclingHealth.recovery.recoveryAttempts + 1,
				maxAttempts: this.cyclingHealth.recovery.maxRecoveryAttempts,
				reason
			},
			'recovery-attempt-start'
		);
		this.cyclingHealth.recovery.isRecovering = true;
		this.cyclingHealth.recovery.recoveryAttempts++;
		this.cyclingHealth.recovery.lastRecoveryAttempt = new Date();

		this._emitEvent('recovery_start', {
			reason,
			attempt: this.cyclingHealth.recovery.recoveryAttempts,
			maxAttempts: this.cyclingHealth.recovery.maxRecoveryAttempts
		});

		try {
			// Kill existing process
			if (this.sweepProcess) {
				await this._stopSweepProcess();
			}

			// Force cleanup
			await this._forceCleanupExistingProcesses();

			// Wait a bit
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Restart current frequency
			if (this.frequencies.length > 0 && this.isRunning) {
				const frequency = this.frequencies[this.currentIndex];
				await this._startSweepProcess(frequency);

				logInfo(
					'Recovery completed',
					{ reason, attempt: this.cyclingHealth.recovery.recoveryAttempts },
					'recovery-complete'
				);
				this._emitEvent('recovery_complete', {
					reason,
					attempt: this.cyclingHealth.recovery.recoveryAttempts
				});
			}
		} catch (error: unknown) {
			const err = error as Error;
			logError('Recovery failed', { error: err, reason }, 'recovery-failed');
			this._emitError(`Recovery failed: ${err.message}`, 'recovery_error');

			// Stop if recovery fails
			await this.stopSweep();
		} finally {
			this.cyclingHealth.recovery.isRecovering = false;
		}
	}

	/**
	 * Start process monitoring
	 */
	private _startProcessMonitoring(): void {
		// Clear any existing monitoring
		if (this.processMonitorInterval) {
			clearInterval(this.processMonitorInterval);
		}

		// Monitor process every 2 seconds
		this.processMonitorInterval = setInterval(() => {
			if (!this.sweepProcess || !this.actualProcessPid) return;

			try {
				// Check if process is still alive
				process.kill(this.actualProcessPid, 0);

				// Also check buffer health
				if (this.stdoutBuffer.length > this.maxBufferSize * 0.8) {
					logWarn(
						'Buffer size warning',
						{ bufferSizeKB: Math.round(this.stdoutBuffer.length / 1024) },
						'buffer-size-warning'
					);
				}
			} catch {
				logError(
					'Process monitor: Process no longer exists',
					{ pid: this.actualProcessPid },
					'process-dead'
				);
				// Process is dead, trigger exit handler
				if (this.sweepProcess) {
					this.sweepProcess.emit('exit', null, 'UNKNOWN');
				}
			}
		}, 2000);

		// Set up data timeout monitoring
		this._resetDataTimeout();
	}

	/**
	 * Reset data timeout timer
	 */
	private _resetDataTimeout(): void {
		if (this.dataTimeoutTimer) {
			clearTimeout(this.dataTimeoutTimer);
		}

		// Set timeout for 120 seconds (increased from 90)
		this.dataTimeoutTimer = setTimeout(() => {
			if (this.isRunning && !this.inFrequencyTransition) {
				logWarn(
					'No data received for 120 seconds',
					{
						lastDataReceived: this.cyclingHealth.lastDataReceived?.toISOString(),
						isRunning: this.isRunning,
						sweepProcess: !!this.sweepProcess,
						pid: this.actualProcessPid,
						inFrequencyTransition: this.inFrequencyTransition
					},
					'data-timeout'
				);
				this._performRecovery('No data timeout').catch((error) => {
					logError('Error performing recovery', {
						error: error instanceof Error ? error.message : String(error)
					});
				});
			}
		}, 7200000); // 2 hours timeout for long-term monitoring
	}

	/**
	 * Check system memory
	 */
	private async _checkSystemMemory(): Promise<{
		availablePercent: number;
		totalMB: number;
		availableMB: number;
	}> {
		return new Promise((resolve, reject) => {
			exec('free -m', (error, stdout) => {
				if (error) {
					reject(error);
					return;
				}

				const lines = stdout.trim().split('\n');
				const memLine = lines[1]; // "Mem:" line
				const parts = memLine.split(/\s+/);

				const totalMB = parseInt(parts[1]);
				const availableMB = parseInt(parts[6] || parts[3]); // Try "available" column first, then "free"
				const availablePercent = Math.round((availableMB / totalMB) * 100);

				resolve({ availablePercent, totalMB, availableMB });
			});
		});
	}

	/**
	 * Clean up resources
	 */
	async cleanup(): Promise<void> {
		// Stop health monitoring
		if (this.healthMonitorInterval) {
			clearInterval(this.healthMonitorInterval);
		}

		// Stop process monitoring
		if (this.processMonitorInterval) {
			clearInterval(this.processMonitorInterval);
		}

		// Clear data timeout
		if (this.dataTimeoutTimer) {
			clearTimeout(this.dataTimeoutTimer);
		}

		// Stop any running sweep
		await this.emergencyStop();
	}
}

// Singleton instance
export const sweepManager = new SweepManager();

// Export getter function for consistency
export function getSweepManager(): SweepManager {
	return sweepManager;
}
