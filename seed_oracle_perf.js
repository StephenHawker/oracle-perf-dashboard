// Seed script for oracle_perf.db with realistic Oracle/ORDS test data
// Usage: node seed_oracle_perf.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./oracle_perf.db');

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
    return arr[randomInt(0, arr.length - 1)];
}

const waitEvents = [
    'db file sequential read',
    'db file scattered read',
    'log file sync',
    'SQL*Net message from client',
    'CPU',
    'latch: cache buffers chains',
];

const sqlIds = [
    'a1b2c3d4', 'e5f6g7h8', 'i9j0k1l2', 'm3n4o5p6', 'q7r8s9t0', 'u1v2w3x4', 'y5z6a7b8'
];

const recommendations = [
    'Consider adding indexes to frequently accessed tables.',
    'Investigate high CPU usage queries.',
    'Tune SQL statements with high elapsed time.',
    'Review wait events for possible I/O bottlenecks.',
    'Optimize connection pool settings in ORDS.',
];

function seed() {
    db.serialize(() => {
        // Create tables
        db.run(`CREATE TABLE IF NOT EXISTS performance_summary (
      id INTEGER PRIMARY KEY,
      timestamp DATETIME,
      totalDbTime INTEGER,
      totalCpuTime INTEGER,
      averageActiveSessions REAL
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS wait_events (
      id INTEGER PRIMARY KEY,
      timestamp DATETIME,
      eventName TEXT,
      timeWaited INTEGER,
      totalWaits INTEGER
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS sql_statements (
      id INTEGER PRIMARY KEY,
      timestamp DATETIME,
      sqlId TEXT,
      elapsedTime INTEGER,
      executions INTEGER
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS ords_metrics (
      id INTEGER PRIMARY KEY,
      timestamp DATETIME,
      activeConnections INTEGER,
      queuedRequests INTEGER,
      averageResponseTime REAL,
      requestsPerSecond REAL,
      errorsPerSecond REAL,
      memoryUsage REAL,
      cpuUsage REAL
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS system_metrics (
      id INTEGER PRIMARY KEY,
      timestamp DATETIME,
      metricName TEXT,
      value REAL
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY,
      timestamp DATETIME,
      recommendation TEXT
    )`);

        // Seed 24 hours of data, one record per 10 minutes, using UNIX timestamps
        const now = Date.now();
        for (let i = 0; i < 144; i++) { // 24*6 = 144 (every 10 min)
            const ts = now - (144 - i) * 10 * 60 * 1000; // UNIX timestamp (ms)
            // Performance summary
            db.run(`INSERT INTO performance_summary (timestamp, totalDbTime, totalCpuTime, averageActiveSessions) VALUES (?, ?, ?, ?)`, [ts, randomInt(1000000, 5000000), randomInt(500000, 3000000), randomBetween(1, 10)]);
            // Wait events
            for (let w = 0; w < 3; w++) {
                db.run(`INSERT INTO wait_events (timestamp, eventName, timeWaited, totalWaits) VALUES (?, ?, ?, ?)`, [ts, randomChoice(waitEvents), randomInt(100000, 1000000), randomInt(10, 100)]);
            }
            // SQL statements
            for (let s = 0; s < 3; s++) {
                db.run(`INSERT INTO sql_statements (timestamp, sqlId, elapsedTime, executions) VALUES (?, ?, ?, ?)`, [ts, randomChoice(sqlIds), randomInt(100000, 1000000), randomInt(1, 50)]);
            }
            // ORDS metrics
            db.run(`INSERT INTO ords_metrics (timestamp, activeConnections, queuedRequests, averageResponseTime, requestsPerSecond, errorsPerSecond, memoryUsage, cpuUsage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [ts, randomInt(10, 100), randomInt(0, 10), randomBetween(50, 500), randomBetween(10, 100), randomBetween(0, 5), randomBetween(500, 2000), randomBetween(10, 90)]);
            // System metrics
            db.run(`INSERT INTO system_metrics (timestamp, metricName, value) VALUES (?, ?, ?)`, [ts, 'CPU Usage', randomBetween(10, 90)]);
            db.run(`INSERT INTO system_metrics (timestamp, metricName, value) VALUES (?, ?, ?)`, [ts, 'Memory Usage', randomBetween(500, 2000)]);
            // Recommendations (once per hour)
            if (i % 6 === 0) {
                db.run(`INSERT INTO recommendations (timestamp, recommendation) VALUES (?, ?)`, [ts, randomChoice(recommendations)]);
            }
        }
        // Add a few records for the current time (within dashboard filter)
        for (let j = 0; j < 5; j++) {
            const ts = now - randomInt(0, 10 * 60 * 1000); // within last 10 min
            db.run(`INSERT INTO performance_summary (timestamp, totalDbTime, totalCpuTime, averageActiveSessions) VALUES (?, ?, ?, ?)`, [ts, randomInt(2000000, 6000000), randomInt(1000000, 4000000), randomBetween(5, 15)]);
            db.run(`INSERT INTO wait_events (timestamp, eventName, timeWaited, totalWaits) VALUES (?, ?, ?, ?)`, [ts, randomChoice(waitEvents), randomInt(500000, 2000000), randomInt(50, 200)]);
            db.run(`INSERT INTO sql_statements (timestamp, sqlId, elapsedTime, executions) VALUES (?, ?, ?, ?)`, [ts, randomChoice(sqlIds), randomInt(500000, 2000000), randomInt(10, 100)]);
            db.run(`INSERT INTO ords_metrics (timestamp, activeConnections, queuedRequests, averageResponseTime, requestsPerSecond, errorsPerSecond, memoryUsage, cpuUsage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [ts, randomInt(50, 200), randomInt(0, 20), randomBetween(100, 800), randomBetween(20, 200), randomBetween(0, 10), randomBetween(1000, 4000), randomBetween(20, 99)]);
            db.run(`INSERT INTO system_metrics (timestamp, metricName, value) VALUES (?, ?, ?)`, [ts, 'CPU Usage', randomBetween(20, 99)]);
            db.run(`INSERT INTO system_metrics (timestamp, metricName, value) VALUES (?, ?, ?)`, [ts, 'Memory Usage', randomBetween(1000, 4000)]);
            db.run(`INSERT INTO recommendations (timestamp, recommendation) VALUES (?, ?)`, [ts, randomChoice(recommendations)]);
        }
        console.log('Seed complete: 24h of Oracle/ORDS test data added (UNIX timestamps, fresh records).');
    });
}

seed();