# API Reference Guide

Complete documentation of all PubSub Fanout API endpoints and WebSocket events.

## Table of Contents
- [REST API](#rest-api)
- [WebSocket Events](#websocket-events)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## REST API

### Base URL
```
http://localhost:5000/api
```

### Authentication
- Currently no authentication required
- Future versions will use JWT tokens
- Pass session ID via `X-Session-ID` header (optional)

---

## Endpoints

### Messages

#### POST /messages/publish
**Publish a new message to a topic**

```http
POST /api/messages/publish
Content-Type: application/json
X-Session-ID: session_xyz (optional)

{
  "topic": "orders",
  "message": {
    "orderId": "order_123",
    "amount": 99.99,
    "status": "pending",
    "customField": "any value"
  },
  "partitionKey": "user_456" (optional)
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "messageId": "msg_1234567890",
  "topic": "orders",
  "fanoutCount": 5,
  "latency": 23,
  "publishedAt": "2024-03-05T10:30:45.123Z"
}
```

**Response (400 Bad Request)**
```json
{
  "success": false,
  "error": "Topic and message are required"
}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| topic | string | Yes | Target topic name |
| message | object | Yes | Message payload (any JSON object) |
| partitionKey | string | No | Key for partition assignment (for load balancing) |

**Returns:**
- `messageId`: Unique message identifier
- `fanoutCount`: Number of subscribers received message
- `latency`: Time taken to publish (milliseconds)

---

#### GET /messages/history
**Retrieve message history for a topic**

```http
GET /api/messages/history?topic=orders&limit=20&skip=0
```

**Response (200 OK)**
```json
{
  "success": true,
  "topic": "orders",
  "messages": [
    {
      "_id": "ObjectId...",
      "messageId": "msg_1234567890",
      "topic": "orders",
      "partition": 2,
      "message": {
        "orderId": "order_123",
        "amount": 99.99
      },
      "publisher": "session_xyz",
      "fanoutCount": 5,
      "latency": 23,
      "processed": true,
      "createdAt": "2024-03-05T10:30:45.123Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "skip": 0,
    "total": 150
  }
}
```

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| topic | string | Required | Topic to query |
| limit | number | 50 | Max results (1-100) |
| skip | number | 0 | Results to skip (pagination) |

**Returns:** Array of message objects with pagination info

---

### Sessions

#### GET /sessions/:sessionId
**Get statistics for a specific session**

```http
GET /api/sessions/session_xyz123
```

**Response (200 OK)**
```json
{
  "success": true,
  "session": {
    "sessionId": "session_xyz123",
    "type": "publisher",
    "messageCount": 150,
    "receivedCount": 0,
    "averageLatency": 45,
    "maxLatency": 234,
    "minLatency": 12,
    "totalBytes": 125600,
    "topics": ["orders", "notifications"],
    "isActive": true,
    "uptime": 3600
  }
}
```

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| sessionId | string | Session identifier |

**Response Fields:**
- `type`: 'publisher' or 'subscriber'
- `messageCount`: Total messages published
- `receivedCount`: Total messages received
- `averageLatency`: Average processing time (ms)
- `uptime`: Session duration in seconds

---

#### GET /sessions
**Get all active sessions**

```http
GET /api/sessions?type=publisher
```

**Response (200 OK)**
```json
{
  "success": true,
  "count": 5,
  "sessions": [
    {
      "sessionId": "session_xyz123",
      "type": "publisher",
      "topics": ["orders"],
      "messageCount": 150,
      "isActive": true
    }
  ]
}
```

**Query Parameters:**
| Name | Type | Default | Options |
|------|------|---------|---------|
| type | string | null | 'publisher', 'subscriber', or null (all) |

**Returns:** Array of session summaries

---

### Simulation

#### POST /simulation/start
**Start a new message simulation**

```http
POST /api/simulation/start
Content-Type: application/json

{
  "publishers": 3,
  "subscribers": 15,
  "duration": 60000,
  "messageRate": 10
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "simulationId": "sim_abc123def456",
  "publisherCount": 3,
  "subscriberCount": 15,
  "duration": 60000
}
```

**Request Body:**
| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| publishers | number | 3 | 1-20 | Simulated publishers |
| subscribers | number | 10 | 1-100 | Simulated subscribers |
| duration | number | 60000 | 5000-600000 | Duration in ms |
| messageRate | number | 5 | 1-100 | Messages per second |

---

#### POST /simulation/stop/:simulationId
**Stop a running simulation**

```http
POST /api/simulation/stop/sim_abc123def456
```

**Response (200 OK)**
```json
{
  "success": true,
  "simulationId": "sim_abc123def456",
  "messagesSent": 543
}
```

---

#### GET /simulation/stats/:simulationId
**Get statistics for a simulation**

```http
GET /api/simulation/stats/sim_abc123def456
```

**Response (200 OK)**
```json
{
  "success": true,
  "stats": {
    "simulationId": "sim_abc123def456",
    "isRunning": true,
    "messagesSent": 543,
    "averageLatency": 42,
    "maxLatency": 234,
    "duration": 45000,
    "publisherCount": 3,
    "subscriberCount": 15
  }
}
```

---

### Statistics

#### GET /stats/topics
**Get statistics for all active topics**

```http
GET /api/stats/topics
```

**Response (200 OK)**
```json
{
  "success": true,
  "topics": {
    "orders": {
      "topic": "orders",
      "subscriberCount": 8,
      "handlerCount": 8
    },
    "notifications": {
      "topic": "notifications",
      "subscriberCount": 5,
      "handlerCount": 5
    }
  },
  "totalTopics": 2
}
```

---

### Health

#### GET /health
**Check server health status**

```http
GET /api/health
```

**Response (200 OK)**
```json
{
  "success": true,
  "status": "Server is running",
  "timestamp": "2024-03-05T10:30:45.123Z"
}
```

---

## WebSocket Events

### Connection Events

#### connect
**Established connection to server**

```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

#### connect:success
**Confirmation of successful connection**

```javascript
socket.on('connect:success', (data) => {
  console.log(data);
  // {
  //   socketId: "abc123xyz",
  //   message: "Connected to PubSub server",
  //   timestamp: "2024-03-05T10:30:45.123Z"
  // }
});
```

#### disconnect
**Connection closed**

```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

---

### Topic Events

#### topic:subscribe
**Subscribe to a topic**

```javascript
socket.emit('topic:subscribe', { topic: 'orders' });

// Response
socket.on('topic:subscribed', (data) => {
  console.log(data);
  // {
  //   topic: "orders",
  //   message: "Successfully subscribed to orders",
  //   subscriberCount: 15
  // }
});
```

#### topic:unsubscribe
**Unsubscribe from a topic**

```javascript
socket.emit('topic:unsubscribe', { topic: 'orders' });

// Response
socket.on('topic:unsubscribed', (data) => {
  console.log(data);
  // {
  //   topic: "orders",
  //   message: "Successfully unsubscribed from orders"
  // }
});
```

---

### Message Events

#### message:new
**Receive published message**

```javascript
socket.on('message:new', (message) => {
  console.log('Received message:', message);
  // {
  //   messageId: "msg_123",
  //   topic: "orders",
  //   message: { orderId: "order_123", ... },
  //   publisher: "pub_xyz",
  //   fanoutCount: 15,
  //   latency: 23,
  //   receivedAt: "2024-03-05T10:30:45.123Z"
  // }
});
```

#### message:publish
**Publish custom message via WebSocket**

```javascript
socket.emit('message:publish', {
  topic: 'orders',
  payload: { orderId: 'order_123', amount: 99.99 }
});

// Response
socket.on('message:published', (result) => {
  console.log(result);
  // {
  //   success: true,
  //   fanoutCount: 15,
  //   messageId: "msg_123",
  //   topic: "orders"
  // }
});
```

---

### Stats Events

#### stats:update
**Receive periodic statistics update**

```javascript
socket.on('stats:update', (stats) => {
  console.log('Stats updated:', stats);
  // {
  //   topics: {
  //     "orders": {
  //       topic: "orders",
  //       subscriberCount: 8,
  //       handlerCount: 8
  //     },
  //     ...
  //   },
  //   timestamp: 1646416245123
  // }
});
```

**Broadcast Frequency:** Every 5 seconds

---

### Health Check

#### ping / pong
**WebSocket connection health check**

```javascript
socket.emit('ping');

socket.on('pong', (data) => {
  console.log('Latency:', Date.now() - data.timestamp, 'ms');
});
```

---

## Request/Response Examples

### Complete Flow Example

```javascript
// 1. Connect WebSocket
const socket = io('http://localhost:5000');

socket.on('connect:success', (data) => {
  console.log('Connected:', data.socketId);
});

// 2. Subscribe to topic
socket.emit('topic:subscribe', { topic: 'orders' });

socket.on('topic:subscribed', (data) => {
  console.log('Subscribed to', data.topic);
});

// 3. Listen for messages
socket.on('message:new', (message) => {
  console.log('Got message:', message.messageId);
});

// 4. Publish via HTTP
fetch('/api/messages/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'orders',
    message: { orderId: 'order_123', amount: 99.99 }
  })
})
.then(res => res.json())
.then(data => {
  console.log('Published:', data.messageId);
});

