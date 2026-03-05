# PubSub Fanout - Architecture Document

## System Overview

PubSub Fanout is a distributed message publishing and subscription system designed to demonstrate real-time message distribution with performance monitoring.

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (React)                    │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Controls │ Analytics │ PublisherPanel │ Logs   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP + WebSocket (Socket.io)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Express.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Routes │ Controllers │ Middleware │ Error Handler          │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │ Redis  │  │MongoDB │  │ File     │
    │ PubSub │  │Store   │  │ System   │
    └────────┘  └────────┘  └──────────┘
         │             │
         └─────────────┴─────────────┬─────────────────────────┐
                                     ▼                         ▼
                              ┌─────────────┐       ┌─────────────┐
                              │  Broker     │       │ Simulator   │
                              │  Logic      │       │  Engine     │
                              └─────────────┘       └─────────────┘
```

## Component Details

### Frontend Components

#### Dashboard
- Main layout orchestrator
- Manages overall UI structure
- Coordinates between sub-components

#### Controls Panel
```
Purpose: Start/stop simulations with configuration
Features:
  - Configurable publishers/subscribers
  - Adjustable duration and message rate
  - Real-time status indicator
```

#### Statistics Display
```
Purpose: Show key metrics
Displays:
  - Topic count
  - Subscriber count
  - Average latency
  - Message throughput
```

#### Message Fanout Canvas
```
Purpose: Visualize message distribution
Method: Canvas 2D animation
Shows:
  - Message particles emanating from center
  - Real-time flow representation
  - Particle decay indicating delivery
```

#### Latency Chart
```
Purpose: Performance monitoring
Shows:
  - Min/Max/Average latency
  - Latency over time (bar chart)
  - Trend analysis
```

#### Event Log
```
Purpose: Real-time event tracking
Displays:
  - Incoming messages
  - Topic subscriptions
  - Timestamps
  - Auto-scrolling to latest
```

#### Publisher Panel
```
Purpose: Manual message publishing
Features:
  - Topic selection
  - JSON message editor
  - Partition key input
  - Publish confirmation
```

### Backend Components

#### Express Server (src/index.js)
```
Responsibilities:
  ✓ HTTP server initialization
  ✓ WebSocket (Socket.io) setup
  ✓ Route mounting
  ✓ Middleware configuration
  ✓ Graceful shutdown handling
```

#### Router (routes/api.js)
```
Endpoints:
  POST   /api/messages/publish          - Publish message
  GET    /api/messages/history          - Get message history
  GET    /api/sessions/:sessionId       - Session stats
  GET    /api/sessions                  - All active sessions
  POST   /api/simulation/start          - Start simulation
  POST   /api/simulation/stop/:id       - Stop simulation
  GET    /api/simulation/stats/:id      - Simulation metrics
  GET    /api/stats/topics              - Topic statistics
```

#### Controller (controllers/simController.js)
```
Functions:
  - publishMessage()       - Handle message publishing
  - getMessageHistory()    - Retrieve past messages
  - getSessionStats()      - Get single session metrics
  - getAllSessions()       - List active sessions
  - startSimulation()      - Initialize simulation
  - stopSimulation()       - Halt simulation
  - getSimulationStats()   - Fetch metrics
  - getTopicsStats()       - Aggregate topic data
```

#### Message Broker (pubsub/broker.js)
```
Responsibilities:
  ✓ Redis pub/sub wrapper
  ✓ Topic subscription management
  ✓ Message fanout to subscribers
  ✓ Subscriber tracking
  ✓ Handler registration/deregistration

Key Methods:
  - publishMessage(topic, message)
  - subscribeTopic(topic, handler)
  - unsubscribeTopic(topic, handler)
  - getSubscriberCount(topic)
  - getAllTopics()
  - getTopicsStats()
```

#### Message Simulator (pubsub/simulator.js)
```
Responsibilities:
  ✓ Generate test messages
  ✓ Simulate publishers/subscribers
  ✓ Measure performance metrics
  ✓ Track latency
  ✓ Manage active simulations

Simulation Flow:
  1. Create publisher sessions
  2. Create subscriber sessions
  3. Register message handlers
  4. Publish messages at configured rate
  5. Record latency and delivery stats
  6. Auto-stop after duration
