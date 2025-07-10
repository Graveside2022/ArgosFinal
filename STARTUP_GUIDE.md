# Argos Console Startup Guide

This guide provides step-by-step instructions for applying stability fixes, starting the server, and monitoring its performance.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to the project directory

## Applying the Three Stability Fixes

### Fix 1: Memory Leak Prevention in SweepManager

The sweep manager fix prevents memory leaks by properly cleaning up resources:

```bash
# The fix is already implemented in src/lib/server/hackrf/sweepManager.ts
# Key changes:
# - Added cleanup() method to properly dispose of subprocess and resources
# - Implemented automatic cleanup on process termination
# - Added memory usage monitoring
```

### Fix 2: Request Timeout and Error Handling

Request handling improvements are already implemented:

```bash
# Located in src/routes/api/hackrf/data-stream/+server.ts
# Key improvements:
# - 30-second request timeout
# - Proper error propagation
# - Resource cleanup on client disconnect
```

### Fix 3: WebSocket Connection Stability

WebSocket improvements are in place:

```bash
# Located in src/lib/server/websocket-server.ts
# Enhancements:
# - Connection health monitoring with heartbeat
# - Automatic reconnection logic
# - Proper cleanup on disconnect
```

## Starting the Server

### Development Mode

```bash
# Install dependencies (if not already done)
npm install

# Start in development mode with hot reload
npm run dev

# Alternative: Start with verbose logging
DEBUG=* npm run dev

# Start with custom port
PORT=3000 npm run dev
```

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run preview

# Alternative: Using Node directly
node build/index.js

# With PM2 (recommended for production)
pm2 start npm --name "argos-console" -- run preview
```

## Verifying Fixes Are Working

### 1. Check Memory Leak Prevention

```bash
# Monitor memory usage in real-time
watch -n 1 'ps aux | grep node | grep -v grep'

# Check Node.js memory usage
node -e "console.log(process.memoryUsage())"

# Monitor sweep manager cleanup
tail -f dev-server.log | grep -E "(cleanup|memory|sweep)"
```

### 2. Verify Request Handling

```bash
# Test data stream endpoint
curl -N http://localhost:5173/api/hackrf/data-stream

# Check for timeout handling (should timeout after 30s)
time curl http://localhost:5173/api/hackrf/data-stream

# Monitor request logs
tail -f dev-server.log | grep -E "(request|timeout|error)"
```

### 3. Test WebSocket Stability

```bash
# Check WebSocket connections
netstat -an | grep :5173 | grep ESTABLISHED

# Monitor WebSocket events
tail -f dev-server.log | grep -E "(websocket|connection|heartbeat)"

# Test WebSocket health
wscat -c ws://localhost:5173
```

## Monitoring Commands

### Real-time Performance Monitoring

```bash
# Combined monitoring dashboard (using tmux)
tmux new-session -d -s monitor
tmux send-keys -t monitor:0 'htop' C-m
tmux split-window -t monitor:0 -h
tmux send-keys -t monitor:0.1 'tail -f dev-server.log' C-m
tmux split-window -t monitor:0.1 -v
tmux send-keys -t monitor:0.2 'watch -n 1 "netstat -an | grep :5173"' C-m
tmux attach -t monitor
```

### Memory Usage Tracking

```bash
# Track Node.js process memory over time
while true; do
  echo "$(date): $(ps aux | grep node | grep -v grep | awk '{print $6}')" >> memory.log
  sleep 60
done

# View memory trends
tail -f memory.log
```

### Connection Monitoring

```bash
# Monitor active connections
watch -n 2 'ss -tunap | grep :5173'

# Track connection count
watch -n 1 'netstat -an | grep :5173 | grep ESTABLISHED | wc -l'
```

### Error Monitoring

```bash
# Watch for errors in real-time
tail -f dev-server.log | grep -i error

# Count errors per minute
tail -f dev-server.log | grep -i error | awk '{print strftime("%Y-%m-%d %H:%M")}' | uniq -c
```

## Troubleshooting

### If memory usage keeps growing:

```bash
# Force garbage collection (development only)
kill -USR2 $(pgrep -f "node.*dev")

# Restart the server
npm run dev
```

### If WebSocket connections drop:

```bash
# Check for port conflicts
lsof -i :5173

# Verify WebSocket server is running
ps aux | grep websocket
```

### If requests timeout:

```bash
# Check server load
uptime

# Monitor CPU usage
mpstat 1
```

## Quick Health Check Script

Create `health-check.sh`:

```bash
#!/bin/bash

echo "=== Argos Console Health Check ==="
echo

echo "1. Process Status:"
ps aux | grep node | grep -v grep || echo "❌ No Node process found"
echo

echo "2. Memory Usage:"
ps aux | grep node | grep -v grep | awk '{print "RSS: " $6 "KB, VSZ: " $5 "KB"}'
echo

echo "3. Active Connections:"
netstat -an | grep :5173 | grep ESTABLISHED | wc -l
echo

echo "4. Recent Errors (last 10):"
tail -n 1000 dev-server.log | grep -i error | tail -10
echo

echo "5. WebSocket Status:"
netstat -an | grep :5173 | grep -c LISTEN && echo "✅ WebSocket server listening" || echo "❌ WebSocket server not listening"
```

Make it executable:

```bash
chmod +x health-check.sh
./health-check.sh
```

## Recommended Monitoring Setup

For production environments, set up these monitoring tools:

1. **PM2 Monitoring** (if using PM2):

    ```bash
    pm2 monit
    pm2 logs argos-console
    ```

2. **System Monitoring**:

    ```bash
    # Install htop if not available
    sudo apt-get install htop

    # Run system monitor
    htop
    ```

3. **Log Aggregation**:
    ```bash
    # Rotate logs to prevent disk fill
    npm install -g pm2-logrotate
    pm2 install pm2-logrotate
    ```

## Summary

The three stability fixes are already implemented in the codebase:

1. Memory leak prevention through proper cleanup
2. Request timeout and error handling
3. WebSocket connection stability

To ensure stable operation:

- Start with `npm run dev` for development
- Use `npm run build && npm run preview` for production
- Monitor with the provided commands
- Use the health check script for quick status updates

All fixes work together to provide a stable, memory-efficient server that handles long-running operations gracefully.
