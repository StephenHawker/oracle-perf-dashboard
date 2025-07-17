import { DatabaseConfig, AshData, AwrSnapshot, OrdsApiCall, OrdsMetrics, WaitEvent, TopSqlAnalysis, SystemMetric, PerformanceSummary, DashboardFilters } from '../types/oracleTypes';

export interface DatabaseService {
  connect(config: DatabaseConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // ASH Data
  getAshData(filters: DashboardFilters): Promise<AshData[]>;
  getTopWaitEvents(filters: DashboardFilters): Promise<WaitEvent[]>;
  
  // AWR Data
  getAwrSnapshots(filters: DashboardFilters): Promise<AwrSnapshot[]>;
  getTopSqlStatements(filters: DashboardFilters): Promise<TopSqlAnalysis[]>;
  
  // ORDS Data
  getOrdsApiCalls(filters: DashboardFilters): Promise<OrdsApiCall[]>;
  getOrdsMetrics(filters: DashboardFilters): Promise<OrdsMetrics[]>;
  
  // System Metrics
  getSystemMetrics(filters: DashboardFilters): Promise<SystemMetric[]>;
  
  // Performance Summary
  getPerformanceSummary(filters: DashboardFilters): Promise<PerformanceSummary>;
  
  // Utility methods
  getAvailableModules(): Promise<string[]>;
  getAvailableUsers(): Promise<string[]>;
  getAvailableWaitClasses(): Promise<string[]>;
}

export class DatabaseServiceFactory {
  static create(config: DatabaseConfig): DatabaseService {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteService();
      case 'oracle':
        return new OracleService();
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}

// SQLite implementation for development/testing
class SQLiteService implements DatabaseService {
  private readonly db: any;
  private connected = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      // For now, we'll use static data since better-sqlite3 might have node compatibility issues in React
      // In a real implementation, you'd use better-sqlite3 here
      this.connected = true;
      console.log('Connected to SQLite database');
    } catch (error) {
      console.error('Failed to connect to SQLite:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('Disconnected from SQLite database');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getAshData(filters: DashboardFilters): Promise<AshData[]> {
    // Return mock data - in real implementation, query SQLite
    return this.getMockAshData();
  }

  async getTopWaitEvents(filters: DashboardFilters): Promise<WaitEvent[]> {
    return this.getMockWaitEvents();
  }

  async getAwrSnapshots(filters: DashboardFilters): Promise<AwrSnapshot[]> {
    return this.getMockAwrSnapshots();
  }

  async getTopSqlStatements(filters: DashboardFilters): Promise<TopSqlAnalysis[]> {
    return this.getMockTopSqlStatements();
  }

  async getOrdsApiCalls(filters: DashboardFilters): Promise<OrdsApiCall[]> {
    return this.getMockOrdsApiCalls();
  }

  async getOrdsMetrics(filters: DashboardFilters): Promise<OrdsMetrics[]> {
    try {
      const res = await fetch('http://localhost:4000/api/ords-metrics');
      if (!res.ok) throw new Error('Failed to fetch ORDS metrics');
      return await res.json();
    } catch (err) {
      throw new Error('SQLiteService: ' + (err as Error).message);
    }
  }

  async getSystemMetrics(filters: DashboardFilters): Promise<SystemMetric[]> {
    try {
      const res = await fetch('http://localhost:4000/api/system-metrics');
      if (!res.ok) throw new Error('Failed to fetch system metrics');
      return await res.json();
    } catch (err) {
      throw new Error('SQLiteService: ' + (err as Error).message);
    }
  }

  async getPerformanceSummary(filters: DashboardFilters): Promise<PerformanceSummary> {
    try {
      const res = await fetch('http://localhost:4000/api/performance-summary');
      if (!res.ok) throw new Error('Failed to fetch performance summary');
      return await res.json();
    } catch (err) {
      throw new Error('SQLiteService: ' + (err as Error).message);
    }
  }

  async getAvailableModules(): Promise<string[]> {
    return ['ORDS', 'SQL*Plus', 'TOAD', 'SQL Developer', 'Application Express', 'OEM'];
  }

  async getAvailableUsers(): Promise<string[]> {
    return ['HR', 'SCOTT', 'APEX_PUBLIC_USER', 'ORDS_PUBLIC_USER', 'APP_USER', 'REPORT_USER'];
  }

  async getAvailableWaitClasses(): Promise<string[]> {
    return ['User I/O', 'System I/O', 'Concurrency', 'Application', 'Configuration', 'Administrative', 'Network', 'Commit', 'Idle'];
  }

  // Mock data methods
  private getMockAshData(): AshData[] {
    const mockData: AshData[] = [];
    const currentTime = new Date();
    
    for (let i = 0; i < 100; i++) {
      const sampleTime = new Date(currentTime.getTime() - (i * 60000)); // Every minute
      mockData.push({
        sessionId: 100 + (i % 20),
        sessionSerial: 1000 + i,
        userId: 10 + (i % 5),
        username: ['HR', 'SCOTT', 'APEX_PUBLIC_USER', 'ORDS_PUBLIC_USER', 'APP_USER'][i % 5],
        sqlId: `sql_${(i % 10).toString().padStart(3, '0')}`,
        sqlPlanHashValue: 123456789 + (i % 100),
        waitClass: ['User I/O', 'System I/O', 'Concurrency', 'Application', 'Network'][i % 5],
        waitEvent: ['db file sequential read', 'log file sync', 'enq: TX - row lock contention', 'CPU + Wait for CPU', 'SQL*Net message from client'][i % 5],
        currentObj: 1000 + (i % 50),
        currentFile: 1 + (i % 10),
        currentBlock: 1000 + (i * 10),
        program: 'oracle@server (TNS V1-V3)',
        module: ['ORDS', 'SQL*Plus', 'TOAD', 'SQL Developer'][i % 4],
        action: '',
        clientId: '',
        sessionType: 'USER',
        sessionState: ['WAITING', 'ON CPU'][i % 2],
        qcSessionId: 0,
        blockingSession: i % 10 === 0 ? 100 + ((i + 1) % 20) : 0,
        timeWaited: Math.random() * 1000,
        sampleTime: sampleTime,
        machine: `client-${(i % 5) + 1}`,
        port: 1521,
        isUserIo: i % 3 === 0,
        pga_allocated: 1024 * 1024 * (1 + Math.random() * 10),
        temp_space_allocated: 1024 * 1024 * Math.random() * 5
      });
    }
    
    return mockData;
  }

  private getMockWaitEvents(): WaitEvent[] {
    return [
      {
        eventName: 'db file sequential read',
        waitClass: 'User I/O',
        totalWaits: 15432,
        totalTimeouts: 0,
        timeWaited: 125430,
        averageWait: 8.13,
        waitsPerSecond: 25.72,
        timeWaitedPerSecond: 209.05
      },
      {
        eventName: 'log file sync',
        waitClass: 'Commit',
        totalWaits: 8765,
        totalTimeouts: 0,
        timeWaited: 45123,
        averageWait: 5.15,
        waitsPerSecond: 14.61,
        timeWaitedPerSecond: 75.21
      },
      {
        eventName: 'enq: TX - row lock contention',
        waitClass: 'Concurrency',
        totalWaits: 234,
        totalTimeouts: 12,
        timeWaited: 12340,
        averageWait: 52.74,
        waitsPerSecond: 0.39,
        timeWaitedPerSecond: 20.57
      },
      {
        eventName: 'SQL*Net message from client',
        waitClass: 'Idle',
        totalWaits: 98765,
        totalTimeouts: 0,
        timeWaited: 2345670,
        averageWait: 23.75,
        waitsPerSecond: 164.61,
        timeWaitedPerSecond: 3909.45
      }
    ];
  }

  private getMockAwrSnapshots(): AwrSnapshot[] {
    const snapshots: AwrSnapshot[] = [];
    const currentTime = new Date();
    
    for (let i = 0; i < 24; i++) {
      const snapTime = new Date(currentTime.getTime() - (i * 3600000)); // Every hour
      snapshots.push({
        snapId: 1000 + i,
        instanceNumber: 1,
        snapTime: snapTime,
        startupTime: new Date(currentTime.getTime() - (30 * 24 * 3600000)), // 30 days ago
        dbTime: 2500000 + Math.random() * 500000,
        elapsedTime: 3600000, // 1 hour
        dbCpuTime: 1200000 + Math.random() * 300000,
        backgroundCpuTime: 200000 + Math.random() * 50000,
        redo_size: 50000000 + Math.random() * 20000000,
        logical_reads: 1000000 + Math.random() * 500000,
        block_changes: 25000 + Math.random() * 10000,
        physical_reads: 50000 + Math.random() * 25000,
        physical_writes: 15000 + Math.random() * 5000,
        user_calls: 150000 + Math.random() * 50000,
        parses: 10000 + Math.random() * 5000,
        hard_parses: 100 + Math.random() * 50,
        sorts: 5000 + Math.random() * 2000,
        logons: 50 + Math.random() * 20,
        executes: 200000 + Math.random() * 100000,
        transactions: 8000 + Math.random() * 3000
      });
    }
    
    return snapshots;
  }

  private getMockTopSqlStatements(): TopSqlAnalysis[] {
    return [
      {
        sqlId: 'sql_001',
        sqlText: 'SELECT * FROM employees e JOIN departments d ON e.department_id = d.department_id WHERE e.salary > :1',
        planHashValue: 123456789,
        executions: 15430,
        elapsedTime: 450000000,
        cpuTime: 280000000,
        ioTime: 120000000,
        avgElapsedTime: 29.16,
        avgCpuTime: 18.14,
        avgIoTime: 7.78,
        bufferGets: 2500000,
        diskReads: 45000,
        rowsProcessed: 890000,
        module: 'ORDS',
        parsingSchema: 'HR',
        firstLoadTime: new Date('2024-01-15T10:30:00'),
        lastActiveTime: new Date()
      },
      {
        sqlId: 'sql_002',
        sqlText: 'INSERT INTO audit_log (user_id, action, timestamp, details) VALUES (:1, :2, :3, :4)',
        planHashValue: 987654321,
        executions: 45670,
        elapsedTime: 320000000,
        cpuTime: 290000000,
        ioTime: 25000000,
        avgElapsedTime: 7.01,
        avgCpuTime: 6.35,
        avgIoTime: 0.55,
        bufferGets: 1200000,
        diskReads: 8500,
        rowsProcessed: 45670,
        module: 'Application Express',
        parsingSchema: 'APP_USER',
        firstLoadTime: new Date('2024-01-10T14:20:00'),
        lastActiveTime: new Date()
      }
    ];
  }

  private getMockOrdsApiCalls(): OrdsApiCall[] {
    const calls: OrdsApiCall[] = [];
    const currentTime = new Date();
    
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(currentTime.getTime() - (i * 30000)); // Every 30 seconds
      let statusCode = 200;
      if (i % 10 === 0) {
        statusCode = 500;
      } else if (i % 20 === 0) {
        statusCode = 404;
      }
      calls.push({
        id: i + 1,
        requestId: `req_${i.toString().padStart(6, '0')}`,
        timestamp: timestamp,
        method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
        uri: ['/ords/hr/employees/', '/ords/hr/departments/', '/ords/sales/orders/', '/ords/inventory/products/'][i % 4],
        remoteUser: ['user1', 'user2', 'user3', 'api_client'][i % 4],
        statusCode: statusCode,
        responseTime: 50 + Math.random() * 200,
        requestSize: 1024 + Math.random() * 5120,
        responseSize: 2048 + Math.random() * 10240,
        sqlId: i % 3 === 0 ? `sql_${(i % 10).toString().padStart(3, '0')}` : undefined,
        sessionId: 100 + (i % 20),
        errorMessage: i % 10 === 0 ? 'Internal Server Error' : undefined,
        clientInfo: 'ORDS REST API',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referrer: i % 5 === 0 ? 'https://example.com/app' : undefined
      });
    }
    
    return calls;
  }

