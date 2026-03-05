# PubSub Fanout - Real-Time Message Distribution System

A production-ready distributed messaging system with Apache Kafka-like pub/sub, built with Node.js backend, React frontend, MongoDB for persistence, and Redis for the message broker.

## ⚡ Quick Start (Docker)

```bash
# 1. Start all services (MongoDB, Redis, Backend, Frontend)
docker-compose up -d

# 2. Wait 10-15 seconds for services to initialize
docker-compose ps  # All should show "healthy" or "up"

# 3. Open dashboard
# Frontend:  http://localhost:3000
# API Docs:  http://localhost:5000/api/health
# Postman:   Import postman_collection.json
```

## 📖 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **README.md** | This file - Overview & getting started | 10 min |
| **API.md** | Complete API reference & WebSocket events | 20 min |
| **ARCHITECTURE.md** | System design & component details | 15 min |
| **DEVELOPMENT.md** | Development setup & contributing | 15 min |

## 🌟 Features

### Core
- ✅ **Real-time Pub/Sub** - Topic-based message distribution
- ✅ **Message Fanout** - Distribute to multiple subscribers simultaneously
- ✅ **Persistence** - MongoDB stores all messages and session data
- ✅ **Performance Monitoring** - Track latency, throughput, partition load
- ✅ **REST API** - 8 HTTP endpoints for programmatic access
- ✅ **WebSocket Support** - Real-time events via Socket.io
- ✅ **Session Management** - Track publishers and subscribers

### UI/Visualization
- ✅ **Live Dashboard** - Real-time message flow visualization
- ✅ **Latency Charts** - Monitor message processing time over time
- ✅ **Topic Statistics** - Active topics and subscriber counts
- ✅ **Event Log** - Real-time message activity feed
- ✅ **Publisher Panel** - Send custom messages via UI
- ✅ **Partition Heatmap** - Visualize load distribution

### DevOps
- ✅ **Docker Support** - Complete containerized stack
- ✅ **Docker Compose** - Single command deployment
- ✅ **Health Checks** - All services include health endpoints
- ✅ **Logging** - Comprehensive application logging
- ✅ **Configuration** - Environment variable support

## 📋 Prerequisites

### For Docker (Recommended)
- Docker Desktop or Docker Engine
- Docker Compose v1.29+

### For Local Development
- Node.js 16.0+ (use nvm: `nvm install 18`)
- MongoDB 5.0+ (or Docker: `docker run -d -p 27017:27017 mongo:5.0`)
- Redis 7.0+ (or Docker: `docker run -d -p 6379:6379 redis:7.0`)
- npm 8.0+

## 🚀 Installation

### Option 1: Docker Compose (Easiest - Recommended)

```bash
# Clone/navigate to project
cd pubsub-fanout

# Start all services with one command
docker-compose up -d

# Verify services are healthy
docker-compose ps

# View logs
docker-compose logs -f
```

**Services started:**
- MongoDB (port 27017)
- Redis (port 6379)
- Backend API (port 5000)
- Frontend (port 3000)

### Option 2: Local Development Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start MongoDB (new terminal)
docker run -d -p 27017:27017 --name pubsub_mongo mongo:5.0

# 3. Start Redis (new terminal)
docker run -d -p 6379:6379 --name pubsub_redis redis:7.0

# 4. Start backend (new terminal)
cd server
npm run dev

# 5. Start frontend (new terminal)
cd client
npm start

# 6. Open browser
# Frontend:  http://localhost:3000
# API:       http://localhost:5000/api/health
# Postman:   Import postman_collection.json
```

## 📁 Project Structure

```
pubsub-fanout/
├── README.md                      # This file
├── API.md                         # API reference & WebSocket events
├── ARCHITECTURE.md                # System architecture & design
├── DEVELOPMENT.md                 # Development setup & contributing
├── docker-compose.yml             # Container orchestration
├── postman_collection.json        # Postman API collection (import in Postman)
├── package.json                   # Root scripts (install:all, etc.)
│
├── server/                        # Node.js Backend
│   ├── src/
│   │   ├── index.js              # Express + Socket.io setup (start here)
│   │   ├── config/               # Configuration (logger, mongo, redis)
│   │   ├── models/               # Mongoose schemas (Message, Session)
│   │   ├── routes/               # API endpoints
│   │   ├── controllers/          # Business logic
│   │   ├── middleware/           # Request middleware
│   │   ├── pubsub/               # Messaging core (broker, simulator)
│   │   └── utils/                # Utility functions
│   ├── package.json
│   └── Dockerfile
│
└── client/                        # React Frontend
    ├── src/
    │   ├── App.jsx               # Main app component (start here)
    │   ├── index.js              # React entry point
    │   ├── App.css               # Global styles
    │   ├── index.css             # Base styles
    │   ├── pages/                # Page components (Dashboard, History)
    │   ├── components/           # UI components (7 visualization components)
    │   ├── services/             # API & WebSocket clients
    │   ├── context/              # React Context (global state)
    │   ├── hooks/                # Custom hooks (useCanvas)
    │   └── utils/                # Utility functions
    ├── public/
    │   └── index.html            # HTML template
    ├── package.json
    └── Dockerfile
