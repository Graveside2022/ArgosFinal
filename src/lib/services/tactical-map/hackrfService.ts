import { hackrfAPI } from '$lib/services/hackrf/api';
import { spectrumData } from '$lib/stores/hackrf';
import { 
	hackrfStore, 
	setConnectionStatus, 
	setSearchingState, 
	setTargetFrequency,
	clearAllSignals,
	type SimplifiedSignal 
} from '$lib/stores/tactical-map/hackrfStore';
import { SignalAggregator } from '../../../routes/tactical-map-simple/SignalAggregator';

export class HackRFService {
	private spectrumUnsubscribe: (() => void) | null = null;
	private aggregator: SignalAggregator;

	constructor() {
		this.aggregator = new SignalAggregator();
	}

	connectToHackRF(): void {
		hackrfAPI.connectToDataStream();

		// Subscribe to spectrum data
		this.spectrumUnsubscribe = spectrumData.subscribe((data) => {
			const state = hackrfStore;
			// Access current state synchronously
			let currentState: any;
			const unsubscribe = hackrfStore.subscribe(s => currentState = s);
			unsubscribe();
			
			if (data && currentState.isSearching) {
				this.aggregator.addSpectrumData(data);
			}
		});

		setConnectionStatus('Connected');
	}

	disconnectFromHackRF(): void {
		hackrfAPI.disconnect();

		if (this.spectrumUnsubscribe) {
			this.spectrumUnsubscribe();
			this.spectrumUnsubscribe = null;
		}

		setConnectionStatus('Disconnected');
	}

	startSearch(frequency: number): void {
		setTargetFrequency(frequency);
		setSearchingState(true);
		clearAllSignals();
		console.warn(`Searching for signals near ${frequency} MHz`);
	}

	stopSearch(): void {
		setSearchingState(false);
		clearAllSignals();
	}

	toggleSearch(frequency: number): void {
		let currentState: any;
		const unsubscribe = hackrfStore.subscribe(s => currentState = s);
		unsubscribe();

		if (currentState.isSearching) {
			this.stopSearch();
		} else {
			this.startSearch(frequency);
		}
	}

	// Get aggregated signals matching target frequency
	getAggregatedSignals(targetFrequency: number, tolerance: number = 5): SimplifiedSignal[] {
		const aggregatedSignals = this.aggregator.getAggregatedSignals(targetFrequency);
		return aggregatedSignals.map((signal, index) => ({
			id: `signal_${signal.frequency}_${signal.firstSeen}`,
			frequency: signal.frequency,
			power: signal.power,
			lat: 0, // Signals don't have location data at this level
			lon: 0,
			timestamp: signal.lastSeen,
			count: signal.count
		}));
	}

	// Clear aggregator buffer
	flushAggregator(): void {
		this.aggregator.flush();
	}

	// Navigate to spectrum analyzer
	navigateToSpectrum(): void {
		this.stopSearch();
		window.location.href = '/viewspectrum';
	}

	// Get current aggregator instance (for external access)
	getAggregator(): SignalAggregator {
		return this.aggregator;
	}

	// Clean up resources
	destroy(): void {
		this.disconnectFromHackRF();
		this.stopSearch();
	}
}