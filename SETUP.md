# Complete Setup Guide for PubSub Fanout

This guide covers all options for getting the system running on localhost: Docker, Local Development, and Manual Setup.

## ⚡ Quick Start (Recommended)

### Option 1: Docker Compose (Fastest - Requires Docker Desktop)

**Prerequisites:**
- Docker Desktop installed and running
- 4GB available RAM and disk space

**Steps:**

```bash
# Navigate to project
cd pubsub-fanout

# Start all services (MongoDB, Redis, Backend, Frontend)
docker-compose up -d

# Wait 20-30 seconds for services to start and be healthy
docker-compose ps

# Open http://localhost:3000 in browser
```

**Stop services:**
```bash
docker-compose down       # Keep data
docker-compose down -v    # Remove all data
```

**View logs:**
```bash
docker-compose logs -f              # All services
docker-compose logs -f backend      # Just backend
docker-compose logs -f frontend     # Just frontend
```

---

### Option 2: Local Development Setup (Recommended for Development)

This option runs MongoDB and Redis in Docker containers, but backend and frontend locally for faster development.

**Prerequisites:**
- Node.js 18+ from https://nodejs.org/
- Docker Desktop running (for MongoDB & Redis)

**Steps:**

```bash
# 1. Navigate to project
cd pubsub-fanout

# 2. Start MongoDB in Docker (Terminal 1)
docker run -d --name pubsub_mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=mongo_password \
  mongo:latest

# 3. Start Redis in Docker (Terminal 2)
docker run -d --name pubsub_redis \
  -p 6379:6379 \
  redis:latest redis-server --requirepass redis_password

# 4. Install dependencies (Terminal 3)
npm run install:all

# 5. Start backend in dev mode (Terminal 4)
cd server
npm run dev
# Backend runs on http://localhost:5000

# 6. Start frontend in dev mode (Terminal 5)
cd client
npm start
# Frontend runs on http://localhost:3000 (opens automatically)
```

**Stop services:**
```bash
# Stop Docker containers
docker stop pubsub_mongo pubsub_redis
docker rm pubsub_mongo pubsub_redis

# Stop backend and frontend (Ctrl+C in their terminals)
```

**View logs:**
```bash
# Backend logs are displayed in terminal
# Frontend logs in browser console (F12)
```

---

### Option 3: Fully Local Setup (No Docker)

This option runs everything locally on your machine.

**Prerequisites:**
- Node.js 18+ from https://nodejs.org/
- MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Redis from https://redis.io/download

**For Windows Users:**
If you're on Windows, you can use:
- MongoDB: https://www.mongodb.com/try/download/community
- Redis: Windows installer or WSL2 with Linux

**Steps:**

```bash
# 1. Navigate to project
cd pubsub-fanout

# 2. Start MongoDB (Terminal 1)
# Linux/Mac:
mongod

# Windows (if installed):
# Run MongoDB from Start Menu, or:
# mongod --dbpath "C:\path\to\data\directory"

# 3. Start Redis (Terminal 2)
# Linux/Mac:
redis-server --requirepass redis_password

# Windows (if installed):
# Run Redis from Start Menu, or in terminal:
# redis-server --requirepass redis_password

# 4. Install dependencies (Terminal 3)
npm run install:all

# 5. Start backend in dev mode (Terminal 4)
cd server
npm run dev

# 6. Start frontend in dev mode (Terminal 5)
cd client
npm start
```

**Configuration:**

For local setup, you may need to update the `.env` file in `server/` folder:

```env
# Change from Docker service names to localhost
MONGO_URI=mongodb://root:mongo_password@localhost:27017/pubsub_db?authSource=admin
REDIS_URL=redis://:redis_password@localhost:6379

# Keep frontend config as is
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🛠️ Using Setup Scripts

We've provided automated setup scripts for Windows and Linux/Mac.

### Windows

```bash
# In PowerShell or Command Prompt
.\setup.bat

# This will:
# 1. Check Node.js, npm, MongoDB, Redis
# 2. Start Docker containers for MongoDB & Redis (if local not found)
# 3. Install all dependencies
# 4. Display instructions for starting
```

### Linux/Mac

```bash
# Make script executable
chmod +x setup.sh

# Run setup
./setup.sh

# This will:
# 1. Check Node.js, npm, MongoDB, Redis
# 2. Start Docker containers for MongoDB & Redis (if local not found)
# 3. Install all dependencies
# 4. Display instructions for starting
```

---

## 🐛 Troubleshooting

### Issue: Docker containers won't start

```bash
# Check if Docker Desktop is running
docker ps

# If not, start Docker Desktop first

# Check logs
docker logs pubsub_mongo
docker logs pubsub_redis
docker logs pubsub_backend
docker logs pubsub_frontend
```

### Issue: Port already in use

```bash
# Find process using port
# Linux/Mac:
lsof -i :3000    # Frontend
lsof -i :5000    # Backend
lsof -i :27017   # MongoDB
lsof -i :6379    # Redis

