<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	onMount(() => {
		if (browser) {
			// Load external JavaScript files
			const loadScript = (src) => {
				return new Promise((resolve, reject) => {
					const script = document.createElement('script');
					script.src = src;
					script.onload = resolve;
					script.onerror = reject;
					document.head.appendChild(script);
				});
			};
			
			// Load all scripts sequentially
			loadScript('/api-config.js?v=5.0')
				.then(() => loadScript('/script.js?v=5.0'))
				.then(() => {
					console.log('All HackRF scripts loaded');
					initializeNavigation();
					initializeHeroFunctions();
				})
				.catch(err => {
					console.error('Failed to load HackRF scripts:', err);
				});
			
			initializeNavigation();
			initializeHeroFunctions();
		}
	});
	
	function initializeNavigation() {
		const mobileMenuButton = document.getElementById('mobileMenuButton');
		const mobileMenu = document.getElementById('mobileMenu');
		
		if (mobileMenuButton && mobileMenu) {
			mobileMenuButton.addEventListener('click', function() {
				mobileMenu.classList.toggle('hidden');
				mobileMenu.classList.toggle('show');
				mobileMenuButton.classList.toggle('active');
				
				const isOpen = !mobileMenu.classList.contains('hidden');
				mobileMenuButton.setAttribute('aria-expanded', isOpen);
				mobileMenu.setAttribute('aria-hidden', !isOpen);
			});
			
			document.addEventListener('click', function(event) {
				if (!mobileMenuButton.contains(event.target) && 
					!mobileMenu.contains(event.target) && 
					!mobileMenu.classList.contains('hidden')) {
					
					mobileMenu.classList.add('hidden');
					mobileMenu.classList.remove('show');
					mobileMenuButton.classList.remove('active');
					mobileMenuButton.setAttribute('aria-expanded', 'false');
					mobileMenu.setAttribute('aria-hidden', 'true');
				}
			});
			
			window.addEventListener('resize', function() {
				if (window.innerWidth >= 1024) {
					mobileMenu.classList.add('hidden');
					mobileMenu.classList.remove('show');
					mobileMenuButton.classList.remove('active');
					mobileMenuButton.setAttribute('aria-expanded', 'false');
					mobileMenu.setAttribute('aria-hidden', 'true');
				}
			});
		}
		
		const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
		
		navLinks.forEach(link => {
			link.addEventListener('click', function(e) {
				e.preventDefault();
				
				navLinks.forEach(nl => nl.classList.remove('active'));
				this.classList.add('active');
				
				const href = this.getAttribute('href');
				const correspondingLink = document.querySelector(
					this.classList.contains('nav-link') ? 
					`.mobile-nav-link[href="${href}"]` : 
					`.nav-link[href="${href}"]`
				);
				
				if (correspondingLink) {
					correspondingLink.classList.add('active');
				}
				
				if (this.classList.contains('mobile-nav-link')) {
					mobileMenu.classList.add('hidden');
					mobileMenu.classList.remove('show');
					mobileMenuButton.classList.remove('active');
					mobileMenuButton.setAttribute('aria-expanded', 'false');
					mobileMenu.setAttribute('aria-hidden', 'true');
				}
				
				const targetId = href.substring(1);
				const targetElement = document.getElementById(targetId);
				if (targetElement) {
					targetElement.scrollIntoView({ 
						behavior: 'smooth',
						block: 'start'
					});
				}
			});
		});
		
		if (mobileMenuButton && mobileMenu) {
			mobileMenuButton.setAttribute('aria-expanded', 'false');
			mobileMenuButton.setAttribute('aria-controls', 'mobileMenu');
			mobileMenu.setAttribute('aria-hidden', 'true');
		}
		
		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
				mobileMenu.classList.add('hidden');
				mobileMenu.classList.remove('show');
				mobileMenuButton.classList.remove('active');
				mobileMenuButton.setAttribute('aria-expanded', 'false');
				mobileMenu.setAttribute('aria-hidden', 'true');
				mobileMenuButton.focus();
			}
		});
	}
	
	function initializeHeroFunctions() {
		window.startMonitoring = function() {
			const frequencyScanner = document.querySelector('#scanner, .frequency-scanner, [data-section="scanner"]');
			if (frequencyScanner) {
				frequencyScanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
			} else {
				const addFrequencyBtn = document.getElementById('addFrequencyButton');
				if (addFrequencyBtn) {
					addFrequencyBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
					addFrequencyBtn.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.6)';
					setTimeout(() => {
						addFrequencyBtn.style.boxShadow = '';
					}, 3000);
				}
			}
		};

		window.showDocumentation = function() {
			const helpSection = document.querySelector('#help, .help-section, [data-section="help"]');
			if (helpSection) {
				helpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
			} else {
				const docOverlay = document.createElement('div');
				docOverlay.className = 'fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50';
				docOverlay.innerHTML = `
					<div class="max-w-2xl mx-4 p-8 rounded-xl bg-bg-card border border-border-primary shadow-xl">
						<div class="flex justify-between items-center mb-6">
							<h3 class="text-2xl font-bold text-white">HackRF Sweep Documentation</h3>
							<button onclick="this.closest('.fixed').remove()" class="text-text-muted hover:text-white">
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
								</svg>
							</button>
						</div>
						<div class="space-y-4 text-text-secondary">
							<h4 class="text-lg font-semibold text-accent-primary">Quick Start</h4>
							<ol class="list-decimal list-inside space-y-2">
								<li>Connect your HackRF One device</li>
								<li>Add frequencies using the "Add Frequency" button</li>
								<li>Configure sweep parameters (start/stop/step)</li>
								<li>Click "Start Monitoring" to begin scanning</li>
								<li>Monitor real-time spectrum data in the analysis panel</li>
							</ol>
							<h4 class="text-lg font-semibold text-accent-primary mt-6">Features</h4>
							<ul class="list-disc list-inside space-y-2">
								<li>Real-time spectrum sweeping from 1MHz to 6GHz</li>
								<li>Configurable frequency ranges and step sizes</li>
								<li>Visual spectrum analysis with waterfall display</li>
								<li>Signal strength monitoring and alerts</li>
								<li>Professional SDR monitoring interface</li>
							</ul>
						</div>
						<div class="mt-8 text-center">
							<button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-accent-primary text-black font-medium rounded-lg hover:bg-accent-hover transition-colors">
								Got it
							</button>
						</div>
					</div>
				`;
				document.body.appendChild(docOverlay);
			}
		};
		
		// Initialize global functions for the HackRF functionality
		window.loadFrequencies = function() {
			console.log('Loading frequencies...');
		};
		
		window.openSpectrumAnalyzer = function() {
			window.open('/spectrum-viewer', '_blank');
		};
	}
