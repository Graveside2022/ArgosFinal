<script lang="ts">
	import { spectrumData, signalHistory } from '$lib/stores/hackrf';
	import { onMount, onDestroy } from 'svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let animationFrame: number;

	// Canvas dimensions
	let width = 800;
	let height = 400;

	function resizeCanvas() {
		if (canvas && canvas.parentElement) {
			width = canvas.parentElement.clientWidth;
			canvas.width = width;
			canvas.height = height;
		}
	}

	let isDrawing = false;

	function drawSpectrum() {
		if (!ctx || isDrawing) return;

		isDrawing = true;

		// Clear canvas
		ctx.fillStyle = '#0a0f1b';
		ctx.fillRect(0, 0, width, height);

		// Define chart area with margins
		const leftMargin = 60;
		const rightMargin = 10;
		const topMargin = 10;
		const bottomMargin = 30;
		const chartWidth = width - leftMargin - rightMargin;
		const chartHeight = height - topMargin - bottomMargin;

		// Draw grid
		ctx.strokeStyle = '#1a2332';
		ctx.lineWidth = 1;

		// Horizontal grid lines
		for (let i = 0; i <= 10; i++) {
			const y = topMargin + (chartHeight / 10) * i;
			ctx.beginPath();
			ctx.moveTo(leftMargin, y);
			ctx.lineTo(leftMargin + chartWidth, y);
			ctx.stroke();
		}

		// Vertical grid lines
		for (let i = 0; i <= 20; i++) {
			const x = leftMargin + (chartWidth / 20) * i;
			ctx.beginPath();
			ctx.moveTo(x, topMargin);
			ctx.lineTo(x, topMargin + chartHeight);
			ctx.stroke();
		}

		// Draw spectrum data if available
		if ($spectrumData && $spectrumData.power_levels && $spectrumData.power_levels.length > 0) {
			const dataPoints = $spectrumData.power_levels.length;
			const xStep = chartWidth / dataPoints;

			// Create gradient for spectrum line
			const gradient = ctx.createLinearGradient(0, 0, 0, height);
			gradient.addColorStop(0, '#00ffff');
			gradient.addColorStop(0.5, '#0080ff');
			gradient.addColorStop(1, '#0040ff');

			// Draw spectrum line
			ctx.strokeStyle = gradient;
			ctx.lineWidth = 2;
			ctx.beginPath();

			$spectrumData.power_levels.forEach((power, index) => {
				if (!ctx) return;

				const x = leftMargin + index * xStep;
				const normalizedPower = Math.max(0, Math.min(1, (power + 100) / 100)); // Normalize and clamp
				const y = topMargin + chartHeight - normalizedPower * chartHeight;

				if (index === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			});

			ctx.stroke();

			// Fill area under curve
			ctx.lineTo(leftMargin + chartWidth, topMargin + chartHeight);
			ctx.lineTo(leftMargin, topMargin + chartHeight);
			ctx.closePath();
			ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
			ctx.fill();
		}

		// Draw frequency labels
		ctx.fillStyle = '#9ca3af';
		ctx.font = '12px monospace';
		ctx.textAlign = 'center';

		if ($spectrumData && $spectrumData.start_freq && $spectrumData.stop_freq) {
			const freqRange = $spectrumData.stop_freq - $spectrumData.start_freq;
			for (let i = 0; i <= 10; i++) {
				const freq = $spectrumData.start_freq + (freqRange / 10) * i;
				const x = leftMargin + (chartWidth / 10) * i;
				ctx.fillText(`${freq.toFixed(1)}`, x, height - 5);
			}
			// Draw MHz label
			ctx.textAlign = 'right';
			ctx.fillText('MHz', width - 5, height - 5);
		}

		// Draw power labels with better alignment
		ctx.textAlign = 'right';
		ctx.fillStyle = '#9ca3af';
		ctx.font = '12px monospace';

		// Draw power scale from -100 to 0 dBm
		for (let i = 0; i <= 10; i++) {
			const power = -100 + i * 10; // -100, -90, -80, ..., 0
			const y = topMargin + chartHeight - (i * chartHeight) / 10;

			// Draw tick mark
			ctx.strokeStyle = '#4a5568';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(leftMargin - 5, y);
			ctx.lineTo(leftMargin, y);
			ctx.stroke();

			// Draw label
			ctx.fillText(`${power}`, leftMargin - 8, y + 4);
		}

		// Draw dBm label
		ctx.save();
		ctx.translate(15, height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.textAlign = 'center';
		ctx.fillText('Power (dBm)', 0, 0);
		ctx.restore();

		isDrawing = false;
	}

	function startAnimation() {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}

		function animate() {
			drawSpectrum();
			animationFrame = requestAnimationFrame(animate);
		}

		animate();
	}

	onMount(() => {
		const context = canvas.getContext('2d');
		if (context) {
			ctx = context;
			resizeCanvas();
			startAnimation();
		}

		if (typeof window !== 'undefined') {
			window.addEventListener('resize', resizeCanvas);
		}
	});

	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', resizeCanvas);
		}
	});