# Kill process
kill -9 <PID>

# Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Cannot connect to MongoDB

```bash
# Check MongoDB is running
ps aux | grep mongod    # Linux/Mac
tasklist | grep mongod  # Windows

# Check MongoDB health
mongosh --eval "db.adminCommand('ping')"

# If in Docker:
docker logs pubsub_mongo
docker exec pubsub_mongo mongosh --eval "db.adminCommand('ping')"
```

### Issue: Cannot connect to Redis

```bash
# Check Redis is running
ps aux | grep redis    # Linux/Mac
tasklist | grep redis  # Windows

# Test Redis connection
redis-cli ping
# Should return: PONG

# If in Docker:
docker logs pubsub_redis
docker exec pubsub_redis redis-cli ping
```

### Issue: Backend can't connect to database

```bash
# Check env variables are correct
cat server/.env

# Backend should show this on startup:
# [INFO] MongoDB connected successfully
# [INFO] Redis Publisher connected
# [INFO] Redis Subscriber connected

# View full logs:
cd server && npm run dev
```

### Issue: Frontend can't connect to backend

```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check frontend env variables
cat client/.env
# Should have:
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_SOCKET_URL=http://localhost:5000

# Check browser console (F12) for WebSocket errors
```

### Issue: Cannot start because dependencies not installed

```bash
# Clear node_modules and reinstall
cd server && rm -rf node_modules && npm install
cd ../client && rm -rf node_modules && npm install
```

---

## ✅ Verification Checklist

After starting the system, verify everything works:

### 1. MongoDB

```bash
# Connect
mongosh

# In mongosh:
> use pubsub_db
> db.adminCommand('ping')
# Should return: { ok: 1 }
```

### 2. Redis

```bash
redis-cli --raw
# Command:
> ping
# Should return: PONG

# Exit:
> exit
```

### 3. Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Should return JSON:
# {
#   "success": true,
#   "status": "Server is running",
#   "timestamp": "2024-03-05T..."
# }
```

### 4. Frontend

Open http://localhost:3000 in browser

Should see:
- Purple header with "📡 PubSub Fanout System"
- Control panel on left
- Statistics and charts on right
- No console errors (F12)

### 5. WebSocket Connection

Open browser console (F12) and run:

```javascript
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected!'));
socket.on('stats:update', data => console.log('Stats:', data));
```

Should see:
- "Connected!" message
- Periodic stats updates

### 6. API Endpoints

```bash
# Publish message
curl -X POST http://localhost:5000/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{"topic":"test","message":{"data":"hello"}}'

# Get history
curl "http://localhost:5000/api/messages/history?topic=test"

# Get sessions
curl http://localhost:5000/api/sessions

# Get stats
curl http://localhost:5000/api/stats/topics
```

All should return JSON responses without errors.

---

## 📝 Configuration Files

### Server Configuration (server/.env)

```env
# Database
MONGO_URI=mongodb://root:mongo_password@mongodb:27017/pubsub_db?authSource=admin
REDIS_URL=redis://:redis_password@redis:6379

# Server
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Frontend
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Client Configuration (client/.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Next Steps

Once everything is running:

1. **Explore the Dashboard**
   - Start a simulation
   - Watch real-time visualizations
   - Publish custom messages

2. **Test the API**
   - Use Postman collection: `postman_collection.json`
   - Try all endpoints documented in `API.md`

3. **Review the Code**
   - Backend: `server/src/index.js` (start here)
   - Frontend: `client/src/App.jsx` (start here)
   - See `DEVELOPMENT.md` for code structure

4. **Read Documentation**
   - `README.md` - Overview and features
   - `API.md` - Complete API reference
   - `ARCHITECTURE.md` - System design
   - `DEVELOPMENT.md` - Development guide

---

## 💡 Pro Tips

### Development with Hot Reload

Both backend (with nodemon) and frontend (with React) auto-reload on file changes. Just edit and save!

### Useful npm Commands

```bash
# From root directory
npm run install:all    # Install all dependencies
npm run docker:up      # Start Docker Compose
npm run docker:down    # Stop Docker Compose
npm run docker:logs    # View all logs

# From server directory
npm run dev            # Start with auto-reload
npm run start          # Start normally
npm test               # Run tests
npm run lint           # Check code style

# From client directory
npm start              # Start dev server (auto-opens browser)
npm run build          # Build for production
npm test               # Run tests
npm run lint           # Check code style
```

### Production Deployment

See `DEVELOPMENT.md` for deployment to cloud platforms (AWS, Google Cloud, Azure, etc.)

---

## ❓ Still Having Issues?

1. Check the relevant troubleshooting section above
2. Review logs with `docker logs` or in terminal
3. Verify all prerequisites are installed: `node --version`, `docker --version`
4. Try the fully local setup if Docker isn't available
5. Check firewall settings - ensure ports 3000, 5000, 27017, 6379 are accessible

---

**Happy coding! 🚀**

Last updated: March 5, 2026
