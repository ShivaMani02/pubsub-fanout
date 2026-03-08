// seed.js - Seed initial data for PubSub Fanout system
// Populates MongoDB with sample messages and sessions for a rich initial experience

require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');
const Session = require('./models/Session');
const logger = require('./config/logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pubsub_db';

const seedData = async () => {
    try {
        logger.info('Starting database seeding...');

        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        logger.info('✓ Connected to MongoDB');

        // Clear existing data
        await Message.deleteMany({});
        await Session.deleteMany({});
        logger.info('✓ Cleared existing collections');

        const topics = ['orders', 'shipping', 'payments', 'telemetry', 'inventory'];
        const publishers = ['pub_alpha', 'pub_beta', 'pub_gamma'];
        const subscribers = ['sub_1', 'sub_2', 'sub_3', 'sub_4', 'sub_5'];

        // 1. Create Sample Sessions
        const sessions = [];

        // Create Publisher Sessions
        publishers.forEach(id => {
            sessions.push({
                sessionId: id,
                type: 'publisher',
                isActive: false,
                topics: [topics[Math.floor(Math.random() * topics.length)]],
                messageCount: 50 + Math.floor(Math.random() * 100),
                totalBytes: 5000 + Math.floor(Math.random() * 5000),
                avgLatency: 15 + Math.floor(Math.random() * 20),
                lastActivity: new Date()
            });
        });

        // Create Subscriber Sessions
        subscribers.forEach(id => {
            sessions.push({
                sessionId: id,
                type: 'subscriber',
                isActive: false,
                topics: topics.slice(0, 3), // Subscribe to first 3
                receivedCount: 150 + Math.floor(Math.random() * 200),
                totalBytes: 15000 + Math.floor(Math.random() * 10000),
                avgLatency: 22 + Math.floor(Math.random() * 15),
                lastActivity: new Date()
            });
        });

        await Session.insertMany(sessions);
        logger.info(`✓ Seeded ${sessions.length} sessions`);

        // 2. Create Sample Messages
        const messages = [];
        const now = new Date();

        for (let i = 0; i < 50; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const pub = publishers[Math.floor(Math.random() * publishers.length)];
            const timeOffset = i * 1000 * 60; // 1 minute apart

            messages.push({
                messageId: `msg_${Date.now() - timeOffset}`,
                topic: topic,
                partition: Math.floor(Math.random() * 4),
                partitionKey: `key_${Math.floor(Math.random() * 10)}`,
                message: {
                    id: i + 1,
                    event: 'seeded_event',
                    data: { val: Math.random() * 100 },
                    meta: 'This is seeded sample data'
                },
                publisher: pub,
                fanoutCount: 3 + Math.floor(Math.random() * 5),
                latency: 10 + Math.floor(Math.random() * 50),
                processed: true,
                createdAt: new Date(now - timeOffset)
            });
        }

        await Message.insertMany(messages);
        logger.info(`✓ Seeded ${messages.length} messages`);

        logger.info('🚀 Database seeding complete!');
        process.exit(0);

    } catch (error) {
        logger.error('Failed to seed database:', error.message);
        process.exit(1);
    }
};

seedData();
