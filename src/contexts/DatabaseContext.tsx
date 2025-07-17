import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { DatabaseService, DatabaseServiceFactory } from '../services/databaseService';
import { DatabaseConfig, DashboardFilters } from '../types/oracleTypes';

interface DatabaseContextType {
  service: DatabaseService | null;
  config: DatabaseConfig | null;
  isConnected: boolean;
  filters: DashboardFilters;
  connect: (config: DatabaseConfig) => Promise<void>;
  disconnect: () => Promise<void>;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseServiceProviderProps {
  children: ReactNode;
}

export const DatabaseServiceProvider: React.FC<DatabaseServiceProviderProps> = ({ children }) => {
  const [service, setService] = useState<DatabaseService | null>(null);
  const [config, setConfig] = useState<DatabaseConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date()
    }
  });

  const connect = useCallback(async (newConfig: DatabaseConfig) => {
    try {
      setError(null);
      if (service) {
        await service.disconnect();
      }
      const newService = DatabaseServiceFactory.create(newConfig);
      await newService.connect(newConfig);
      setService(newService);
      setConfig(newConfig);
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsConnected(false);
      console.error('Database connection failed:', err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (service) {
        await service.disconnect();
        setService(null);
        setConfig(null);
        setIsConnected(false);
        setError(null);
      }
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  }, [service]);

  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  useEffect(() => {
    // Auto-connect to SQLite on startup for development
    const defaultConfig: DatabaseConfig = {
      type: 'sqlite',
      filePath: './oracle_perf.db'
    };
    connect(defaultConfig).catch(console.error);
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: DatabaseContextType = useMemo(() => ({
    service,
    config,
    isConnected,
    filters,
    connect,
    disconnect,
    updateFilters,
    error
  }), [service, config, isConnected, filters, connect, disconnect, updateFilters, error]);

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabaseService = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabaseService must be used within a DatabaseServiceProvider');
  }
  return context;
};