</script>

<svelte:head>
	<title>HackRF Sweep Monitor</title>
	<!-- Saasfly Typography Fonts -->
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600;700&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="/custom-components-exact.css">
	<link rel="stylesheet" href="/geometric-backgrounds.css">
	<link rel="stylesheet" href="/saasfly-buttons.css">
	<link rel="stylesheet" href="/monochrome-theme.css">
	<script src="https://cdn.tailwindcss.com"></script>
	<script>
		tailwind.config = {
			theme: {
				extend: {
					fontFamily: {
						'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
						'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
						'body': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
						'heading': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
						'display': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
					},
					colors: {
						// Monochromatic palette
						'bg-primary': '#0a0a0a',
						'bg-secondary': '#141414',
						'bg-card': '#141414',
						'bg-input': '#1a1a1a',
						'bg-hover': '#2d2d2d',
						'bg-button': '#404040',
						
						// Text colors
						'text-primary': '#ffffff',
						'text-secondary': '#a3a3a3',
						'text-tertiary': '#737373',
						'text-muted': '#525252',
						'text-disabled': '#525252',
						
						// Borders
						'border-primary': '#262626',
						'border-hover': '#404040',
						
						// Accent colors - now monochrome
						'accent-primary': '#ffffff',
						'accent-hover': '#a3a3a3',
						'accent-muted': '#737373',
						'accent-active': '#525252',
						
						// Signal strength - keep colorful
						'signal-none': '#525252',
						'signal-weak': '#60A5FA',        // Blue
						'signal-moderate': '#FBBF24',     // Yellow
						'signal-strong': '#FF6B35',       // Orange
						'signal-very-strong': '#DC2626',  // Red
						
						// Status colors - subtle
						'error-bg': '#1a1a1a',
						'error-border': '#404040',
						'recovery-bg': '#1a1a1a',
						'recovery-border': '#404040',
						
						// Remove neon colors
						'neon-cyan': '#a3a3a3',
						'neon-cyan-light': '#ffffff',
						'neon-cyan-dark': '#737373',
					},
					boxShadow: {
						'sm': '0 1px 3px rgba(0, 0, 0, 0.5)',
						'md': '0 4px 6px rgba(0, 0, 0, 0.3)',
						'lg': '0 10px 25px rgba(0, 0, 0, 0.2)',
						'xl': '0 20px 40px rgba(0, 0, 0, 0.15)',
						'mono-glow': '0 0 10px rgba(255, 255, 255, 0.05)',
						'mono-glow-sm': '0 0 5px rgba(255, 255, 255, 0.03)',
						'mono-glow-lg': '0 0 15px rgba(255, 255, 255, 0.08)',
					},
					animation: {
						'pulse': 'pulse 2s infinite',
						'spin': 'spin 1s linear infinite',
						'activeFrequency': 'activeFrequency 2s infinite',
						'slideDown': 'slideDown 0.3s ease-out',
						'pulse-error': 'pulse-error 2s infinite',
						'highlight-error': 'highlight-error 3s ease-out',
						'neon-pulse': 'neonPulse 2s ease-in-out infinite',
						'scan-line': 'scanLine 4s linear infinite',
						'text-glow': 'textGlow 3s ease-in-out infinite',
						'blob': 'blob 7s infinite',
					},
					keyframes: {
						pulse: {
							'0%, 100%': { opacity: '1' },
							'50%': { opacity: '0.7' },
						},
						spin: {
							'to': { transform: 'rotate(360deg)' },
						},
						activeFrequency: {
							'0%, 100%': { boxShadow: '0 0 0 2px rgba(191, 255, 0, 0.2)' },
							'50%': { boxShadow: '0 0 0 2px rgba(191, 255, 0, 0.4)' },
						},
						slideDown: {
							'from': { opacity: '0', transform: 'translateY(-10px)' },
							'to': { opacity: '1', transform: 'translateY(0)' },
						},
						'pulse-error': {
							'0%, 100%': { opacity: '1' },
							'50%': { opacity: '0.8' },
						},
						'highlight-error': {
							'0%': { 
								background: 'rgba(255, 107, 53, 0.3)',
								transform: 'scale(1.02)'
							},
							'100%': { 
								background: 'rgba(255, 107, 53, 0.1)',
								transform: 'scale(1)'
							},
						},
						neonPulse: {
							'0%, 100%': {
								boxShadow: '0 0 5px rgba(0, 212, 255, 0.4), 0 0 10px rgba(0, 212, 255, 0.2), 0 0 15px rgba(0, 212, 255, 0.1)',
							},
							'50%': {
								boxShadow: '0 0 10px rgba(0, 212, 255, 0.6), 0 0 20px rgba(0, 212, 255, 0.4), 0 0 30px rgba(0, 212, 255, 0.2)',
							},
						},
						scanLine: {
							'0%': { transform: 'translateY(-100%)' },
							'100%': { transform: 'translateY(100%)' },
						},
						textGlow: {
							'0%, 100%': {
								textShadow: '0 0 10px rgba(0, 212, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3), 0 0 30px rgba(0, 212, 255, 0.1)',
							},
							'50%': {
								textShadow: '0 0 15px rgba(0, 212, 255, 0.7), 0 0 30px rgba(0, 212, 255, 0.5), 0 0 45px rgba(0, 212, 255, 0.3)',
							},
						},
						blob: {
							'0%, 100%': {
								transform: 'translate(0px, 0px) scale(1)',
							},
							'33%': {
								transform: 'translate(30px, -50px) scale(1.1)',
							},
							'66%': {
								transform: 'translate(-20px, 20px) scale(0.9)',
							},
						},
					},
					fontSize: {
						'2.5rem': '2.5rem',
						'0.95rem': '0.95rem',
						'0.875rem': '0.875rem',
						'0.8rem': '0.8rem',
						'0.75rem': '0.75rem',
						'0.7rem': '0.7rem',
						'0.9rem': '0.9rem',
						'1.25rem': '1.25rem',
						'1.1rem': '1.1rem',
						'0.85rem': '0.85rem',
						// Saasfly Typography Scale
						'7xl': '4.5rem',
						'6xl': '3.75rem',
						'5xl': '3rem',
						'4xl': '2.25rem',
						'3xl': '1.875rem',
						'2xl': '1.5rem',
						'xl': '1.25rem',
						'lg': '1.125rem',
						'base': '1rem',
						'sm': '0.875rem',
						'xs': '0.75rem',
						'2xs': '0.6875rem',
						
						// Legacy compatibility
						'display-1': '4.5rem',
						'display-2': '3.75rem',
						'h1': '2.25rem',
						'h2': '1.875rem',
						'h3': '1.5rem',
						'h4': '1.25rem',
						'body-large': '1.125rem',
						'body': '1rem',
						'body-small': '0.875rem',
						'caption': '0.75rem',
						'overline': '0.6875rem',
					},
					spacing: {
						'44px': '44px',
						'85px': '85px',
					},
					letterSpacing: {
						'0.1em': '0.1em',
						'0.05em': '0.05em',
						'-0.02em': '-0.02em',
						// Saasfly letter spacing
						'tighter': '-0.05em',
						'tight': '-0.025em',
						'normal': '0em',
						'wide': '0.025em',
						'wider': '0.05em',
						'widest': '0.1em',
					},
					lineHeight: {
						'none': '1',
						'tight': '1.1',
						'snug': '1.2',
						'normal': '1.25',
						'relaxed': '1.5',
						'loose': '1.75',
						
						// Saasfly semantic line heights
						'display': '1.1',
						'heading': '1.25',
						'body': '1.5',
						'caption': '1.25',
					},
				}
			}
		}
	</script>