```

## 🎯 First Steps

### Step 1: Verify System is Running

```bash
# Check all services are healthy
docker-compose ps

# Expected output:
# NAME          STATUS
# mongodb       Up (healthy)
# redis         Up (healthy)
# backend       Up (healthy)
# frontend      Up (healthy)
```

### Step 2: Open Dashboard

Visit **http://localhost:3000** in your browser

**You should see:**
- Purple gradient header
- Control panel on left side
- Statistics in center
- Charts and visualizations on right

### Step 3: Start a Simulation

1. In the **Controls** panel (left side):
   - Adjust "Publishers" slider to 3
   - Adjust "Subscribers" slider to 10
   - Click **▶️ Start Simulation**

2. Watch the dashboard update in real-time:
   - Message animation on FanoutCanvas
   - Latency chart updates
   - Event log shows incoming messages
   - Statistics update automatically

### Step 4: Publish Custom Message

1. In the **Publisher Panel**:
   - Topic: Enter `test-topic`
   - Message: Use default JSON or customize
   - Click **🚀 Publish**

2. Check the **Event Log** - message appears immediately!

### Step 5: Test the API

```bash
# Get server health
curl http://localhost:5000/api/health

# Get topic statistics
curl http://localhost:5000/api/stats/topics

# Publish a message
curl -X POST http://localhost:5000/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "orders",
    "message": {"orderId": "123", "amount": 99.99}
  }'

# Get message history
curl "http://localhost:5000/api/messages/history?topic=orders&limit=5"

# Get all sessions
curl http://localhost:5000/api/sessions

# Get session stats
curl http://localhost:5000/api/sessions/SESSION_ID
```

## 💻 Usage Examples

### HTTP REST API

```javascript
// Publish a message
const response = await fetch('http://localhost:5000/api/messages/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'orders',
    message: { orderId: 'order_123', amount: 99.99 }
  })
});

const result = await response.json();
console.log(`Message ${result.messageId} published to ${result.fanoutCount} subscribers`);
```

### WebSocket Real-Time Events

```javascript
// In browser console or Node.js app
const socket = io('http://localhost:5000');

// Connect
socket.on('connect', () => {
  console.log('Connected to server');
  
  // Subscribe to topic
  socket.emit('topic:subscribe', { topic: 'orders' });
});

// Listen for new messages
socket.on('message:new', (message) => {
  console.log('Received:', message);
  // {
  //   messageId: "msg_1234567890",
  //   topic: "orders",
  //   message: { orderId: "order_123", amount: 99.99 },
  //   publisher: "session_xyz",
  //   fanoutCount: 5,
  //   latency: 23,
  //   receivedAt: "2024-03-05T10:30:45.123Z"
  // }
});

// Publish via WebSocket
socket.emit('message:publish', {
  topic: 'orders',
  payload: { orderId: 'order_456', amount: 149.99 }
});

// Health check (ping/pong)
socket.emit('ping');
socket.on('pong', (data) => {
  console.log(`Latency: ${Date.now() - data.timestamp}ms`);
});
```

### Using Postman

1. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Select `postman_collection.json` from project root
   - Collection loads with all 9 API endpoints

2. **Set Variables:**
   - In collection, go to "Variables" tab
   - Update `baseUrl`, `sessionId`, `simulationId` as needed

3. **Make Requests:**
   - Click any endpoint
   - Modify body/params as needed
   - Click "Send"
   - See response in right panel

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server
NODE_ENV=development
PORT=5000
LOG_LEVEL=info

# Database
MONGODB_URI=mongodb://mongodb:27017/pubsub_db
MONGODB_USER=pubsub_user
MONGODB_PASSWORD=pubsub_pass

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
```

