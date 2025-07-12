/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
				body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				display: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
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

				// Accent colors - cyan theme
				'accent-primary': '#00d4ff',
				'accent-hover': '#66e3ff',
				'accent-muted': '#0099cc',
				'accent-active': '#006699',

				// Signal strength - keep colorful
				'signal-none': '#525252',
				'signal-weak': '#60A5FA', // Blue
				'signal-moderate': '#FBBF24', // Yellow
				'signal-strong': '#FF6B35', // Orange
				'signal-very-strong': '#DC2626', // Red

				// Status colors - subtle
				'error-bg': '#1a1a1a',
				'error-border': '#404040',
				'recovery-bg': '#1a1a1a',
				'recovery-border': '#404040',

				// Neon colors with proper cyan
				'neon-cyan': '#00d4ff',
				'neon-cyan-light': '#66e3ff',
				'neon-cyan-dark': '#0099cc'
			},
			boxShadow: {
				sm: '0 1px 3px rgba(0, 0, 0, 0.5)',
				md: '0 4px 6px rgba(0, 0, 0, 0.3)',
				lg: '0 10px 25px rgba(0, 0, 0, 0.2)',
				xl: '0 20px 40px rgba(0, 0, 0, 0.15)',
				'mono-glow': '0 0 10px rgba(255, 255, 255, 0.05)',
				'mono-glow-sm': '0 0 5px rgba(255, 255, 255, 0.03)',
				'mono-glow-lg': '0 0 15px rgba(255, 255, 255, 0.08)',
				'neon-cyan-sm': '0 0 5px rgba(0, 212, 255, 0.3)',
				'neon-cyan': '0 0 10px rgba(0, 212, 255, 0.5)',
				'neon-cyan-lg': '0 0 20px rgba(0, 212, 255, 0.7)'
			},
			animation: {
				pulse: 'pulse 2s infinite',
				spin: 'spin 1s linear infinite',
				activeFrequency: 'activeFrequency 2s infinite',
				slideDown: 'slideDown 0.3s ease-out',
				'pulse-error': 'pulse-error 2s infinite',
				'highlight-error': 'highlight-error 3s ease-out',
				'neon-pulse': 'neonPulse 2s ease-in-out infinite',
				'scan-line': 'scanLine 4s linear infinite',
				'text-glow': 'textGlow 3s ease-in-out infinite'
			},
			keyframes: {
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				spin: {
					to: { transform: 'rotate(360deg)' }
				},
				activeFrequency: {
					'0%, 100%': { boxShadow: '0 0 0 2px rgba(191, 255, 0, 0.2)' },
					'50%': { boxShadow: '0 0 0 2px rgba(191, 255, 0, 0.4)' }
				},
				slideDown: {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'pulse-error': {
					'0%, 100%': { opacity: '0.3' },
					'50%': { opacity: '0.6' }
				},
				'highlight-error': {
					'0%': {
						backgroundColor: 'rgba(239, 68, 68, 0.2)',
						borderColor: 'rgba(239, 68, 68, 0.5)'
					},
					'100%': { backgroundColor: 'transparent', borderColor: 'rgba(75, 85, 99, 0.3)' }
				},
				neonPulse: {
					'0%, 100%': { opacity: '0.8', filter: 'brightness(1)' },
					'50%': { opacity: '1', filter: 'brightness(1.2)' }
				},
				scanLine: {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' }
				},
				textGlow: {
					'0%, 100%': {
						textShadow:
							'0 0 10px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.2), 0 0 30px rgba(0, 212, 255, 0.1)'
					},
					'50%': {
						textShadow:
							'0 0 15px rgba(0, 212, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.3), 0 0 45px rgba(0, 212, 255, 0.2)'
					}
				}
			},
			fontSize: {
				// Saasfly text sizes
				'display-2xl': '4.5rem',
				'display-xl': '3.75rem',
				'display-lg': '3rem',
				display: '2.25rem',
				'heading-xl': '2rem',
				'heading-lg': '1.5rem',
				heading: '1.25rem',
				'heading-sm': '1.125rem',
				'body-large': '1.125rem',
				body: '1rem',
				'body-small': '0.875rem',
				caption: '0.75rem',
				overline: '0.625rem'
			},
			letterSpacing: {
				tighter: '-0.05em',
				tight: '-0.025em',
				normal: '0em',
				wide: '0.025em',
				wider: '0.05em',
				widest: '0.1em'
			},
			lineHeight: {
				none: '1',
				tight: '1.1',
				snug: '1.2',
				normal: '1.25',
				relaxed: '1.5',
				loose: '1.75',

				// Saasfly semantic line heights
				display: '1.1',
				heading: '1.25',
				body: '1.5',
				caption: '1.25'
			}
		}
	},
	plugins: [require('@tailwindcss/forms')]
};