```

#### Models

**Message Schema**
```javascript
{
  messageId: string,           // Unique identifier
  topic: string,              // Topic name (indexed)
  partition: number,          // Partition assignment
  partitionKey: string,       // Routing key
  message: object,            // Payload
  publisher: string,          // Publisher ID
  fanoutCount: number,        // Delivery count
  latency: number,            // Processing time (ms)
  subscriberIds: array,       // Recipients
  size: number,               // Message size (bytes)
  processed: boolean,         // Delivery status
  createdAt: timestamp,       // Created time (indexed)
  updatedAt: timestamp        // Last update
}
```

**Session Schema**
```javascript
{
  sessionId: string,          // Unique session ID
  type: enum,                 // 'publisher' or 'subscriber'
  ipAddress: string,          // Client IP
  topics: array,              // Subscribed topics (indexed)
  messageCount: number,       // Messages sent
  receivedCount: number,      // Messages received
  avgLatency: number,         // Average latency (ms)
  maxLatency: number,         // Peak latency
  minLatency: number,         // Minimum latency
  totalBytes: number,         // Data transferred
  isActive: boolean,          // Status (indexed)
  metadata: object,           // Custom data
  createdAt: timestamp,       // Created time
  updatedAt: timestamp        // Last update
}
```

## Data Flow

### Publishing a Message

```
1. Client sends HTTP POST /api/messages/publish
   └─> { topic, message, partitionKey }

2. Controller validates input
   └─> Generate messageId and determine partition

3. Broker publishes to Redis channel
   └─> Redis distributes to all subscribers

4. Message stored in MongoDB
   └─> { messageId, topic, partition, ... }

5. Publisher session updated with stats
   └─> Increment messageCount, update latency

6. Response sent to client with delivery info
   └─> { messageId, fanoutCount, latency }
```

### Receiving a Message

```
1. Subscriber has Socket.io connection open

2. Broker calls registered handler for topic
   └─> Handler receives message from Redis

3. Message emitted via Socket.io
   └─> socket.emit('message:new', message)

4. Subscriber session updated
   └─> Increment receivedCount, track latency

5. Frontend receives message via WebSocket
   └─> React component updates state

6. UI updates with new data
   └─> Charts, logs, visualizations refresh
```

### Simulation Flow

```
1. Client sends POST /api/simulation/start
   └─> { publishers, subscribers, duration, messageRate }

2. Simulator creates publisher sessions
   └─> Creates n publisher records in MongoDB

3. Simulator creates subscriber sessions
   └─> Creates m subscriber records in MongoDB

4. Subscribe all subscribers to topics
   └─> Register handlers via broker.subscribeTopic()

5. Message publishing loop starts
   └─> Publishes messages at specified rate/interval

6. Performance metrics collected
   └─> latency, fanoutCount, topicLoad tracked

7. Simulation runs until duration expires
   └─> Auto-stop via setTimeout

8. Final stats compiled and returned
   └─> { messagesSent, avgLatency, maxLatency, ... }
```

## Performance Optimizations

### Connection Pooling
"""
MongoDB: 5-20 concurrent connections (configurable)
Redis: Single connection pair (pub + sub)
HTTP: Keep-alive enabled by default
"""

### Message Batching
"""
Support for batch publishing reduces rounds-trips
Configurable batch size (default: 10 messages)
"""

### Indexing Strategy
"""
MongoDB Indexes:
  - { topic: 1, createdAt: -1 }    // Faster topic queries
  - { messageId: 1 }                // Primary key lookup
  - { isActive: 1, type: 1 }        // Session queries
"""

### Caching
"""
Redis cache for:
  - Session statistics
  - Topic subscriber counts
  - Recent messages (configurable TTL)
"""

## Scalability Considerations

### Horizontal Scaling

**Multiple Backend Instances**
```
├─ Server Instance 1
├─ Server Instance 2
├─ Server Instance 3
└─ Load Balancer (sticky sessions for Socket.io)
     ├─ Shared MongoDB
     ├─ Shared Redis
     └─ WebSocket Adapter (Redis-backed)
```

**Requirements**
- Load balancer with sticky sessions
- Shared database instances
- Redis adapter for Socket.io
- Session sharing mechanism

### Vertical Scaling
- Increase CPU cores
- Increase RAM (for caching)
- Increase network bandwidth
- Use SSD for storage

## Security Architecture

### Authentication (Future)
```
JWT tokens for API endpoints
WebSocket authentication on connection
Session validation on requests
```

### Authorization (Future)
```
Topic-level access control
Publisher/Subscriber role separation
Admin operations protection
```

### Data Protection
```
HTTPS in production
Secure WebSocket (WSS)
Password-protected Redis
MongoDB authentication
```

## Monitoring & Observability

### Metrics Collected
```
- Message count per second
- Average latency
- Max/Min latency
- Fanout distribution
- Subscriber activity
- Topic popularity
```

### Logging
```
- Request/Response logs
- Error logs with stacks
- Performance metrics
- Connection events
- Database queries
```

### Health Checks
```
GET /api/health - Returns status
- Database connectivity
- Redis connectivity
- Server uptime
```

## Error Handling

### Client Errors (4xx)
- 400: Invalid input validation
- 404: Resource not found
- 422: Unprocessable entity

### Server Errors (5xx)
- 500: Internal server error
- 503: Service unavailable
- Connection timeouts

### Recovery Strategies
- Automatic reconnection with exponential backoff
- Message queueing during outages
- Graceful degradation
- Error logging for analysis

---

**Document Version**: 1.0  
**Last Updated**: March 5, 2024
