import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock WebSocket
global.WebSocket = vi.fn(() => ({
	send: vi.fn(),
	close: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	readyState: 1,
	CONNECTING: 0,
	OPEN: 1,
	CLOSING: 2,
	CLOSED: 3
})) as unknown as typeof WebSocket;

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};
global.localStorage = localStorageMock as unknown as Storage;

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn(((contextId: string, _options?: unknown) => {
	if (contextId === '2d') {
		return {
			fillStyle: '',
			fillRect: vi.fn(),
			clearRect: vi.fn(),
			getImageData: vi.fn(() => ({
				data: new Uint8ClampedArray(4)
			})),
			putImageData: vi.fn(),
			createImageData: vi.fn(() => []),
			setTransform: vi.fn(),
			drawImage: vi.fn(),
			save: vi.fn(),
			restore: vi.fn(),
			scale: vi.fn(),
			rotate: vi.fn(),
			translate: vi.fn(),
			transform: vi.fn(),
			beginPath: vi.fn(),
			closePath: vi.fn(),
			moveTo: vi.fn(),
			lineTo: vi.fn(),
			bezierCurveTo: vi.fn(),
			quadraticCurveTo: vi.fn(),
			arc: vi.fn(),
			arcTo: vi.fn(),
			ellipse: vi.fn(),
			rect: vi.fn(),
			fill: vi.fn(),
			stroke: vi.fn(),
			clip: vi.fn(),
			isPointInPath: vi.fn(),
			isPointInStroke: vi.fn(),
			strokeStyle: '',
			lineWidth: 1,
			lineCap: 'butt',
			lineJoin: 'miter',
			miterLimit: 10,
			setLineDash: vi.fn(),
			getLineDash: vi.fn(() => []),
			lineDashOffset: 0,
			font: '10px sans-serif',
			textAlign: 'start',
			textBaseline: 'alphabetic',
			direction: 'ltr',
			fillText: vi.fn(),
			strokeText: vi.fn(),
			measureText: vi.fn(() => ({ width: 0 }))
		} as unknown as CanvasRenderingContext2D;
	}
	return null;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext);

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
})) as unknown as typeof ResizeObserver;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
})) as unknown as typeof IntersectionObserver;
