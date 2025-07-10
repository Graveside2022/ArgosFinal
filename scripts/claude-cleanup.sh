#!/bin/bash
# Pre-claude cleanup to prevent memory issues

# Clean up any log files that exist
rm -f /tmp/restored_server.log /tmp/hackrf-server.log 2>/dev/null

# Check hackrf-sweeper.log specifically since it's the only active one
if [ -f "/tmp/hackrf-sweeper.log" ]; then
    SIZE=$(stat -c%s "/tmp/hackrf-sweeper.log" 2>/dev/null || stat -f%z "/tmp/hackrf-sweeper.log" 2>/dev/null || echo "0")
    if [ "$SIZE" -gt 10485760 ]; then
        echo "[Claude Cleanup] Rotating large hackrf-sweeper.log..."
        /home/pi/projects/ArgosFinal/scripts/log-rotation.sh >/dev/null 2>&1
    fi
fi

# Kill ALL vite processes for ArgosFinal before Claude starts
# This prevents memory issues from multiple dev servers
VITE_PIDS=$(ps aux | grep -E "vite.*ArgosFinal" | grep -v grep | awk '{print $2}')
if [ ! -z "$VITE_PIDS" ]; then
    echo "[Claude Cleanup] Stopping all vite processes to free memory..."
    echo "$VITE_PIDS" | xargs -r kill -9 2>/dev/null
    sleep 1
fi

# Also free up port 5173 if it's stuck
if lsof -i :5173 >/dev/null 2>&1; then
    echo "[Claude Cleanup] Freeing up port 5173..."
    lsof -ti :5173 | xargs -r kill -9 2>/dev/null
fi

# Clear node cache if it's too large
CACHE_SIZE=$(du -sm ~/.cache/claude-cli-nodejs 2>/dev/null | cut -f1 || echo "0")
if [ $CACHE_SIZE -gt 500 ]; then
    echo "[Claude Cleanup] Clearing Claude cache..."
    rm -rf ~/.cache/claude-cli-nodejs/*
fi