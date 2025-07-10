import type { Handle } from '@sveltejs/kit';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import { WebSocketManager } from '$lib/server/kismet';
import { dev } from '$app/environment';
import type { IncomingMessage } from 'http';

// Create WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Initialize WebSocket manager
const wsManager = WebSocketManager.getInstance();

// Handle WebSocket connections
wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
  console.warn('New WebSocket connection from:', request.socket.remoteAddress);
  
  // Parse URL for subscription preferences
  const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
  const types: string[] | undefined = url.searchParams.get('types')?.split(',') || undefined;
  const minSignal: string | null = url.searchParams.get('minSignal');
  const deviceTypes: string[] | undefined = url.searchParams.get('deviceTypes')?.split(',');
  
  // Add client with optional subscription preferences
  wsManager.addClient(ws, {
    types: types ? new Set(types) : undefined,
    filters: {
      minSignal: minSignal ? parseInt(minSignal, 10) : undefined,
      deviceTypes
    }
  });
});

export const handle: Handle = async ({ event, resolve }) => {
  // Handle WebSocket upgrade requests
  if (event.url.pathname === '/api/kismet/ws' && event.request.headers.get('upgrade') === 'websocket') {
    // WebSocket upgrade handling requires platform-specific implementation
    // This is a placeholder for the actual WebSocket upgrade logic
    // In production, this would be handled by the deployment platform (e.g., Node.js adapter)
    console.warn('WebSocket upgrade requested but platform context not available');
  }
  
  // For non-WebSocket requests, continue with normal handling
  return resolve(event);
};

// Graceful shutdown
if (dev) {
  if (typeof process !== 'undefined') {
    process.on('SIGINT', () => {
      console.warn('Shutting down WebSocket server...');
      wsManager.destroy();
      wss.close(() => {
        console.warn('WebSocket server closed');
      });
    });
  }
}