  private getMockOrdsMetrics(): OrdsMetrics[] {
    const metrics: OrdsMetrics[] = [];
    const currentTime = new Date();
    
    for (let i = 0; i < 60; i++) {
      const timestamp = new Date(currentTime.getTime() - (i * 60000)); // Every minute
      metrics.push({
        timestamp: timestamp,
        activeConnections: 10 + Math.floor(Math.random() * 20),
        queuedRequests: Math.floor(Math.random() * 5),
        averageResponseTime: 80 + Math.random() * 40,
        requestsPerSecond: 5 + Math.random() * 15,
        errorsPerSecond: Math.random() * 0.5,
        memoryUsage: 512 + Math.random() * 256,
        cpuUsage: 20 + Math.random() * 60
      });
    }
    
    return metrics;
  }

  private getMockSystemMetrics(): SystemMetric[] {
    const metrics: SystemMetric[] = [];
    const currentTime = new Date();
    const metricNames = ['CPU Usage', 'Memory Usage', 'Disk I/O', 'Network I/O', 'Active Sessions'];
    
    for (let i = 0; i < 60; i++) {
      const timestamp = new Date(currentTime.getTime() - (i * 60000));
      for (const metricName of metricNames) {
        let unit = 'MB/s';
        if (metricName.includes('Usage')) {
          unit = '%';
        } else if (metricName.includes('Sessions')) {
          unit = 'count';
        }
        metrics.push({
          timestamp: timestamp,
          metricName: metricName,
          value: Math.random() * 100,
          unit: unit,
          instanceNumber: 1
        });
      }
    }
    
    return metrics;
  }

