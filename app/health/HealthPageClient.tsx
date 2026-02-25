'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Server, Database, Activity, Cpu, Zap, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { healthAPI, DetailedHealthResponse } from '@/lib/api/health';
import Button from '@/components/ui/Button';

export default function HealthPageClient() {
  const [healthData, setHealthData] = useState<DetailedHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthAPI.getDetailedHealth();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      );
    }
    if (status === 'connected' || status === 'ok') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-500' : 'text-red-500';
    }
    if (status === 'connected' || status === 'ok') {
      return 'text-green-500';
    }
    return 'text-yellow-500';
  };

  if (loading && !healthData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading health data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !healthData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <XCircle className="h-6 w-6" />
                Error Loading Health Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchHealthData} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!healthData) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Activity className="h-10 w-10 text-primary" />
            System Health Monitor
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time monitoring of Campus Market infrastructure
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchHealthData}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
          >
            {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="mb-6 border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              System Status
            </span>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthData.status)}
              <span className={`text-2xl font-bold ${getStatusColor(healthData.status)}`}>
                {healthData.status.toUpperCase()}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Environment</p>
              <p className="text-lg font-semibold">{healthData.environment}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-lg font-semibold">{healthData.uptime_formatted}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Node Version</p>
              <p className="text-lg font-semibold">{healthData.node_version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Check</p>
              <p className="text-lg font-semibold">
                {new Date(healthData.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Database Status
            {getStatusIcon(healthData.database.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`text-lg font-semibold ${getStatusColor(healthData.database.status)}`}>
                {healthData.database.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Host</p>
              <p className="text-lg font-semibold">{healthData.database.host}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Port</p>
              <p className="text-lg font-semibold">{healthData.database.port}</p>
            </div>
          </div>
          {healthData.database.stats && !healthData.database.stats.error && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Database Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Database</p>
                  <p className="font-semibold">{healthData.database.stats.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collections</p>
                  <p className="font-semibold">{healthData.database.stats.collections}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Size</p>
                  <p className="font-semibold">{healthData.database.stats.dataSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage Size</p>
                  <p className="font-semibold">{healthData.database.stats.storageSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Objects</p>
                  <p className="font-semibold">{healthData.database.stats.objects?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Indexes</p>
                  <p className="font-semibold">{healthData.database.stats.indexes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Index Size</p>
                  <p className="font-semibold">{healthData.database.stats.indexSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Object Size</p>
                  <p className="font-semibold">{healthData.database.stats.avgObjSize} bytes</p>
                </div>
              </div>
              {healthData.database.stats.collectionNames && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Collections:</p>
                  <div className="flex flex-wrap gap-2">
                    {healthData.database.stats.collectionNames.map((name) => (
                      <span
                        key={name}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory & CPU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Heap Used</span>
                <span className="font-semibold">{healthData.memory.heapUsed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Heap Total</span>
                <span className="font-semibold">{healthData.memory.heapTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">RSS</span>
                <span className="font-semibold">{healthData.memory.rss}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">External</span>
                <span className="font-semibold">{healthData.memory.external}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Array Buffers</span>
                <span className="font-semibold">{healthData.memory.arrayBuffers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              System Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Platform</span>
                <span className="font-semibold">{healthData.platform}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Architecture</span>
                <span className="font-semibold">{healthData.architecture}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CPU Usage (User)</span>
                <span className="font-semibold">{healthData.cpu.usage.user} μs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CPU Usage (System)</span>
                <span className="font-semibold">{healthData.cpu.usage.system} μs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Process ID</span>
                <span className="font-semibold">{healthData.process.pid}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Socket.io Connections */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Socket.io Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Connections</p>
              <p className="text-3xl font-bold text-primary">{healthData.sockets.activeConnections}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Namespace Connections</p>
              <p className="text-3xl font-bold text-primary">{healthData.sockets.totalConnections}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            API Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-semibold">{healthData.api.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="font-semibold">{healthData.api.version}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Description</span>
              <span className="font-semibold text-right max-w-md">{healthData.api.description}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamp */}
      <div className="text-center text-sm text-muted-foreground">
        <Clock className="h-4 w-4 inline mr-2" />
        Last updated: {new Date(healthData.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
