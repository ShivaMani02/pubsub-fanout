# 🚀 QUICK START GUIDE

Get PubSub Fanout running on localhost in **5-10 minutes**.

## ⚡ Fastest Option: Docker Compose

If you have Docker Desktop installed and running:

```bash
cd pubsub-fanout
docker-compose up -d
# Wait 30 seconds...
# Open http://localhost:3000
```

**Done!** System is ready to use.

---

## 💻 Local Development Option (Recommended)

Perfect for development with hot-reload. Needs Node.js 18+.

### Step 1: Check Prerequisites

```bash
node --version      # Should be v18 or higher
npm --version       # Should be v8 or higher
```

If not installed, get Node.js from https://nodejs.org/

### Step 2: Install Dependencies

```bash
cd pubsub-fanout
npm run install:all
```

### Step 3: Start Services (Use 3-4 Terminals)

**Terminal 1 - MongoDB:**
```bash
# Option A: Using Docker (easiest)
docker run -d --name pubsub_mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=mongo_password \
  mongo:latest

# Option B: Or start locally installed MongoDB
mongod
```

**Terminal 2 - Redis:**
```bash
# Option A: Using Docker (easiest)
docker run -d --name pubsub_redis \
  -p 6379:6379 \
  redis:latest redis-server --requirepass redis_password

# Option B: Or start locally installed Redis
redis-server --requirepass redis_password
```

**Terminal 3 - Backend:**
```bash
cd pubsub-fanout/server
npm run dev
# Backend running on http://localhost:5000
```

**Terminal 4 - Frontend:**
```bash
cd pubsub-fanout/client
npm start
# Frontend opens automatically at http://localhost:3000
```

---

## ✅ Verify Everything Works

Open http://localhost:3000 in your browser

You should see:
- ✅ Purple dashboard
- ✅ Control panel with sliders
- ✅ Statistics and charts
- ✅ No errors in console (F12)

Test the API:
```bash
curl http://localhost:5000/api/health
# Returns: {"success":true,"status":"Server is running",...}
```

---

## 🎮 Try It Out

### 1. Start a Simulation
- In **Controls** panel: Click **▶️ Start Simulation**
- Watch real-time message flow
- See charts update

### 2. Publish Custom Message
- In **Publisher Panel**:
  - Topic: `test-topic`
  - Message: Use the default JSON
  - Click **🚀 Publish**
- Message appears in **Event Log** instantly

### 3. Check Message History
```bash
curl "http://localhost:5000/api/messages/history?topic=test-topic&limit=5"
```

### 4. Get Statistics
```bash
curl http://localhost:5000/api/stats/topics
```

---

## 🛠️ Automated Setup (Windows/Linux/Mac)

### Windows
```bash
.\setup.bat
```

### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

These scripts:
- ✅ Check all prerequisites
- ✅ Start Docker containers (if needed)
- ✅ Install dependencies
- ✅ Show startup instructions

---

## 📱 Using Postman (API Testing)

1. Open Postman
2. Click **Import** → Select `postman_collection.json`
3. All 9 API endpoints appear in collection
4. Click any endpoint and click **Send**

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check MongoDB is running
docker ps | grep mongo
# Or:
mongosh --eval "db.adminCommand('ping')"
```

### "Port 3000 already in use"
```bash
# Kill process using port 3000
kill -9 $(lsof -t -i:3000)  # Linux/Mac
netstat -ano | findstr :3000  # Windows
taskkill /PID <PID> /F       # Windows
```

### "Cannot reach localhost:5000"
```bash
# Check backend is running
curl http://localhost:5000/api/health
# Check logs in Terminal 3
```

### "WebSocket connection failed"
```bash
# In browser console (F12):
# Should see "✓ Connected to server"
# Check CORS_ORIGIN in server/.env is correct
```

---

## 📖 Next Steps

1. **Explore Dashboard** - Try all features
2. **Read Full Setup Guide** - See [SETUP.md](SETUP.md)
3. **API Reference** - See [API.md](API.md)
4. **Architecture** - See [ARCHITECTURE.md](ARCHITECTURE.md)
5. **Development** - See [DEVELOPMENT.md](DEVELOPMENT.md)

---

## 🗂️ Key Files

```
pubsub-fanout/
├── QUICK_START.md          ← You are here!
├── SETUP.md                ← Detailed setup guide
├── README.md               ← Features and overview
├── API.md                  ← API documentation
├── ARCHITECTURE.md         ← System design
├── DEVELOPMENT.md          ← Development guide
├── docker-compose.yml      ← Docker containers
├── .env                    ← Default configuration (localhost)
├── postman_collection.json ← Postman API collection
├── setup.bat               ← Windows setup script
├── setup.sh                ← Linux/Mac setup script
├── server/                 ← Node.js backend
│   ├── .env               ← Server configuration
│   └── src/
│       ├── index.js       ← Main server (start here)
│       ├── config/        ← Database & Redis setup
│       ├── models/        ← MongoDB schemas
│       ├── routes/        ← API endpoints
│       ├── controllers/   ← Business logic
│       ├── pubsub/        ← Message broker & simulator
│       └── middleware/    ← Error handling
└── client/                 ← React frontend
    ├── .env               ← Client configuration
    └── src/
        ├── App.jsx        ← Main component (start here)
        ├── pages/         ← Page components
        ├── components/    ← UI components (7 visualization components)
        ├── services/      ← API & WebSocket clients
        └── context/       ← Global state management
```

---

## 💡 Common Commands

```bash
# Start Docker services
docker-compose up -d

# View logs
docker-compose logs -f              # All
docker-compose logs -f backend      # Just backend
docker-compose logs -f frontend     # Just frontend

# Stop systems
docker-compose down                 # Keep data
docker-compose down -v              # Remove data

# Access database
mongosh
# In mongosh:
> use pubsub_db
> db.messages.find().limit(5)

# Test Redis
redis-cli
> ping          # Returns PONG

# Rebuild Docker images
docker-compose up -d --build

# npm commands (from root)
npm run install:all     # Install all dependencies
npm run docker:up       # Start Docker
npm run docker:down     # Stop Docker
npm run docker:logs     # View logs
```

---

## ✨ Features to Explore

- **Real-time Dashboard** - Live visualization of message flow
- **Message Publishing** - Publish messages to topics via UI or API
- **Message History** - Query published messages by topic
- **Latency Monitoring** - See message delivery latency over time
- **Partition Heatmap** - Visualize load distribution
- **Event Log** - Real-time message activity feed
- **WebSocket Events** - Real-time subscription and messaging
- **REST API** - Full HTTP API for programmatic access
- **Simulation Mode** - Generate test messages automatically
- **Session Tracking** - Monitor publishers and subscribers

---

## 🚀 Ready to Go!

You now have a fully functional PubSub Fanout system running on localhost with:

✅ **Backend** - Express.js server with WebSocket support  
✅ **Frontend** - React dashboard with real-time visualizations  
✅ **Database** - MongoDB for persistence  
✅ **Broker** - Redis for pub/sub distribution  
✅ **API** - 9 REST endpoints + WebSocket events  
✅ **Documentation** - Comprehensive guides and API reference

**Questions or issues?** Check [SETUP.md](SETUP.md) or [README.md](README.md)

---

**Happy coding! 📡**

Last updated: March 5, 2026