  private getMockPerformanceSummary(): PerformanceSummary {
    return {
      totalDbTime: 2500000,
      totalCpuTime: 1200000,
      totalIoTime: 450000,
      totalWaitTime: 850000,
      averageActiveSessions: 15.5,
      topWaitEvents: this.getMockWaitEvents(),
      topSqlStatements: this.getMockTopSqlStatements(),
      ordsMetrics: {
        timestamp: new Date(),
        activeConnections: 25,
        queuedRequests: 2,
        averageResponseTime: 95.5,
        requestsPerSecond: 12.3,
        errorsPerSecond: 0.2,
        memoryUsage: 768,
        cpuUsage: 45.2
      },
      recommendations: [
        'Consider adding an index on employees.salary for better performance',
        'Review ORDS connection pool settings - high queue detected',
        'Monitor row lock contention in peak hours',
        'Optimize frequent INSERT operations in audit_log table'
      ]
    };
  }
}

// Oracle implementation (placeholder for future development)
class OracleService implements DatabaseService {
  private connected = false;

  async connect(config: DatabaseConfig): Promise<void> {
    // Oracle connection will be implemented when node-oracledb is integrated
    throw new Error('Oracle connection not yet implemented');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getAshData(filters: DashboardFilters): Promise<AshData[]> {
    throw new Error('Oracle implementation not yet available');
  }

  async getTopWaitEvents(filters: DashboardFilters): Promise<WaitEvent[]> {
    throw new Error('Oracle implementation not yet available');
  }

  async getAwrSnapshots(filters: DashboardFilters): Promise<AwrSnapshot[]> {
    throw new Error('Oracle implementation not yet available');
  }

  async getTopSqlStatements(filters: DashboardFilters): Promise<TopSqlAnalysis[]> {
    throw new Error('Oracle implementation not yet available');
  }

  async getOrdsApiCalls(filters: DashboardFilters): Promise<OrdsApiCall[]> {
    throw new Error('Oracle implementation not yet available');
  }

  async getOrdsMetrics(filters: DashboardFilters): Promise<OrdsMetrics[]> {
    throw new Error('Oracle implementation not yet available');
  }

  async getSystemMetrics(filters: DashboardFilters): Promise<SystemMetric[]> {
    throw new Error('Oracle implementation not yet available');
  }

  async getPerformanceSummary(filters: DashboardFilters): Promise<PerformanceSummary> {
    throw new Error('Oracle implementation not yet available');
  }

  async getAvailableModules(): Promise<string[]> {
    throw new Error('Oracle implementation not yet available');
  }

  async getAvailableUsers(): Promise<string[]> {
    throw new Error('Oracle implementation not yet available');
  }

  async getAvailableWaitClasses(): Promise<string[]> {
    throw new Error('Oracle implementation not yet available');
  }
}