// 5. Check history
fetch('/api/messages/history?topic=orders&limit=10')
  .then(res => res.json())
  .then(data => console.log('Messages:', data.messages));

// 6. Get statistics
fetch('/api/stats/topics')
  .then(res => res.json())
  .then(data => console.log('Topics:', data.topics));
```

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": "Topic and message are required",
  "statusCode": 400
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Session not found",
  "statusCode": 404
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal Server Error",
  "statusCode": 500,
  "timestamp": "2024-03-05T10:30:45.123Z"
}
```

### Error Codes

| Status | Meaning | Solution |
|--------|---------|----------|
| 400 | Bad Request | Check request format and parameters |
| 404 | Not Found | Verify resource exists |
| 422 | Unprocessable Entity | Validate data types |
| 500 | Server Error | Check server logs |
| 503 | Service Unavailable | Database/Redis connection issue |

---

## Rate Limiting

Currently **not implemented** but planned for future versions.

**Planned Limits:**
- 100 requests per minute per IP
- 1000 messages per second per topic
- 10,000 WebSocket connections per server

---

## Best Practices

### HTTP Requests

```javascript
// ✅ Good: Include error handling
const publishMessage = async (topic, message) => {
  try {
    const response = await fetch('/api/messages/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Publishing failed:', error);
    // Retry logic, fallback, etc.
  }
};

// ❌ Avoid: No error handling
fetch('/api/messages/publish', {
  method: 'POST',
  body: JSON.stringify({ topic, message })
}).then(res => res.json()).then(console.log);
```

