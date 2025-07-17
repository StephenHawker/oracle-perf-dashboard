-- SQL seed for oracle_perf.db with real-looking Oracle/ORDS dashboard data
-- Run with: sqlite3 oracle_perf.db < seed_oracle_perf.sql

-- Drop tables if they exist
DROP TABLE IF EXISTS performance_summary;
DROP TABLE IF EXISTS wait_events;
DROP TABLE IF EXISTS sql_statements;
DROP TABLE IF EXISTS ords_metrics;
DROP TABLE IF EXISTS system_metrics;
DROP TABLE IF EXISTS recommendations;

-- Create tables
CREATE TABLE performance_summary (
  id INTEGER PRIMARY KEY,
  timestamp INTEGER,
  totalDbTime INTEGER,
  totalCpuTime INTEGER,
  averageActiveSessions REAL
);

CREATE TABLE wait_events (
  id INTEGER PRIMARY KEY,
  timestamp INTEGER,
  eventName TEXT,
  timeWaited INTEGER,
  totalWaits INTEGER
);

CREATE TABLE sql_statements (
  id INTEGER PRIMARY KEY,
  timestamp INTEGER,
  sqlId TEXT,
  elapsedTime INTEGER,
  executions INTEGER
);

CREATE TABLE ords_metrics (
  id INTEGER PRIMARY KEY,
  timestamp INTEGER,
  activeConnections INTEGER,
  queuedRequests INTEGER,
  averageResponseTime REAL,
  requestsPerSecond REAL,
  errorsPerSecond REAL,
  memoryUsage REAL,
  cpuUsage REAL
);

CREATE TABLE system_metrics (
  id INTEGER PRIMARY KEY,
  timestamp INTEGER,
  metricName TEXT,
  value REAL
);

CREATE TABLE recommendations (
  id INTEGER PRIMARY KEY,
  timestamp INTEGER,
  recommendation TEXT
);

-- Insert fresh data for the last 24 hours (every 2 hours, plus now)
INSERT INTO performance_summary (timestamp, totalDbTime, totalCpuTime, averageActiveSessions) VALUES
  (strftime('%s','now')*1000, 4200000, 2100000, 8.2),
  (strftime('%s','now','-2 hours')*1000, 3900000, 1800000, 7.5),
  (strftime('%s','now','-4 hours')*1000, 4100000, 2000000, 8.0),
  (strftime('%s','now','-6 hours')*1000, 4000000, 1900000, 7.8),
  (strftime('%s','now','-8 hours')*1000, 3950000, 1850000, 7.6),
  (strftime('%s','now','-10 hours')*1000, 4050000, 1950000, 7.9),
  (strftime('%s','now','-12 hours')*1000, 4150000, 2050000, 8.1);

INSERT INTO wait_events (timestamp, eventName, timeWaited, totalWaits) VALUES
  (strftime('%s','now')*1000, 'db file sequential read', 800000, 40),
  (strftime('%s','now')*1000, 'log file sync', 600000, 25),
  (strftime('%s','now')*1000, 'CPU', 1200000, 60),
  (strftime('%s','now','-2 hours')*1000, 'db file scattered read', 700000, 35),
  (strftime('%s','now','-2 hours')*1000, 'SQL*Net message from client', 500000, 20);

INSERT INTO sql_statements (timestamp, sqlId, elapsedTime, executions) VALUES
  (strftime('%s','now')*1000, 'a1b2c3d4', 900000, 12),
  (strftime('%s','now')*1000, 'e5f6g7h8', 700000, 8),
  (strftime('%s','now')*1000, 'i9j0k1l2', 600000, 6),
  (strftime('%s','now','-2 hours')*1000, 'm3n4o5p6', 800000, 10);

INSERT INTO ords_metrics (timestamp, activeConnections, queuedRequests, averageResponseTime, requestsPerSecond, errorsPerSecond, memoryUsage, cpuUsage) VALUES
  (strftime('%s','now')*1000, 55, 2, 120.5, 45.2, 0.5, 1500, 35.2),
  (strftime('%s','now','-2 hours')*1000, 48, 1, 110.2, 40.1, 0.3, 1400, 32.8);

INSERT INTO system_metrics (timestamp, metricName, value) VALUES
  (strftime('%s','now')*1000, 'CPU Usage', 38.5),
  (strftime('%s','now')*1000, 'Memory Usage', 1450),
  (strftime('%s','now','-2 hours')*1000, 'CPU Usage', 32.1),
  (strftime('%s','now','-2 hours')*1000, 'Memory Usage', 1380);

INSERT INTO recommendations (timestamp, recommendation) VALUES
  (strftime('%s','now')*1000, 'Consider adding indexes to frequently accessed tables.'),
  (strftime('%s','now')*1000, 'Investigate high CPU usage queries.'),
  (strftime('%s','now','-2 hours')*1000, 'Tune SQL statements with high elapsed time.');

-- Verify data
SELECT 'performance_summary', * FROM performance_summary;
SELECT 'wait_events', * FROM wait_events;
SELECT 'sql_statements', * FROM sql_statements;
SELECT 'ords_metrics', * FROM ords_metrics;
SELECT 'system_metrics', * FROM system_metrics;
SELECT 'recommendations', * FROM recommendations;