</svelte:head>

<!-- Body with exact font classes from port 3002 -->
<div class="font-body text-white flex flex-col min-h-screen leading-body">
	<!-- Geometric Background Layers - Node.js Style (EXACT from port 3002) -->
	<div class="geometric-background">
		<!-- Base depth gradient for visual hierarchy -->
		<div class="depth-gradient"></div>
		
		<!-- Floating radial gradients for depth -->
		<div class="floating-shapes"></div>
		
		<!-- Subtle grid pattern overlay -->
		<div class="grid-pattern"></div>
		
		<!-- Hexagon pattern for tech aesthetic -->
		<div class="hexagon-overlay"></div>
		
		<!-- Circuit-like diagonal lines -->
		<div class="circuit-lines"></div>
		
		<!-- Geometric accent shapes -->
		<div class="geometric-accents">
			<div class="accent-triangle triangle-1"></div>
			<div class="accent-triangle triangle-2"></div>
			<div class="accent-triangle triangle-3"></div>
			<div class="accent-triangle triangle-4"></div>
		</div>
		
		<!-- Complex SVG Background Patterns -->
		<svg class="absolute inset-0 w-full h-full" style="opacity: 0.02; z-index: -9;" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<!-- Geometric Pattern Definitions -->
				<pattern id="nodePattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
					<!-- Central hexagon -->
					<polygon points="100,40 130,60 130,100 100,120 70,100 70,60" 
							 fill="none" stroke="rgba(0,212,255,0.1)" stroke-width="1"/>
					<!-- Connecting lines -->
					<line x1="100" y1="40" x2="100" y2="0" stroke="rgba(59,130,246,0.08)" stroke-width="1"/>
					<line x1="130" y1="60" x2="170" y2="30" stroke="rgba(59,130,246,0.08)" stroke-width="1"/>
					<line x1="130" y1="100" x2="170" y2="130" stroke="rgba(59,130,246,0.08)" stroke-width="1"/>
					<line x1="100" y1="120" x2="100" y2="160" stroke="rgba(59,130,246,0.08)" stroke-width="1"/>
					<line x1="70" y1="100" x2="30" y2="130" stroke="rgba(59,130,246,0.08)" stroke-width="1"/>
					<line x1="70" y1="60" x2="30" y2="30" stroke="rgba(59,130,246,0.08)" stroke-width="1"/>
					<!-- Corner dots -->
					<circle cx="100" cy="80" r="2" fill="rgba(0,212,255,0.1)"/>
				</pattern>
				
				<pattern id="techGrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
					<!-- Tech grid with circuits -->
					<rect width="80" height="80" fill="none"/>
					<path d="M 0 20 L 20 20 L 20 0 M 60 20 L 80 20 L 80 0 M 20 60 L 20 80 L 0 80 M 60 60 L 60 80 L 80 80" 
						  stroke="rgba(255,255,255,0.03)" stroke-width="1" fill="none"/>
					<circle cx="20" cy="20" r="1.5" fill="rgba(0,212,255,0.08)"/>
					<circle cx="60" cy="20" r="1.5" fill="rgba(59,130,246,0.06)"/>
					<circle cx="20" cy="60" r="1.5" fill="rgba(147,51,234,0.04)"/>
					<circle cx="60" cy="60" r="1.5" fill="rgba(0,212,255,0.08)"/>
				</pattern>
				
				<!-- Animated gradient for dynamic effect -->
				<radialGradient id="dynamicGlow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" style="stop-color:rgba(0,212,255,0.05);stop-opacity:1">
						<animate attributeName="stop-color" 
								 values="rgba(0,212,255,0.05);rgba(59,130,246,0.03);rgba(147,51,234,0.02);rgba(0,212,255,0.05)" 
								 dur="30s" repeatCount="indefinite"/>
					</stop>
					<stop offset="100%" style="stop-color:rgba(0,212,255,0);stop-opacity:0"/>
				</radialGradient>
			</defs>
			
			<!-- Background patterns -->
			<rect width="100%" height="100%" fill="url(#nodePattern)">
				<animateTransform attributeName="transform" type="translate" 
								  values="0,0;50,30;0,0" dur="45s" repeatCount="indefinite"/>
			</rect>
			
			<rect width="100%" height="100%" fill="url(#techGrid)" opacity="0.5">
				<animateTransform attributeName="transform" type="translate" 
								  values="0,0;-40,-40;0,0" dur="60s" repeatCount="indefinite"/>
			</rect>
			
			<!-- Dynamic glow spots -->
			<circle cx="20%" cy="30%" r="150" fill="url(#dynamicGlow)">
				<animate attributeName="r" values="150;200;150" dur="25s" repeatCount="indefinite"/>
			</circle>
			<circle cx="80%" cy="70%" r="180" fill="url(#dynamicGlow)">
				<animate attributeName="r" values="180;120;180" dur="35s" repeatCount="indefinite"/>
			</circle>
			<circle cx="60%" cy="20%" r="120" fill="url(#dynamicGlow)">
				<animate attributeName="r" values="120;160;120" dur="40s" repeatCount="indefinite"/>
			</circle>
		</svg>
	</div>

	<!-- Animated background layer -->
	<div class="fixed inset-0 z-0">
		<div class="absolute inset-0 bg-black"></div>
		<div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
		<div class="absolute inset-0 opacity-30">
			<div class="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
			<div class="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
			<div class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
			<div class="absolute -bottom-8 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-6000" style="background: #BFFF00;"></div>
		</div>
	</div>
	
	<!-- Main content wrapper with z-index -->
	<div class="relative z-10 flex flex-col min-h-screen">
		<!-- Professional Node.js-style Navigation Header (EXACT from port 3002) -->
		<header class="glass-header relative overflow-hidden sticky top-0 z-50">
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/5 to-transparent animate-pulse"></div>
			<div class="relative z-10">
				<div class="max-w-7xl mx-auto px-6">
					<!-- Main Navigation Bar -->
					<div class="flex items-center justify-between h-16">
						<!-- Brand/Logo Section -->
						<div class="flex items-center space-x-4">
							<div class="flex items-center space-x-3">
								<!-- Animated Logo Icon -->
								<!-- Brand Text -->
								<div class="flex flex-col">
									<h1 class="font-heading text-h4 font-semibold tracking-tight leading-tight">
										<span class="hackrf-brand">HackRF</span> <span class="sweep-brand font-bold">Sweep</span>
									</h1>
									<span class="font-mono text-caption uppercase tracking-widest" style="color: #9CA3AF !important;">SDR Monitoring Platform</span>
								</div>
							</div>
						</div>

						<!-- Desktop Navigation Menu -->
						<nav class="hidden lg:flex items-center space-x-8">
							<a href="#dashboard" class="nav-link active flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
								</svg>
								<span class="font-heading text-body-small font-medium">Dashboard</span>
							</a>
							<a href="#scanner" class="nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.594-.471-3.076-1.343-4.343a1 1 0 010-1.414z"/>
									<path fill-rule="evenodd" d="M13.828 8.172a1 1 0 011.414 0A5.983 5.983 0 0117 12a5.983 5.983 0 01-1.758 3.828 1 1 0 01-1.414-1.414A3.987 3.987 0 0015 12a3.987 3.987 0 00-1.172-2.828 1 1 0 010-1.414z"/>
								</svg>
								<span class="font-heading text-body-small font-medium">Frequency Scanner</span>
							</a>
							<a href="#analysis" class="nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
								</svg>
								<span class="font-heading text-body-small font-medium">Signal Analysis</span>
							</a>
							<a href="#settings" class="nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
								</svg>
								<span class="font-heading text-body-small font-medium">Settings</span>
							</a>
							<a href="#help" class="nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"/>
								</svg>
								<span class="font-heading text-body-small font-medium">Help</span>
							</a>
						</nav>

						<!-- Status Indicators & Actions -->
						<div class="flex items-center space-x-4">
							<!-- Connection Status -->
							<div class="hidden md:flex items-center space-x-3 px-3 py-2 status-panel rounded-lg">
								<div class="flex items-center space-x-2">
									<div class="status-indicator w-2 h-2 rounded-full shadow-neon-cyan-sm" style="background: #10b981;"></div>
									<span class="font-mono text-caption text-text-secondary">Connected</span>
								</div>
								<div class="w-px h-4 bg-border-primary"></div>
								<div class="flex items-center space-x-2">
									<span class="font-mono text-caption text-text-muted">Mode:</span>
									<span class="font-mono text-caption text-neon-cyan font-semibold">Sweep</span>
								</div>
							</div>

							<!-- Mobile Menu Button -->
							<button id="mobileMenuButton" class="lg:hidden p-2 glass-button rounded-lg">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
								</svg>
							</button>
						</div>
					</div>

					<!-- Mobile Navigation Menu -->
					<div id="mobileMenu" class="lg:hidden hidden border-t border-border-primary">
						<div class="py-4 space-y-2">
							<a href="#dashboard" class="mobile-nav-link active flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
								</svg>
								<span class="font-heading text-body font-medium">Dashboard</span>
							</a>
							<a href="#scanner" class="mobile-nav-link flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.594-.471-3.076-1.343-4.343a1 1 0 010-1.414z"/>
									<path fill-rule="evenodd" d="M13.828 8.172a1 1 0 011.414 0A5.983 5.983 0 0117 12a5.983 5.983 0 01-1.758 3.828 1 1 0 01-1.414-1.414A3.987 3.987 0 0015 12a3.987 3.987 0 00-1.172-2.828 1 1 0 010-1.414z"/>
								</svg>
								<span class="font-heading text-body font-medium">Frequency Scanner</span>
							</a>
							<a href="#analysis" class="mobile-nav-link flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
								</svg>
								<span class="font-heading text-body font-medium">Signal Analysis</span>
							</a>
							<a href="#settings" class="mobile-nav-link flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
								</svg>
								<span class="font-heading text-body font-medium">Settings</span>
							</a>
							<a href="#help" class="mobile-nav-link flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"/>
								</svg>
								<span class="font-heading text-body font-medium">Help</span>
							</a>
							
							<!-- Mobile Status Section -->
							<div class="mt-4 pt-4 border-t border-border-primary">
								<div class="px-4 py-2 glass-panel-light rounded-lg">
									<div class="flex items-center justify-between mb-2">
										<span class="font-mono text-caption text-text-muted">Status:</span>
										<div class="flex items-center space-x-2">
											<div class="status-indicator w-2 h-2 rounded-full" style="background: #10b981;"></div>
											<span class="font-mono text-caption text-text-secondary">Connected</span>
										</div>
									</div>
									<div class="flex items-center justify-between">
										<span class="font-mono text-caption text-text-muted">Mode:</span>
										<span class="font-mono text-caption text-neon-cyan font-semibold">Sweep</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- Scanning line effect -->
			<div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-[scan_3s_ease-in-out_infinite]"></div>
		</header>
		
		<!-- Main Application Container (EXACT from port 3002) -->
		<div class="min-h-screen bg-black relative">

			<!-- Main Dashboard Section -->
			<section class="py-16 lg:py-24">
				<div class="container mx-auto px-4 lg:px-8 max-w-7xl">

					<!-- Dashboard Grid -->
					<div class="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
						<!-- Control Panel Section -->
						<div class="xl:col-span-1">
							<div class="sticky top-24 space-y-8">
								<!-- Frequency Management - Saasfly Feature Card -->
								<div class="saasfly-feature-card group rounded-2xl p-8 bg-gradient-to-br from-bg-card/80 via-bg-card/60 to-bg-card/40 border border-border-primary/40 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-neon-cyan/30 hover:bg-gradient-to-br hover:from-bg-card/90 hover:via-bg-card/70 hover:to-bg-card/50 transition-all duration-300">
									<div class="flex items-center mb-6">
										<div class="p-3 bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/10 rounded-xl mr-4 border border-neon-cyan/20 group-hover:border-neon-cyan/40 group-hover:shadow-neon-cyan-sm transition-all duration-300">
											<svg class="w-6 h-6 frequency-config-icon group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
												<path d="M3 12h4l3-9 4 18 3-9h4M3 3v18M21 3v18"/>
											</svg>
										</div>
										<div>
											<h3 class="font-heading text-xl font-semibold frequency-config-header mb-1 transition-colors duration-300">Frequency Configuration</h3>
											<p class="text-sm text-text-muted group-hover:text-text-secondary transition-colors duration-300">Manage target frequencies</p>
										</div>
									</div>
									
									<div class="space-y-6">
										<div>
											<label class="block text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">Frequencies</label>
											<div id="frequencyList" class="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
												<div class="frequency-item saasfly-interactive-card flex items-center gap-3 p-4 bg-gradient-to-r from-bg-card/40 to-bg-card/20 rounded-xl border border-border-primary/40 hover:border-neon-cyan/40 hover:bg-gradient-to-r hover:from-bg-card/60 hover:to-bg-card/40 hover:shadow-md transition-all duration-300" id="frequencyItem1">
													<span class="font-mono text-sm text-text-muted font-semibold min-w-[24px] text-center bg-neon-cyan/10 rounded-lg px-2 py-1">1</span>
													<div class="flex-1 relative">
														<input type="text" id="frequencyInput1" value="100" placeholder="Enter frequency" class="font-mono w-full pl-3 pr-12 py-2 bg-bg-input/80 border border-border-primary/60 rounded-lg text-text-primary outline-none focus:border-neon-cyan focus:bg-bg-input focus:shadow-neon-cyan-sm transition-all duration-300">
														<span class="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-text-secondary font-medium pointer-events-none">MHz</span>
													</div>
												</div>
											</div>
											<button id="addFrequencyButton" class="saasfly-btn saasfly-btn-primary w-full">
												<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
												</svg>
												Add Frequency
											</button>
										</div>
									</div>
								</div>

								<!-- Sweep Control - Saasfly Feature Card -->
								<div class="saasfly-feature-card group rounded-2xl p-8 bg-gradient-to-br from-bg-card/80 via-bg-card/60 to-bg-card/40 border border-border-primary/40 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-accent-primary/30 hover:bg-gradient-to-br hover:from-bg-card/90 hover:via-bg-card/70 hover:to-bg-card/50 transition-all duration-300">
									<div class="flex items-center mb-6">
										<div class="p-3 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 rounded-xl mr-4 border border-accent-primary/20 group-hover:border-accent-primary/40 group-hover:shadow-lg group-hover:shadow-accent-primary/20 transition-all duration-300">
											<svg class="w-6 h-6 text-accent-primary group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
												<path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
											</svg>
										</div>
										<div>
											<h3 class="font-heading text-xl font-semibold sweep-control-header mb-1 transition-colors duration-300">Sweep Control</h3>
											<p class="text-sm text-text-muted group-hover:text-text-secondary transition-colors duration-300">Configure frequency cycling</p>
										</div>
									</div>
									
									<div class="space-y-6">
										<div>
											<label for="cycleTimeInput" class="block text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">Cycle Time (seconds)</label>
											<input type="number" id="cycleTimeInput" value="10" min="1" max="30" placeholder="1-30" class="w-full px-4 py-3 bg-bg-input/80 border border-border-primary/60 rounded-xl text-text-primary outline-none focus:border-accent-primary focus:bg-bg-input focus:shadow-lg focus:shadow-accent-primary/20 transition-all duration-300">
										</div>

										<div class="grid grid-cols-1 gap-3">
											<button id="startButton" class="saasfly-btn saasfly-btn-primary saasfly-btn-shine w-full">
												<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
												</svg>
												Start Cycling
											</button>
											<button id="stopButton" disabled class="saasfly-btn saasfly-btn-secondary w-full">
												<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7z"/>
												</svg>
												Stop Cycling
											</button>
										</div>
									</div>
								</div>

								<!-- Tools Section - Saasfly Feature Card -->
								<div class="saasfly-feature-card group rounded-2xl p-8 bg-gradient-to-br from-bg-card/80 via-bg-card/60 to-bg-card/40 border border-border-primary/40 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-purple-400/30 hover:bg-gradient-to-br hover:from-bg-card/90 hover:via-bg-card/70 hover:to-bg-card/50 transition-all duration-300">
									<div class="flex items-center mb-6">
										<div class="p-3 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl mr-4 border border-purple-400/20 group-hover:border-purple-400/40 group-hover:shadow-lg group-hover:shadow-purple-400/20 transition-all duration-300">
											<svg class="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01.293.707V12a1 1 0 01-.293.707l-2.293 2.293H8a1 1 0 010 2H4a1 1 0 01-1-1v-4a1 1 0 01.293-.707L5.586 9 3.293 6.707A1 1 0 013 6V4zm8-2a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-.293.707L14.414 7l2.293 2.293A1 1 0 0117 10v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293A1 1 0 0111 10V8a1 1 0 01.293-.707L13.586 5H12a1 1 0 010-2z"/>
											</svg>
										</div>
										<div>
											<h3 class="font-heading text-xl font-semibold external-tools-header mb-1 transition-colors duration-300">Analysis Tools</h3>
											<p class="text-sm text-text-muted group-hover:text-text-secondary transition-colors duration-300">External analysis utilities</p>
										</div>
									</div>
									
									<div class="space-y-3">
										<button id="loadFrequenciesButton" onclick="loadFrequencies()" class="saasfly-btn saasfly-btn-ghost w-full relative">
											<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
											</svg>
											<span class="button-text">Load Frequencies</span>
											<div class="loading-spinner hidden absolute inset-0 flex items-center justify-center bg-accent-primary/10 rounded-xl">
												<div class="w-5 h-5 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin"></div>
											</div>
										</button>
										<button id="openSpectrumButton" onclick="openSpectrumAnalyzer()" class="saasfly-btn saasfly-btn-secondary w-full">
											<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
												<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
											</svg>
											Open Spectrum Analyzer
										</button>
									</div>
								</div>
							</div>
						</div>

						<!-- Monitoring Section -->
						<div class="xl:col-span-2">
							<div class="space-y-8">
								<!-- Cycle Status - Saasfly Dashboard Card -->
								<div id="cycleStatus" class="saasfly-dashboard-card group rounded-2xl p-8 bg-gradient-to-br from-bg-card/90 via-bg-card/70 to-bg-card/50 border border-border-primary/50 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-blue-400/40 hover:bg-gradient-to-br hover:from-bg-card/95 hover:via-bg-card/75 hover:to-bg-card/55 transition-all duration-300">
									<div class="flex items-center mb-8">
										<div class="p-3 rounded-xl mr-4 transition-all duration-300" style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.1) 100%) !important; border: 1px solid rgba(251, 146, 60, 0.2) !important; box-shadow: 0 8px 25px rgba(251, 146, 60, 0.2), 0 0 15px rgba(251, 146, 60, 0.15) !important;" onmouseover="this.style.border='1px solid rgba(251, 146, 60, 0.4)'; this.style.boxShadow='0 8px 25px rgba(251, 146, 60, 0.4), 0 0 25px rgba(251, 146, 60, 0.3)'" onmouseout="this.style.border='1px solid rgba(251, 146, 60, 0.2)'; this.style.boxShadow='0 8px 25px rgba(251, 146, 60, 0.2), 0 0 15px rgba(251, 146, 60, 0.15)'">
											<svg class="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20" style="color: #fb923c !important;">
												<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707L11 12.414V6z"/>
											</svg>
										</div>
										<div>
											<h3 class="font-heading text-2xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors duration-300">Cycle Status</h3>
											<p class="text-text-muted group-hover:text-text-secondary transition-colors duration-300">Real-time sweep monitoring</p>
										</div>
									</div>
									
									<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
										<div class="saasfly-info-card p-6 bg-gradient-to-br from-accent-primary/10 to-accent-primary/5 rounded-xl border border-accent-primary/20 hover:border-accent-primary/40 hover:bg-gradient-to-br hover:from-accent-primary/15 hover:to-accent-primary/8 hover:shadow-lg hover:shadow-accent-primary/20 transition-all duration-300">
											<div class="text-sm font-medium uppercase tracking-wide mb-2" style="color: #525252 !important;">Next Frequency</div>
											<div id="currentFrequencyDisplay" class="font-mono text-3xl font-bold text-accent-primary">--</div>
										</div>
										<div class="saasfly-info-card p-6 bg-gradient-to-br from-neon-cyan/10 to-neon-cyan/5 rounded-xl border border-neon-cyan/20 hover:border-neon-cyan/40 hover:bg-gradient-to-br hover:from-neon-cyan/15 hover:to-neon-cyan/8 hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300">
											<div class="text-sm font-medium uppercase tracking-wide mb-2" style="color: #525252 !important;">Next Switch In</div>
											<div id="switchTimer" class="font-mono text-3xl font-bold text-neon-cyan">--</div>
										</div>
									</div>
									
									<div class="h-2 bg-bg-secondary rounded-full overflow-hidden">
										<div id="timerProgressBar" class="h-full bg-gradient-to-r from-accent-primary to-accent-hover rounded-full transition-[width] duration-100 ease-linear w-0"></div>
									</div>
								</div>

								<!-- Signal Analysis - Saasfly Dashboard Card -->
								<div class="saasfly-dashboard-card group rounded-2xl p-8 bg-gradient-to-br from-bg-card/90 via-bg-card/70 to-bg-card/50 border border-border-primary/50 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-yellow-400/40 hover:bg-gradient-to-br hover:from-bg-card/95 hover:via-bg-card/75 hover:to-bg-card/55 transition-all duration-300">
									<div class="flex items-center mb-8">
										<div class="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-xl mr-4 border border-yellow-400/20 group-hover:border-yellow-400/40 group-hover:shadow-lg group-hover:shadow-yellow-400/20 transition-all duration-300">
											<svg class="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
												<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
											</svg>
										</div>
										<div>
											<h3 class="font-heading text-2xl font-semibold text-white mb-1 group-hover:text-yellow-400 transition-colors duration-300">Signal Analysis</h3>
											<p class="text-text-muted group-hover:text-text-secondary transition-colors duration-300">Real-time signal strength monitoring and frequency analysis</p>
										</div>
									</div>
									
									<!-- Signal Metrics Grid -->
									<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
										<div class="saasfly-metric-card p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl border border-orange-400/20 hover:border-orange-400/40 hover:bg-gradient-to-br hover:from-orange-500/15 hover:to-orange-500/8 hover:shadow-lg hover:shadow-orange-400/20 transition-all duration-300">
											<div class="text-sm text-text-muted font-medium uppercase tracking-wide mb-2">dB Level</div>
											<div id="dbLevelValue" class="font-mono text-2xl font-bold text-orange-400">--.--</div>
										</div>
										<div class="saasfly-metric-card p-6 bg-gradient-to-br from-signal-strong/10 to-signal-strong/5 rounded-xl border border-signal-strong/20 hover:border-signal-strong/40 hover:bg-gradient-to-br hover:from-signal-strong/15 hover:to-signal-strong/8 hover:shadow-lg hover:shadow-signal-strong/20 transition-all duration-300">
											<div class="text-sm text-text-muted font-medium uppercase tracking-wide mb-2">Signal Strength</div>
											<div id="signalStrengthText" class="text-2xl font-bold text-signal-none">No Signal</div>
										</div>
										<div class="saasfly-metric-card p-6 bg-gradient-to-br from-neon-cyan/10 to-neon-cyan/5 rounded-xl border border-neon-cyan/20 hover:border-neon-cyan/40 hover:bg-gradient-to-br hover:from-neon-cyan/15 hover:to-neon-cyan/8 hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300">
											<div class="text-sm text-text-muted font-medium uppercase tracking-wide mb-2">Target</div>
											<div id="targetFrequency" class="font-mono text-2xl font-bold text-neon-cyan">--</div>
										</div>
										<div class="saasfly-metric-card p-6 bg-gradient-to-br from-accent-primary/10 to-accent-primary/5 rounded-xl border border-accent-primary/20 hover:border-accent-primary/40 hover:bg-gradient-to-br hover:from-accent-primary/15 hover:to-accent-primary/8 hover:shadow-lg hover:shadow-accent-primary/20 transition-all duration-300">
											<div class="text-sm text-text-muted font-medium uppercase tracking-wide mb-2">Detected</div>
											<div id="detectedFrequency" class="font-mono text-2xl font-bold text-accent-primary">--</div>
										</div>
										<div class="saasfly-metric-card p-6 bg-gradient-to-br from-purple-400/10 to-purple-400/5 rounded-xl border border-purple-400/20 hover:border-purple-400/40 hover:bg-gradient-to-br hover:from-purple-400/15 hover:to-purple-400/8 hover:shadow-lg hover:shadow-purple-400/20 transition-all duration-300">
											<div class="text-sm text-text-muted font-medium uppercase tracking-wide mb-2">Offset</div>
											<div id="frequencyOffset" class="font-mono text-2xl font-bold text-purple-400">--</div>
										</div>
									</div>

									<!-- Signal Visualization (EXACT from port 3002) -->
									<div class="relative pb-20">
										<div class="text-sm text-text-muted uppercase tracking-wide mb-8 text-center font-medium">Signal Strength Scale</div>
										<div class="signal-indicator h-8 bg-bg-input rounded-lg relative border border-border-primary shadow-inner hover:cursor-crosshair">
											<div class="signal-indicator-fill h-full w-0 transition-[width] duration-300 ease-in-out relative z-[1] rounded-md" id="signalIndicatorFill"></div>
											<div class="absolute top-[-8px] w-[2px] h-[calc(100%+16px)] bg-accent-primary shadow-lg transition-[left] duration-300 ease-in-out z-[3] before:content-[''] before:absolute before:top-[-4px] before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-0 before:border-l-[6px] before:border-l-transparent before:border-r-[6px] before:border-r-transparent before:border-t-[6px] before:border-t-accent-primary" id="dbCurrentIndicator">
												<span class="font-mono absolute top-[-32px] left-1/2 -translate-x-1/2 bg-bg-card border border-accent-primary rounded px-2 py-1 text-xs font-semibold text-accent-primary whitespace-nowrap pointer-events-none" id="dbCurrentValue">-90 dB</span>
											</div>
											<div class="absolute top-0 left-0 right-0 h-full flex justify-between items-center pointer-events-none z-[2]">
												<!-- All markers with dB values prominently displayed (EXACT from port 3002) -->
												<div class="absolute h-full w-px bg-white/50 top-0 left-0 hover:bg-white/40" data-db="-90">
													<span class="font-mono absolute top-full mt-2 text-sm text-signal-weak -translate-x-1/4 whitespace-nowrap font-bold">-90</span>
												</div>
												<div class="absolute h-1/2 w-px bg-white/20 top-1/4 left-[12.5%] hover:bg-white/30" data-db="-80">
													<span class="font-mono absolute top-full mt-2 text-sm text-signal-weak -translate-x-1/2 whitespace-nowrap font-bold">-80</span>
												</div>
												<div class="absolute h-full w-px bg-white/50 top-0 left-1/4 hover:bg-white/40" data-db="-70">
													<span class="font-mono absolute top-full mt-2 text-sm text-blue-400 -translate-x-1/2 whitespace-nowrap font-bold">-70</span>
												</div>
												<div class="absolute h-1/2 w-px bg-white/20 top-1/4 left-[37.5%] hover:bg-white/30" data-db="-60">
													<span class="font-mono absolute top-full mt-2 text-sm text-signal-moderate -translate-x-1/2 whitespace-nowrap font-bold">-60</span>
												</div>
												<div class="absolute h-full w-px bg-white/50 top-0 left-1/2 hover:bg-white/40" data-db="-50">
													<span class="font-mono absolute top-full mt-2 text-sm text-signal-moderate -translate-x-1/2 whitespace-nowrap font-bold">-50</span>
												</div>
												<div class="absolute h-1/2 w-px bg-white/20 top-1/4 left-[62.5%] hover:bg-white/30" data-db="-40">
													<span class="font-mono absolute top-full mt-2 text-sm text-signal-strong -translate-x-1/2 whitespace-nowrap font-bold">-40</span>
												</div>
												<div class="absolute h-full w-px bg-white/50 top-0 left-3/4 hover:bg-white/40" data-db="-30">
													<span class="font-mono absolute top-full mt-2 text-sm text-signal-strong -translate-x-1/2 whitespace-nowrap font-bold">-30</span>
												</div>
												<div class="absolute h-1/2 w-px bg-white/20 top-1/4 left-[87.5%] hover:bg-white/30" data-db="-20">
													<span class="font-mono absolute top-full mt-2 text-sm text-signal-very-strong -translate-x-1/2 whitespace-nowrap font-bold">-20</span>
												</div>
												<div class="absolute h-full w-px bg-white/50 top-0 left-full hover:bg-white/40" data-db="-10">
													<span class="font-mono absolute top-full mt-2 text-sm text-signal-very-strong -translate-x-3/4 whitespace-nowrap font-bold">-10</span>
												</div>
											</div>
										</div>
										<div class="flex justify-between mt-16 px-2 absolute w-full bottom-0">
											<span class="text-xs text-signal-weak uppercase tracking-widest font-semibold">← WEAK</span>
											<span class="text-xs text-signal-very-strong uppercase tracking-widest font-semibold">STRONG →</span>
										</div>
									</div>
								</div>

								<!-- System Status - Saasfly Feature Card -->
								<div class="saasfly-feature-card group rounded-2xl p-8 bg-gradient-to-br from-bg-card/80 via-bg-card/60 to-bg-card/40 border border-border-primary/40 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-green-400/30 hover:bg-gradient-to-br hover:from-bg-card/90 hover:via-bg-card/70 hover:to-bg-card/50 transition-all duration-300">
									<div class="flex items-center mb-6">
										<div class="p-3 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl mr-4 border border-green-400/20 group-hover:border-green-400/40 group-hover:shadow-lg group-hover:shadow-green-400/20 transition-all duration-300">
											<svg class="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
											</svg>
										</div>
										<div>
											<h3 class="font-heading text-xl font-semibold text-white mb-1 transition-colors duration-300">System Status</h3>
											<p class="text-sm text-text-muted group-hover:text-text-secondary transition-colors duration-300">Current system information</p>
										</div>
									</div>
									<div id="statusMessage" class="saasfly-status-card text-text-secondary min-h-[3rem] flex items-center px-4 py-3 bg-gradient-to-r from-bg-card/30 to-bg-card/20 rounded-xl border border-border-primary/30 hover:border-neon-cyan/40 hover:bg-gradient-to-r hover:from-bg-card/40 hover:to-bg-card/30 hover:shadow-lg hover:shadow-neon-cyan/10 transition-all duration-300"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Footer Section -->
			<footer class="py-12 border-t border-border-primary/20">
				<div class="container mx-auto px-4 lg:px-8 max-w-7xl">
					<div class="flex flex-col md:flex-row justify-between items-center">
						<div class="flex items-center space-x-3 mb-4 md:mb-0">
							<div>
							</div>
						</div>
						<div class="flex items-center space-x-6 text-sm text-text-muted">
							<span>© 2024 <span class="hackrf-brand">HackRF</span> <span class="sweep-brand">Sweep</span></span>
							<a href="#" class="hover:text-accent-primary transition-colors">Documentation</a>
							<a href="#" class="hover:text-accent-primary transition-colors">Support</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	</div>
	
	<!-- Full page loading overlay -->
	<div id="pageLoadingOverlay" class="fixed top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 opacity-0 pointer-events-none transition-opacity duration-300">
		<div class="rounded-lg p-8 text-center shadow-xl" style="background: #141414; border: 1px solid #262626;">
			<div class="w-12 h-12 border-3 rounded-full animate-spin mx-auto mb-4" style="border-color: rgba(191, 255, 0, 0.3); border-top-color: #BFFF00;"></div>
			<p class="text-white text-sm">Loading frequencies to OpenWebRX...</p>
		</div>
	</div>
</div>