### WebSocket Events

```javascript
// ✅ Good: Handle both success and error
socket.emit('message:publish', payload);
socket.on('message:published', handleSuccess);
socket.on('error:publish', handleError);

// ❌ Avoid: No error handling
socket.emit('message:publish', payload);
```

### Subscription Management

```javascript
// ✅ Good: Clean up subscriptions
const unsubscribe = () => {
  socket.emit('topic:unsubscribe', { topic: 'orders' });
  socket.off('message:new');
};

// ❌ Avoid: Memory leaks from unreleased subscriptions
socket.emit('topic:subscribe', { topic: 'orders' });
socket.on('message:new', handler1);
socket.on('message:new', handler2);
// ... no cleanup
```

---

### Batch Operations

```javascript
// Publishing multiple messages
const messages = [
  { topic: 'orders', message: { orderId: 1 } },
  { topic: 'orders', message: { orderId: 2 } },
  { topic: 'orders', message: { orderId: 3 } }
];

// Option 1: Serial (slower but guaranteed order)
for (const msg of messages) {
  await publishMessage(msg.topic, msg.message);
}

// Option 2: Parallel (faster but unordered)
await Promise.all(
  messages.map(msg => publishMessage(msg.topic, msg.message))
);
```

---

**Last Updated:** March 5, 2024  
**API Version:** 1.0  
**Status:** Stable
