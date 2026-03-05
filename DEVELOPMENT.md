# Development Guide & Contributing

Guide for developers to set up, understand, and contribute to the PubSub Fanout system.

## 🚀 Development Setup

### Prerequisites

- Node.js 16+ (or 18+ recommended)
- MongoDB 5.0+ (local or Docker)
- Redis 7.0+ (local or Docker)
- Git
- npm or yarn

### Quick Start for Development

```bash
# 1. Clone repository (or navigate to existing folder)
cd pubsub-fanout

# 2. Install all dependencies
npm run install:all

# 3. Start MongoDB (Terminal 1)
docker run -d -p 27017:27017 --name pubsub_mongo mongo:5.0

# 4. Start Redis (Terminal 2)
docker run -d -p 6379:6379 --name pubsub_redis redis:7.0

# 5. Start backend in development mode (Terminal 3)
cd server
npm run dev
# Backend runs on http://localhost:5000

# 6. Start frontend in development mode (Terminal 4)
cd client
npm start
# Frontend opens automatically at http://localhost:3000
```

### Environment Configuration

Create `.env` file in `server/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/pubsub_db
MONGODB_USER=pubsub_user
MONGODB_PASSWORD=pubsub_pass
MONGODB_AUTH_SOURCE=admin

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
```

## 📁 Project Structure

### Backend Architecture

```
server/src/
├── index.js                    # Express + Socket.io initialization
├── config/
│   ├── logger.js              # Winston logger setup
│   ├── mongo.js               # MongoDB connection
│   └── redis.js               # Redis client setup
├── models/
│   ├── Message.js             # Message schema + methods
│   └── Session.js             # Session schema + tracking
├── routes/
│   └── api.js                 # All API endpoint routes
├── controllers/
│   └── simController.js       # Request handlers
├── pubsub/
│   ├── broker.js              # Redis pub/sub wrapper
│   └── simulator.js           # Message generation logic
├── middleware/
│   ├── errorHandler.js        # Global error handler
│   └── logger.js              # Request logging
└── utils/
    └── helpers.js             # Utility functions
```

### Frontend Architecture

```
client/src/
├── App.jsx                    # Root component
├── App.css                    # Global application styles
├── index.js                   # React entry point
├── index.css                  # Base styles
├── pages/
│   ├── Dashboard.jsx          # Main dashboard layout
│   └── History.jsx            # Message history page
├── components/
│   ├── Controls.jsx           # Simulation controls
│   ├── StatsBar.jsx           # Statistics display
│   ├── FanoutCanvas.jsx       # Message visualization (Canvas API)
│   ├── LatencyChart.jsx       # Latency chart (Canvas)
│   ├── EventLog.jsx           # Message activity log
│   ├── PublisherPanel.jsx     # Custom message publishing
│   └── PartitionHeatmap.jsx   # Partition load heatmap
├── services/
│   ├── api.js                 # HTTP client (Axios)
│   └── socket.js              # WebSocket client (Socket.io)
├── context/
│   └── SimContext.jsx         # Global state management
└── hooks/
    └── useCanvas.js           # Canvas drawing hook
```

## 🔑 Key Concepts

### Message Flow

```
1. Publishers → REST API or WebSocket
2. API/Handler → Redis Pub/Sub
3. Redis → All subscribers (fanout)
4. Subscribers → React components
5. React → Update dashboard visualization
```

### Core Components

#### Message Model
```javascript
// Message document in MongoDB
{
  messageId: "msg_1234567890",
  topic: "orders",
  partition: 2,
  message: { /* User data */ },
  publisher: "session_xyz",
  fanoutCount: 5,
  latency: 23,
  processed: true,
  createdAt: ISODate("2024-03-05T10:30:45.123Z")
}
```

#### Session Tracking
```javascript
// Session document in MongoDB
{
  sessionId: "session_xyz123",
  type: "publisher|subscriber",
  topics: ["orders", "notifications"],
  messageCount: 150,
  receivedCount: 0,
  averageLatency: 45,
  isActive: true,
  createdAt: ISODate("2024-03-05T10:30:45.123Z")
}
```

#### Redis Pub/Sub
```javascript
// Redis channel structure
// Channel: topic_name
// Message: { messageId, topic, message, publisher, fanoutCount, latency }

// Example: topic_name = "orders"
// Publisher sends to Redis channel "orders"
// All subscribers listening on "orders" receive instantly
```

