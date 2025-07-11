<script lang="ts">
	import { timeWindowFilter, getAgeColor } from '$lib/services/hackrf/timeWindowFilter';
	import { onMount, onDestroy } from 'svelte';
	
	const { signals: _signals, stats } = timeWindowFilter;
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let animationFrame: number;
	
	// Canvas dimensions
	let width = 400;
	let height = 200;
	
	// Age buckets for histogram
	let bucketCount = 20;
	let ageDistribution: { age: number; count: number }[] = [];
	
	function resizeCanvas() {
		if (canvas && canvas.parentElement) {
			width = canvas.parentElement.clientWidth;
			canvas.width = width;
			canvas.height = height;
		}
	}
	
	function updateDistribution() {
		ageDistribution = timeWindowFilter.getAgeDistribution(bucketCount);
	}
	
	function drawVisualization() {
		if (!ctx) return;
		
		// Clear canvas
		ctx.fillStyle = '#0a0f1b';
		ctx.fillRect(0, 0, width, height);
		
		// Update distribution
		updateDistribution();
		
		if (ageDistribution.length === 0) {
			// No data message
			ctx.fillStyle = '#6b7280';
			ctx.font = '14px monospace';
			ctx.textAlign = 'center';
			ctx.fillText('No signals to display', width / 2, height / 2);
			return;
		}
		
		// Chart dimensions
		const padding = 40;
		const chartWidth = width - padding * 2;
		const chartHeight = height - padding * 2;
		
		// Find max count for scaling
		const maxCount = Math.max(...ageDistribution.map(d => d.count));
		const maxAge = Math.max(...ageDistribution.map(d => d.age));
		
		// Draw axes
		ctx.strokeStyle = '#4a5568';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(padding, padding);
		ctx.lineTo(padding, height - padding);
		ctx.lineTo(width - padding, height - padding);
		ctx.stroke();
		
		// Draw bars
		const barWidth = chartWidth / ageDistribution.length;
		
		ageDistribution.forEach((bucket, i) => {
			const barHeight = (bucket.count / maxCount) * chartHeight;
			const x = padding + i * barWidth;
			const y = height - padding - barHeight;
			
			// Get color based on age
			const agePercent = (bucket.age / maxAge) * 100;
			ctx.fillStyle = getAgeColor(agePercent);
			
			// Draw bar
			ctx.fillRect(x + barWidth * 0.1, y, barWidth * 0.8, barHeight);
			
			// Draw count label if bar is tall enough
			if (barHeight > 20 && bucket.count > 0) {
				ctx.fillStyle = '#ffffff';
				ctx.font = '11px monospace';
				ctx.textAlign = 'center';
				ctx.fillText(bucket.count.toString(), x + barWidth / 2, y - 5);
			}
		});
		
		// Draw labels
		ctx.fillStyle = '#9ca3af';
		ctx.font = '12px monospace';
		
		// Y-axis label (count)
		ctx.save();
		ctx.translate(15, height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.textAlign = 'center';
		ctx.fillText('Signal Count', 0, 0);
		ctx.restore();
		
		// X-axis label (age)
		ctx.textAlign = 'center';
		ctx.fillText('Signal Age (seconds)', width / 2, height - 10);
		
		// Draw age markers
		ctx.textAlign = 'center';
		ctx.font = '10px monospace';
		const ageStep = maxAge / 5;
		for (let i = 0; i <= 5; i++) {
			const age = i * ageStep;
			const x = padding + (i / 5) * chartWidth;
			ctx.fillText(age.toFixed(0), x, height - padding + 20);
		}
		
		// Draw title
		ctx.fillStyle = '#ffffff';
		ctx.font = '14px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('Signal Age Distribution', width / 2, 20);
		
		// Draw legend
		const legendY = 35;
		const legendItems = [
			{ label: 'New', color: '#10b981' },
			{ label: 'Active', color: '#f59e0b' },
			{ label: 'Fading', color: '#ef4444' },
			{ label: 'Expiring', color: '#6b7280' }
		];
		
		let legendX = width / 2 - 100;
		ctx.font = '11px monospace';
		legendItems.forEach(item => {
			ctx.fillStyle = item.color;
			ctx.fillRect(legendX, legendY - 8, 12, 12);
			ctx.fillStyle = '#9ca3af';
			ctx.textAlign = 'left';
			ctx.fillText(item.label, legendX + 16, legendY);
			legendX += 60;
		});
	}
	
	function animate() {
		drawVisualization();
		animationFrame = requestAnimationFrame(animate);
	}
	
	onMount(() => {
		const context = canvas.getContext('2d');
		if (context) {
			ctx = context;
			resizeCanvas();
			animate();
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

<div class="glass-panel rounded-xl p-4">
	<canvas
		bind:this={canvas}
		class="w-full rounded-lg"
		width={width}
		height={height}
	></canvas>
	
	<!-- Summary stats -->
	<div class="grid grid-cols-4 gap-2 mt-4 text-xs">
		<div class="text-center">
			<div class="text-text-muted">Total</div>
			<div class="font-mono text-text-primary">{$stats.totalSignals}</div>
		</div>
		<div class="text-center">
			<div class="text-text-muted">Active</div>
			<div class="font-mono text-green-400">{$stats.activeSignals}</div>
		</div>
		<div class="text-center">
			<div class="text-text-muted">Fading</div>
			<div class="font-mono text-amber-400">{$stats.fadingSignals}</div>
		</div>
		<div class="text-center">
			<div class="text-text-muted">Expired</div>
			<div class="font-mono text-red-400">{$stats.expiredSignals}</div>
		</div>
	</div>
</div>