</script>

<!-- Spectrum Analysis Dashboard -->
<div class="glass-panel rounded-xl p-6">
	<h3 class="text-h4 font-heading font-semibold text-text-primary mb-6 flex items-center">
		<svg class="w-5 h-5 mr-2 text-neon-cyan" fill="currentColor" viewBox="0 0 20 20">
			<path
				d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
			/>
		</svg>
		Spectrum Analysis
	</h3>

	<!-- Real-time Spectrum Display -->
	<div class="relative mb-6">
		<canvas
			bind:this={canvas}
			class="w-full rounded-lg border border-border-primary bg-bg-deep"
			{width}
			{height}
		></canvas>

		<!-- Loading Overlay -->
		{#if !$spectrumData || !$spectrumData.power_levels || $spectrumData.power_levels.length === 0}
			<div class="absolute inset-0 flex items-center justify-center bg-bg-deep/80 rounded-lg">
				<div class="text-center">
					<svg
						class="w-12 h-12 mx-auto mb-4 text-text-muted animate-pulse"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 6.343a1 1 0 010-1.414l1.414-1.414a1 1 0 111.414 1.414l-1.414 1.414a1 1 0 01-1.414 0zM5.05 6.343a1 1 0 010 1.414L3.636 9.172a1 1 0 11-1.414-1.414l1.414-1.415a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
					<p class="font-mono text-body text-text-muted">Waiting for spectrum data...</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Signal Statistics -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="glass-panel-light rounded-lg p-4">
			<span class="font-mono text-xs text-text-muted uppercase tracking-wider"
				>Peak Power</span
			>
			<p class="font-mono text-h5 text-neon-green mt-1">
				{$spectrumData?.peak_power ? `${$spectrumData.peak_power.toFixed(1)} dBm` : '--'}
			</p>
		</div>
		<div class="glass-panel-light rounded-lg p-4">
			<span class="font-mono text-xs text-text-muted uppercase tracking-wider"
				>Peak Frequency</span
			>
			<p class="font-mono text-h5 text-accent-primary mt-1">
				{$spectrumData?.peak_freq ? `${$spectrumData.peak_freq.toFixed(3)} MHz` : '--'}
			</p>
		</div>
		<div class="glass-panel-light rounded-lg p-4">
			<span class="font-mono text-xs text-text-muted uppercase tracking-wider"
				>Average Power</span
			>
			<p class="font-mono text-h5 text-text-primary mt-1">
				{$spectrumData?.avg_power ? `${$spectrumData.avg_power.toFixed(1)} dBm` : '--'}
			</p>
		</div>
		<div class="glass-panel-light rounded-lg p-4">
			<span class="font-mono text-xs text-text-muted uppercase tracking-wider">Bandwidth</span
			>
			<p class="font-mono text-h5 text-text-primary mt-1">
				{$spectrumData?.start_freq && $spectrumData?.stop_freq
					? `${($spectrumData.stop_freq - $spectrumData.start_freq).toFixed(1)} MHz`
					: '--'}
			</p>
		</div>
	</div>

	<!-- Signal History -->
	{#if $signalHistory.length > 0}
		<div class="mt-6">
			<h4 class="font-mono text-xs text-text-muted uppercase tracking-wider mb-3">
				Recent Signals
			</h4>
			<div class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
				{#each $signalHistory.slice(-5).reverse() as signal}
					<div
						class="glass-panel-light rounded-lg p-3 flex items-center justify-between text-caption"
					>
						<span class="font-mono text-text-secondary"
							>{new Date(signal.timestamp).toLocaleTimeString()}</span
						>
						<span class="font-mono text-accent-primary"
							>{signal.frequency.toFixed(3)} MHz</span
						>
						<span
							class="font-mono {signal.power > -50
								? 'text-neon-green'
								: 'text-text-muted'}">{signal.power.toFixed(1)} dBm</span
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