## 🛠️ Development Workflow

### Making Changes to Backend

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Edit files in server/src/
# The dev server hot-reloads automatically

# 3. Test your changes
# Option A: Manual via cURL
curl -X POST http://localhost:5000/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{"topic":"test","message":{"data":"hello"}}'

# Option B: Use Postman collection
# Import postman_collection.json

# 4. Check logs for any errors
docker logs pubsub_backend

# 5. Commit and push
git add .
git commit -m "feat(pubsub): Add your feature description"
git push origin feature/your-feature-name
```

### Making Changes to Frontend

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Edit files in client/src/
# React dev server hot-reloads automatically

# 3. Test in browser
# Browser will refresh automatically at http://localhost:3000

# 4. Open DevTools (F12) to check for errors
# Console, Network, React DevTools tabs

# 5. Commit and push
git add .
git commit -m "feat(ui): Add your feature description"
git push origin feature/your-feature-name
```

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
cd server
npm test

# Run specific test file
npm test -- test/api.test.js

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on file changes)
npm test -- --watch
```

### Frontend Tests

```bash
# Run all tests
cd client
npm test
# Press 'a' to run all tests

# Run specific test
npm test -- Controls.test.js

# Run with coverage
npm test -- --coverage

# Exit watch mode
# Press 'q'
```

### Manual Testing Checklist

- [ ] Start Docker services
- [ ] Frontend loads without console errors
- [ ] Can start simulation
- [ ] Can publish message
- [ ] Message appears in event log
- [ ] Dashboard visualizations update
- [ ] API endpoints respond correctly
- [ ] WebSocket events work
- [ ] Stop simulation works
- [ ] No memory leaks (check DevTools)

## 📝 Code Style & Standards

### JavaScript/Node.js

```javascript
// ✅ Good: Clear names, comments for complex logic
const calculateAverageLatency = (messages) => {
  // Filter out invalid messages
  const validMessages = messages.filter(msg => msg.latency > 0);
  
  if (validMessages.length === 0) return 0;
  
  // Sum all latencies and divide by count
  const totalLatency = validMessages.reduce((sum, msg) => sum + msg.latency, 0);
  return totalLatency / validMessages.length;
};

