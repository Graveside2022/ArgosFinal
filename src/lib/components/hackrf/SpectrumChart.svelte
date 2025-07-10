<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { hackrfService } from '$lib/services/hackrf';
  import type { SpectrumData } from '$lib/services/hackrf';
  
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrame: number | null = null;
  let unsubscribe: (() => void) | null = null;
  
  // Chart settings
  const GRID_COLOR = '#333';
  const SPECTRUM_COLOR = '#00ff88';
  const PEAK_HOLD_COLOR = '#ff6600';
  const WATERFALL_HEIGHT = 100;
  
  // Data buffers
  let spectrumData: SpectrumData | null = null;
  let peakHold: number[] = [];
  let waterfallData: Uint8ClampedArray[] = [];
  let frequencyRange = { start: 0, end: 1000 };
  
  // Drawing functions
  function drawGrid(): void {
    if (!ctx || !canvas) return;
    
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Vertical lines (frequency)
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height - WATERFALL_HEIGHT);
      ctx.stroke();
    }
    
    // Horizontal lines (power)
    for (let i = 0; i <= 5; i++) {
      const y = ((canvas.height - WATERFALL_HEIGHT) / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }
  
  function drawSpectrum(): void {
    if (!ctx || !spectrumData || !canvas) return;
    
    const { frequencies, powers } = spectrumData;
    if (!frequencies || !powers || frequencies.length === 0) return;
    
    const width = canvas.width;
    const height = canvas.height - WATERFALL_HEIGHT;
    
    // Update frequency range
    frequencyRange.start = frequencies[0] / 1e6; // Convert to MHz
    frequencyRange.end = frequencies[frequencies.length - 1] / 1e6;
    
    // Clear spectrum area
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    drawGrid();
    
    // Draw spectrum line
    ctx.strokeStyle = SPECTRUM_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < powers.length; i++) {
      const x = (i / (powers.length - 1)) * width;
      // Normalize power to 0-1 range (assuming -100 to 0 dBm)
      const normalizedPower = (powers[i] + 100) / 100;
      const y = height - (normalizedPower * height);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Update peak hold
      if (!peakHold[i] || powers[i] > peakHold[i]) {
        peakHold[i] = powers[i];
      }
    }
    
    ctx.stroke();
    
    // Draw peak hold line
    if (peakHold.length > 0) {
      ctx.strokeStyle = PEAK_HOLD_COLOR;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      
      for (let i = 0; i < peakHold.length; i++) {
        const x = (i / (peakHold.length - 1)) * width;
        const normalizedPower = (peakHold[i] + 100) / 100;
        const y = height - (normalizedPower * height);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Update waterfall
    updateWaterfall(powers);
  }
  
  function updateWaterfall(powers: number[]): void {
    if (!ctx || !powers || !canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const waterfallY = height - WATERFALL_HEIGHT;
    
    // Create new waterfall line
    const waterfallLine = new Uint8ClampedArray(width * 4);
    
    for (let i = 0; i < powers.length; i++) {
      const x = Math.floor((i / powers.length) * width);
      // Map power to color intensity (0-255)
      const intensity = Math.floor(((powers[i] + 100) / 100) * 255);
      
      // Create color gradient: blue -> green -> yellow -> red
      let r: number, g: number, b: number;
      if (intensity < 64) {
        r = 0;
        g = 0;
        b = intensity * 4;
      } else if (intensity < 128) {
        r = 0;
        g = (intensity - 64) * 4;
        b = 255 - (intensity - 64) * 4;
      } else if (intensity < 192) {
        r = (intensity - 128) * 4;
        g = 255;
        b = 0;
      } else {
        r = 255;
        g = 255 - (intensity - 192) * 4;
        b = 0;
      }
      
      const idx = x * 4;
      waterfallLine[idx] = r;
      waterfallLine[idx + 1] = g;
      waterfallLine[idx + 2] = b;
      waterfallLine[idx + 3] = 255;
    }
    
    // Add to waterfall buffer
    waterfallData.push(waterfallLine);
    if (waterfallData.length > WATERFALL_HEIGHT) {
      waterfallData.shift();
    }
    
    // Draw waterfall
    const imageData = ctx.createImageData(width, WATERFALL_HEIGHT);
    
    for (let y = 0; y < waterfallData.length; y++) {
      const line = waterfallData[waterfallData.length - 1 - y];
      for (let x = 0; x < width * 4; x++) {
        imageData.data[y * width * 4 + x] = line[x];
      }
    }
    
    ctx.putImageData(imageData, 0, waterfallY);
    
    // Draw separator line
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, waterfallY);
    ctx.lineTo(width, waterfallY);
    ctx.stroke();
  }
  
  function animate(): void {
    drawSpectrum();
    animationFrame = requestAnimationFrame(animate);
  }
  
  function resetView(): void {
    peakHold = [];
    waterfallData = [];
    if (ctx && canvas) {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGrid();
    }
  }
  
  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
      
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Initial draw
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();
      }
      
      // Subscribe to spectrum data
      unsubscribe = hackrfService.spectrumData.subscribe((data: SpectrumData | null) => {
        spectrumData = data;
      });
      
      // Start animation loop
      animate();
    }
  });
  
  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<!-- Spectrum Chart -->
<div class="glass-panel rounded-2xl p-8">
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-heading text-2xl font-bold">Spectrum Analysis</h2>
    <div class="flex items-center space-x-4">
      <button class="saasfly-btn saasfly-btn-sm saasfly-btn-secondary" on:click={resetView}>
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
        </svg>
        Reset View
      </button>
    </div>
  </div>
  
  <div class="relative">
    <canvas 
      bind:this={canvas}
      width="800" 
      height="400" 
      class="w-full h-[400px] bg-bg-input rounded-lg"
    ></canvas>
    
    <!-- Y-axis labels -->
    <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-text-muted -ml-8">
      <span>0</span>
      <span>-20</span>
      <span>-40</span>
      <span>-60</span>
      <span>-80</span>
      <span>-100</span>
    </div>
    
    <!-- X-axis labels -->
    <div class="absolute bottom-0 left-0 w-full flex justify-between text-xs text-text-muted mt-2">
      {#each Array(11) as _, i}
        <span>{Math.round(frequencyRange.start + (frequencyRange.end - frequencyRange.start) * (i / 10))}</span>
      {/each}
    </div>
  </div>
  
  <div class="mt-6 flex items-center justify-between text-sm text-text-secondary">
    <span>Frequency (MHz)</span>
    <span>Power (dBm)</span>
  </div>
</div>