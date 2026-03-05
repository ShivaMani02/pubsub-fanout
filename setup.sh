#!/bin/bash

# =========================================
# PubSub Fanout - Setup Script for Linux/Mac
# =========================================
# This script sets up and starts the entire system
# Requires: Node.js 18+, MongoDB, Redis

set -e

echo ""
echo "==================================================="
echo "PubSub Fanout System - Linux/Mac Setup"
echo "==================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not installed"
    exit 1
fi

echo "[OK] npm is installed: $(npm --version)"

# Check MongoDB
echo ""
echo "Checking MongoDB..."
if ! command -v mongosh &> /dev/null; then
    echo "[WARNING] mongosh not found. Attempting Docker fallback..."
    if command -v docker &> /dev/null; then
        echo "Starting MongoDB in Docker..."
        docker run --name pubsub_mongo -d -p 27017:27017 \
          -e MONGO_INITDB_ROOT_USERNAME=root \
          -e MONGO_INITDB_ROOT_PASSWORD=mongo_password \
          mongo:latest || true
        sleep 3
        echo "[OK] MongoDB started in Docker"
    else
        echo "[ERROR] MongoDB and Docker not found"
        echo "Please install MongoDB Community Edition from https://www.mongodb.com/try/download/community"
        exit 1
    fi
else
    echo "[OK] MongoDB found: $(mongosh --version)"
fi

# Check Redis
echo ""
echo "Checking Redis..."
if ! command -v redis-cli &> /dev/null; then
    echo "[WARNING] redis-cli not found. Attempting Docker fallback..."
    if command -v docker &> /dev/null; then
        echo "Starting Redis in Docker..."
        docker run --name pubsub_redis -d -p 6379:6379 \
          redis:latest redis-server --requirepass redis_password || true
        sleep 3
        echo "[OK] Redis started in Docker"
    else
        echo "[ERROR] Redis and Docker not found"
        echo "Please install Redis from https://redis.io/download"
        exit 1
    fi
else
    echo "[OK] Redis found: $(redis-cli --version)"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
echo ""

echo "Installing root dependencies..."
npm install

echo ""
echo "Installing server dependencies..."
cd server
npm install
cd ..

echo ""
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Success
echo ""
echo "==================================================="
echo "SUCCESS! Setup complete"
echo "==================================================="
echo ""
echo "To start the system, run in different terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd client"
echo "  npm start"
echo ""
echo "Then open your browser to: http://localhost:3000"
echo ""
echo "For logs, use:"
echo "  - Backend: http://localhost:5000/api/health"
echo "  - Frontend: Browser Console (F12)"
echo ""