// ❌ Avoid: Unclear names, no comments
const f = (m) => m.reduce((a, b) => a + b.l, 0) / m.length;
```

### React Components

```jsx
// ✅ Good: Functional component with hooks, clear props
const MessageCard = ({ message, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Handle expand/collapse UI state
  const handleToggle = () => setIsExpanded(!isExpanded);
  
  return (
    <div className="message-card">
      <div className="message-header" onClick={handleToggle}>
        <strong>{message.topic}</strong>
        <span>{message.messageId}</span>
      </div>
      {isExpanded && (
        <div className="message-body">
          <pre>{JSON.stringify(message.message, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// ❌ Avoid: Unclear prop names, no comments
const MC = ({ m, o }) => <div>{m.t}</div>;
```

### Comments

Include comments for:
- Complex logic or algorithms
- Non-obvious design decisions
- Important sections of code
- TODO items for future work

```javascript
// ❌ Obvious, unnecessary comment
const x = 5 + 3; // Add 5 and 3

// ✅ Helpful comment explaining why
// Use a small initial batch to test connection before bulk operations
const INITIAL_BATCH_SIZE = 10;
```

## 🔍 Debugging

### Backend Debugging

```bash
# 1. Check logs
docker logs pubsub_backend -f

# 2. Enable debug logging
NODE_ENV=development LOG_LEVEL=debug npm run dev

# 3. Use Node debugger
node --inspect=9229 src/index.js
# Then open chrome://inspect in Chrome

# 4. MongoDB queries
docker exec pubsub_mongo mongosh
> use pubsub_db
> db.messages.find().limit(5)
> db.sessions.find()

# 5. Redis debugging
docker exec pubsub_redis redis-cli
> KEYS *
> GET key_name
> FLUSHALL  # Clear all data (careful!)
```

### Frontend Debugging

```bash
# 1. Browser DevTools (F12 or Cmd+Option+I)
# - Console: Check for errors
# - Network: Monitor API calls
# - Application: Check localStorage/sessionStorage
# - React DevTools: Inspect components and state

# 2. React DevTools Extension
# Install from Chrome Web Store
# Inspect component hierarchy and props

# 3. Socket.io Monitor
# In browser console:
socket.on('message:new', msg => console.log('Message:', msg));

# 4. Performance profiling
# DevTools → Performance → Record and analyze
```

## 🤝 Contributing Guidelines

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Welcome diverse perspectives
- No harassment or discrimination

### Before Making Changes

1. Check existing issues and pull requests
2. Discuss major changes first
3. Follow the existing code style
4. Write tests for new features
5. Update documentation

### Commit Messages

Follow conventional commits format:

```
type(scope): Short description

Longer explanation of what this commit does
and why it was necessary.

Fixes #123
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation update
- `style` - Code formatting
- `refactor` - Code restructuring
- `test` - Test additions/changes
- `chore` - Maintenance tasks

**Examples:**
```
feat(pubsub): Add message expiration feature
fix(socket): Resolve connection memory leak
docs(readme): Update installation instructions
refactor(models): Simplify session schema
test(api): Add endpoint integration tests
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Follow code style guidelines
   - Add comments for complex logic
   - Write tests for new functionality
   - Update README/docs if needed

3. **Test thoroughly**
   ```bash
   npm test           # Backend tests
   npm run lint       # Linting
   npm run build      # Production build
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Breaking change
   
   ## Related Issues
   Closes #123
   
   ## Testing
   How did you test this change?
   
   ## Checklist
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

6. **Address review feedback**
   - Respond respectfully
   - Make requested changes
   - Re-request review when ready

### Code Review Checklist

When reviewing PRs, check:
- [ ] Does it follow code style?
- [ ] Are tests added for new features?
- [ ] Is documentation updated?
- [ ] Does it introduce breaking changes?
- [ ] Are error cases handled?
- [ ] Is performance acceptable?
- [ ] Are edge cases considered?

## 🚀 Deployment

### Local Testing Before Deployment

```bash
# 1. Build Docker images
docker-compose build

# 2. Test with built images
docker-compose -f docker-compose.yml up -d

# 3. Run integration tests
# Open http://localhost:3000
# Run through all features

# 4. Check logs for errors
docker-compose logs

# 5. Clean up
docker-compose down
```

### Production Deployment

```bash
# 1. Code review and merge to main
# 2. Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 3. Build production images
docker build -t pubsub-backend:1.0.0 server/
docker build -t pubsub-frontend:1.0.0 client/

# 4. Push to registry
docker push registry/pubsub-backend:1.0.0
docker push registry/pubsub-frontend:1.0.0

# 5. Deploy to production
# Update docker-compose.yml with new tags
# Run on production server: docker-compose up -d
```

## 📚 Architecture Deep Dive

### Request Flow: Publishing a Message

```
1. Frontend sends HTTP POST to /api/messages/publish
2. Backend receives request in api.js route
3. Controller validates input
4. Simulator/Broker processes message
5. Message stored in MongoDB
6. Message published to Redis topic
7. All Redis subscribers receive message
8. WebSocket event sent to all connected clients
9. Frontend receives message:new event
10. React state updated, visualization re-renders
```

### Real-time Communication: WebSocket Events

```
1. Frontend connects with socket.io
2. Server generates unique socketId
3. Frontend subscribes to topic via emit
4. Server adds to subscribers list
5. Publisher publishes message
6. Broker broadcasts to all subscribers
7. Each subscriber receives message:new event
8. Components display message in real-time
```

## 🎯 Future Improvements

Potential features to implement:
- [ ] Message filtering and routing
- [ ] User authentication & authorization
- [ ] Message queue persistence
- [ ] Automatic scaling with load
- [ ] Advanced analytics dashboard
- [ ] Message retry logic
- [ ] End-to-end encryption
- [ ] Distributed tracing

## 📖 Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/docs/)
- [React Documentation](https://react.dev/)
- [Socket.io Documentation](https://socket.io/docs/)

## ✅ Contributor Checklist

Before submitting a PR:

- [ ] Code follows project style guide
- [ ] Comments added for complex logic
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Commit messages follow conventions
- [ ] Changes are focused on single feature
- [ ] No unrelated code changes
- [ ] Tested locally
- [ ] Ready for production

---

Thanks for contributing! Questions? Check the code, read comments, or ask in issues.

**Last Updated:** March 5, 2026
