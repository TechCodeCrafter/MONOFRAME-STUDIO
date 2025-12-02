#!/bin/bash

# Set file descriptor limit for this session
ulimit -n 10240

# Show the limit
echo "📊 File descriptor limit: $(ulimit -n)"
echo "🚀 Starting MonoFrame Studio dev server..."
echo ""

# Start pnpm dev
pnpm dev



