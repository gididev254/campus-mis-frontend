'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Loader2, TrendingUp, Users, ShoppingCart, Package, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { formatPrice } from '@/lib/utils';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';

type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

interface RevenueData {
  date: string;
  revenue: number;
}

interface UserRegistrationData {
  date: string;
  count: number;
}

interface OrderStatusData {
  date: string;
  count: number;
}

function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<TimePeriod>('7d');
  const [loading, setLoading] = useState(true);

  // Analytics data
  const [revenueData, setRevenueData] = useState<{
    totalRevenue: number;
    todayRevenue: number;
    dailyRevenue: RevenueData[];
  } | null>(null);

  const [userData, setUserData] = useState<{
    totalUsers: number;
    todayRegistrations: number;
    dailyRegistrations: UserRegistrationData[];
    usersByRole: { admin: number; seller: number; buyer: number };
  } | null>(null);

  const [orderData, setOrderData] = useState<{
    totalOrders: number;
    todayOrders: number;
    ordersByStatus: {
      pending: number;
      confirmed: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      refunded: number;
    };
    dailyOrders: OrderStatusData[];
    completionRate: number;
    cancellationRate: number;
    averageOrderValue: number;
  } | null>(null);

  const [productData, setProductData] = useState<{
    totalProducts: number;
    recentProducts: number;
    productsByStatus: { available: number; sold: number; pending: number };
    totalProductValue: number;
  } | null>(null);

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [revenueRes, usersRes, ordersRes, productsRes] = await Promise.all([
        adminAPI.getRevenueAnalytics({ period }),
        adminAPI.getUserAnalytics({ period }),
        adminAPI.getOrderAnalytics({ period }),
        adminAPI.getProductAnalytics(),
      ]);

      setRevenueData(revenueRes.data.data);
      setUserData(usersRes.data.data);
      setOrderData(ordersRes.data.data);
      setProductData(productsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Simple line chart component using SVG
  const LineChart = ({
    data,
    dataKey,
    color = '#3b82f6',
    height = 200,
  }: {
    data: Array<{ date: string; [key: string]: any }>;
    dataKey: string;
    color?: string;
    height?: number;
  }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map((d) => d[dataKey]), 1);
    const width = 100;
    const padding = 5;

    const points = data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - (d[dataKey] / maxValue) * (height - 2 * padding) - padding;
        return `${x},${y}`;
      })
      .join(' ');

    const areaPoints = `${padding},${height} ${points} ${width - padding},${height}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={areaPoints}
          fill={`url(#gradient-${dataKey})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform performance insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Label>Period:</Label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as TimePeriod)}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {loading && !revenueData ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(revenueData?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(revenueData?.todayRevenue || 0)} today
                </p>
              </CardContent>
            </Card>

            {/* Users */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {userData?.todayRegistrations || 0} new today
                </p>
              </CardContent>
            </Card>

            {/* Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderData?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {orderData?.todayOrders || 0} today
                </p>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productData?.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {productData?.recentProducts || 0} new this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  data={revenueData?.dailyRevenue || []}
                  dataKey="revenue"
                  color="#10b981"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                {revenueData?.dailyRevenue.length} days of data
              </div>
            </CardContent>
          </Card>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  data={userData?.dailyRegistrations || []}
                  dataKey="count"
                  color="#3b82f6"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                New user registrations over time
              </div>
            </CardContent>
          </Card>

          {/* Order Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Order Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  data={orderData?.dailyOrders || []}
                  dataKey="count"
                  color="#8b5cf6"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Daily order volume
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData?.ordersByStatus && Object.entries(orderData.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{status}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${((count as number) / (orderData.totalOrders || 1)) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {orderData?.completionRate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cancellation Rate</span>
                    <span className="text-lg font-bold text-red-600">
                      {orderData?.cancellationRate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Order Value</span>
                    <span className="text-lg font-bold">
                      {formatPrice(orderData?.averageOrderValue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productData?.productsByStatus && Object.entries(productData.productsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{status}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${((count as number) / (productData.totalProducts || 1)) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Product Value</span>
                    <span className="text-lg font-bold">
                      {formatPrice(productData?.totalProductValue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData?.usersByRole && Object.entries(userData.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{role}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / (userData.totalUsers || 1)) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <ClientErrorBoundary>
      <AdminAnalyticsPage />
    </ClientErrorBoundary>
  );
}
