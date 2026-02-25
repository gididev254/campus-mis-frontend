/**
 * Health Check API Module
 *
 * Provides endpoints for monitoring system health, database status,
 * server performance, and resource usage.
 *
 * @module lib/api/health
 */

import { api } from './index';

// Basic health check response
export interface BasicHealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  uptime_formatted: string;
  environment: string;
  database: {
    status: 'connected' | 'disconnected' | 'connecting' | 'disconnecting' | 'unknown';
    ready: boolean;
  };
  memory: {
    used: string;
    total: string;
    rss: string;
  };
}

// Detailed health check response
export interface DetailedHealthResponse extends Omit<BasicHealthResponse, 'database' | 'memory'> {
  node_version: string;
  platform: string;
  architecture: string;
  api: {
    version: string;
    name: string;
    description: string;
  };
  database: {
    status: string;
    ready: boolean;
    host: string;
    port: number;
    stats: DatabaseStats | null;
  };
  memory: {
    heapUsed: string;
    heapTotal: string;
    rss: string;
    external: string;
    arrayBuffers: string;
  };
  sockets: {
    activeConnections: number;
    totalConnections: number;
  };
  cpu: {
    usage: {
      user: number;
      system: number;
    };
    model: string;
  };
  process: {
    pid: number;
    title: string;
    cwd: string;
  };
}

export interface DatabaseStats {
  name: string;
  collections: number;
  collectionNames: string[];
  dataSize: string;
  storageSize: string;
  indexes: number;
  indexSize: string;
  avgObjSize: number;
  objects: number;
  error?: string;
  message?: string;
}

/**
 * Health Check API
 */
export const healthAPI = {
  /**
   * Get basic health status
   * Returns quick health check with essential system information
   */
  getBasicHealth: async (): Promise<BasicHealthResponse> => {
    const response = await api.get<BasicHealthResponse>('/health');
    return response.data;
  },

  /**
   * Get detailed health status
   * Returns comprehensive health information including database stats,
   * socket connections, memory usage, and system info
   */
  getDetailedHealth: async (): Promise<DetailedHealthResponse> => {
    const response = await api.get<DetailedHealthResponse>('/health/detailed');
    return response.data;
  }
};