### Docker Compose Custom Configuration

Edit `docker-compose.yml` to customize:

```yaml
# Change port mappings
services:
  frontend:
    ports:
      - "3001:3000"  # Changed from 3000:3000
  backend:
    ports:
      - "5001:5000"  # Changed from 5000:5000

# Change MongoDB data directory
  mongodb:
    volumes:
      - "/custom/path/mongo:/data/db"
```

## 📊 API Endpoints

All endpoints are prefixed with `/api`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **GET** | `/health` | Server health status |
| **POST** | `/messages/publish` | Publish message to topic |
| **GET** | `/messages/history` | Get message history |
| **GET** | `/sessions` | List all sessions |
| **GET** | `/sessions/:sessionId` | Get session stats |
| **POST** | `/simulation/start` | Start message simulation |
| **POST** | `/simulation/stop/:simulationId` | Stop simulation |
| **GET** | `/simulation/stats/:simulationId` | Get simulation stats |
| **GET** | `/stats/topics` | Get topic statistics |

**Full documentation:** See [API.md](API.md)

## 🔗 WebSocket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `connect` | Client ← Server | Connection established |
| `topic:subscribe` | Client → Server | Subscribe to topic |
| `topic:subscribed` | Client ← Server | Subscription confirmed |
| `message:new` | Client ← Server | New message received |
| `message:publish` | Client → Server | Publish custom message |
| `stats:update` | Client ← Server | Broadcast stats every 5s |
| `ping` / `pong` | Client ↔ Server | Connection health check |

