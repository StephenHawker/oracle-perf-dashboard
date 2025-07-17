// Oracle ASH (Active Session History) data types
export interface AshData {
  sessionId: number;
  sessionSerial: number;
  userId: number;
  username: string;
  sqlId: string;
  sqlPlanHashValue: number;
  waitClass: string;
  waitEvent: string;
  currentObj: number;
  currentFile: number;
  currentBlock: number;
  program: string;
  module: string;
  action: string;
  clientId: string;
  sessionType: string;
  sessionState: string;
  qcSessionId: number;
  blockingSession: number;
  timeWaited: number;
  sampleTime: Date;
  machine: string;
  port: number;
  isUserIo: boolean;
  pga_allocated: number;
  temp_space_allocated: number;
}

// Oracle AWR (Automatic Workload Repository) data types
export interface AwrSnapshot {
  snapId: number;
  instanceNumber: number;
  snapTime: Date;
  startupTime: Date;
  dbTime: number;
  elapsedTime: number;
  dbCpuTime: number;
  backgroundCpuTime: number;
  redo_size: number;
  logical_reads: number;
  block_changes: number;
  physical_reads: number;
  physical_writes: number;
  user_calls: number;
  parses: number;
  hard_parses: number;
  sorts: number;
  logons: number;
  executes: number;
  transactions: number;
}

export interface SqlStat {
  sqlId: string;
  sqlText: string;
  planHashValue: number;
  module: string;
  action: string;
  parsing_schema_name: string;
  executions: number;
  elapsed_time: number;
  cpu_time: number;
  iowait: number;
  clwait: number;
  apwait: number;
  ccwait: number;
  disk_reads: number;
  buffer_gets: number;
  direct_writes: number;
  rows_processed: number;
  fetches: number;
  loads: number;
  invalidations: number;
  first_load_time: Date;
  last_load_time: Date;
  last_active_time: Date;
}

// ORDS (Oracle REST Data Services) specific types
export interface OrdsApiCall {
  id: number;
  requestId: string;
  timestamp: Date;
  method: string;
  uri: string;
  remoteUser: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  sqlId?: string;
  sessionId?: number;
  errorMessage?: string;
  clientInfo: string;
  userAgent: string;
  referrer?: string;
}

export interface OrdsMetrics {
  timestamp: Date;
  activeConnections: number;
  queuedRequests: number;
  averageResponseTime: number;
  requestsPerSecond: number;
  errorsPerSecond: number;
  memoryUsage: number;
  cpuUsage: number;
}

// Wait Events
export interface WaitEvent {
  eventName: string;
  waitClass: string;
  totalWaits: number;
  totalTimeouts: number;
  timeWaited: number;
  averageWait: number;
  waitsPerSecond: number;
  timeWaitedPerSecond: number;
}

// Top SQL analysis
export interface TopSqlAnalysis {
  sqlId: string;
  sqlText: string;
  planHashValue: number;
  executions: number;
  elapsedTime: number;
  cpuTime: number;
  ioTime: number;
  avgElapsedTime: number;
  avgCpuTime: number;
  avgIoTime: number;
  bufferGets: number;
  diskReads: number;
  rowsProcessed: number;
  module: string;
  parsingSchema: string;
  firstLoadTime: Date;
  lastActiveTime: Date;
}

// System metrics
export interface SystemMetric {
  timestamp: Date;
  metricName: string;
  value: number;
  unit: string;
  instanceNumber: number;
}

// Database configuration
export interface DatabaseConfig {
  type: 'oracle' | 'sqlite';
  host?: string;
  port?: number;
  serviceName?: string;
  username?: string;
  password?: string;
  connectionString?: string;
  filePath?: string; // For SQLite
}

// Chart data interfaces
export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
  category?: string;
}

export interface TimeSeriesData {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

// Dashboard filters
export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  instanceId?: number;
  module?: string;
  username?: string;
  waitClass?: string;
  sqlId?: string;
}

// Performance summary
export interface PerformanceSummary {
  totalDbTime: number;
  totalCpuTime: number;
  totalIoTime: number;
  totalWaitTime: number;
  averageActiveSessions: number;
  topWaitEvents: WaitEvent[];
  topSqlStatements: TopSqlAnalysis[];
  ordsMetrics?: OrdsMetrics;
  recommendations: string[];
}