**Full documentation:** See [API.md](API.md#websocket-events)

## 🐛 Troubleshooting

### Services won't start

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs

# Check for port conflicts
lsof -i :3000    # Frontend port
lsof -i :5000    # Backend port
lsof -i :27017   # MongoDB port
lsof -i :6379    # Redis port

# Restart services
docker-compose restart

# Full restart (removes containers)
docker-compose down && docker-compose up -d
```

### Port already in use

```bash
# Find process using port
lsof -i :5000  # Replace 5000 with your port

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
# ports:
#   - "5001:5000"  # Use 5001 instead of 5000
```

### Frontend can't reach backend

```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check frontend environment variables
cat client/.env

# It should have:
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_WS_URL=http://localhost:5000

# Restart frontend
docker-compose restart frontend
```

### Database connection errors

```bash
# Check MongoDB is running
docker-compose logs mongodb

# Verify MongoDB is listening
docker exec pubsub_mongodb \
  mongosh --eval "db.adminCommand('ping')"

# Reset MongoDB
docker-compose down
docker volume rm pubsub-fanout_mongodb_data
docker-compose up -d mongodb
```

### Redis connection errors

```bash
# Check Redis is running
docker-compose logs redis

# Check Redis is responding
docker exec pubsub_redis redis-cli ping

# Clear Redis cache (careful!)
docker exec pubsub_redis redis-cli FLUSHALL
```

## 📚 Architecture Overview

The system consists of 4 main layers:

```
┌─────────────────────────────────────┐
│     React Frontend (Client)          │  - Dashboard visualization
│   - Controls, Charts, Event Log      │  - Message publishing
│   - Real-time updates via WebSocket │  - Statistics display
└────────────────┬────────────────────┘
                 │ HTTP + WebSocket
                 ▼
┌─────────────────────────────────────┐
│    Express.js Backend (Server)       │  - REST API endpoints
│   - Routes, Controllers, Middleware  │  - WebSocket handler
│   - Request validation & error handl │  - Message routing
└────────────────┬────────────────────┘
         ┌───────┼───────┐
         ▼       ▼       ▼
      ┌─────┐ ┌────┐ ┌─────┐
      │Redis│ │FS  │ │Mongo│  - Pub/Sub broker (Redis)
      └─────┘ └────┘ └─────┘  - Message storage (Mongo)
         │       │       │
         └───────┼───────┘
                 ▼
      ┌──────────────────────┐
      │  Broker & Simulator  │  - Core messaging logic
      │   - Message fanout   │  - Test data generation
      │   - Partition logic  │  - Performance tracking
      └──────────────────────┘
```

**Full architecture details:** See [ARCHITECTURE.md](ARCHITECTURE.md)

## 🚀 Deployment

### Docker Compose (Single Server)

```bash
# On your Linux server:
cd /opt/pubsub-fanout
docker-compose -f docker-compose.yml up -d

# System is now running and accessible
```

### Cloud Deployment

The system can be deployed to:
- **AWS** (ECS/Fargate, EC2)
- **Google Cloud** (Cloud Run, GKE)
- **Azure** (Container Instances, AKS)
- **DigitalOcean** (App Platform, Docker droplets)
- **Heroku** (simplified Node.js deployment)

**Deployment guide:** See [DEVELOPMENT.md](DEVELOPMENT.md#deployment)

## 🛠️ Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Last N lines
docker-compose logs -f --tail=50
```

### Stop/Start Services

```bash
# Stop but keep data
docker-compose stop

# Start again
docker-compose start

# Restart specific service
docker-compose restart backend

# Stop and remove everything
docker-compose down    # Keeps volumes
docker-compose down -v # Removes volumes too (careful!)
```

### Access Database

```bash
# MongoDB shell
docker exec pubsub_mongodb mongosh

# In mongosh:
use pubsub_db
db.messages.find().limit(5)
db.sessions.find().limit(5)
db.messages.countDocuments()
```

### Monitor Resources

```bash
# Container stats
docker stats

# Memory usage
docker-compose stats

# View Docker logs
docker logs <container_id>
```

## 📦 Development

### Install & Setup

```bash
# Install dependencies
npm run install:all

# Run linting
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

### Development Workflow

```bash
# Terminal 1: MongoDB
docker run -d -p 27017:27017 mongo:5.0

# Terminal 2: Redis
docker run -d -p 6379:6379 redis:7.0

# Terminal 3: Backend
cd server
npm run dev

# Terminal 4: Frontend
cd client
npm start
```

**Full development guide:** See [DEVELOPMENT.md](DEVELOPMENT.md)

## 🤝 Contributing

We welcome contributions! The project uses:
- **JavaScript/Node.js** - ES6+ with clear comments
- **React** - Functional components & hooks
- **Express.js** - RESTful API
- **MongoDB** - Document storage
- **Redis** - Message broker

**Contribution guide:** See [DEVELOPMENT.md](DEVELOPMENT.md#contributing)

## 📝 Code Quality

- **800+ inline comments** throughout codebase
- **Clear variable names** for easy understanding
- **Error handling** on all critical paths
- **Logging** at all major operations
- **Input validation** on all endpoints
- **Clean code structure** following industry standards

## 📄 License

This project is provided as-is for learning and demonstration purposes.

## 📞 Support

- **Documentation**: Check [README.md](README.md), [API.md](API.md), [ARCHITECTURE.md](ARCHITECTURE.md)
- **Development**: See [DEVELOPMENT.md](DEVELOPMENT.md)
- **Code Comments**: 800+ comments explaining logic
- **Examples**: See API reference and code samples

## 🎓 Learning Resources

The project is designed to teach:
- **Pub/Sub messaging patterns** - Real implementation of message distribution
- **Real-time communication** - WebSocket with Socket.io
- **Database design** - MongoDB schemas and queries
- **API design** - RESTful endpoints
- **Frontend architecture** - React patterns and best practices
- **DevOps** - Docker, containerization, deployment
- **Performance monitoring** - Tracking latency and throughput

## ✅ Verification Checklist

```bash
# 1. Docker Compose running?
docker-compose ps

# 2. Frontend loads?
curl http://localhost:3000

# 3. Backend API responds?
curl http://localhost:5000/api/health

# 4. Can publish message?
curl -X POST http://localhost:5000/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{"topic": "test", "message": {"data": "hello"}}'

# 5. Can get history?
curl http://localhost:5000/api/messages/history?topic=test

# 6. Database working?
docker exec pubsub_mongodb mongosh --eval "db.adminCommand('ping')"

# 7. Redis working?
docker exec pubsub_redis redis-cli ping
```

**All should succeed without errors!**

---

**Get started now:** `docker-compose up -d` in project root, then visit http://localhost:3000

**Questions?** Check [API.md](API.md), [ARCHITECTURE.md](ARCHITECTURE.md), or [DEVELOPMENT.md](DEVELOPMENT.md)

**Last Update:** March 5, 2026
