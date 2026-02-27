'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  User,
  Calendar,
  Receipt,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, type WithdrawalRequest } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

export default function WithdrawalsManagementPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'processing' | 'completed' | 'cancelled'>('pending');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter, page]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getWithdrawalRequests({
        status: statusFilter,
        page,
        limit: 20
      });
      setWithdrawals(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch withdrawal requests:', error);
      toast.error('Failed to load withdrawal requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async (requestId: string, status: 'processing' | 'completed' | 'cancelled', notes?: string) => {
    try {
      setProcessing(requestId);
      await adminAPI.processWithdrawalRequest(requestId, { status, notes });

      toast.success(`Withdrawal request marked as ${status}`);

      // Remove from list if completed or cancelled
      if (status === 'completed' || status === 'cancelled') {
        setWithdrawals(withdrawals.filter(w => w._id !== requestId));
        setTotal(prev => prev - 1);
      } else {
        // Update status if processing
        setWithdrawals(withdrawals.map(w =>
          w._id === requestId ? { ...w, status: 'processing' as const } : w
        ));
      }
    } catch (error) {
      console.error('Failed to process withdrawal:', error);
      toast.error('Failed to process withdrawal request.');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Processing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        <p className="text-muted-foreground">
          Manage seller withdrawal requests
        </p>
      </div>

      {/* Status Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => { setStatusFilter('pending'); setPage(1); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Pending {statusFilter === 'pending' && `(${total})`}
        </button>
        <button
          onClick={() => { setStatusFilter('processing'); setPage(1); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'processing'
              ? 'bg-blue-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Processing {statusFilter === 'processing' && `(${total})`}
        </button>
        <button
          onClick={() => { setStatusFilter('completed'); setPage(1); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => { setStatusFilter('cancelled'); setPage(1); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'cancelled'
              ? 'bg-red-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Summary Card */}
      {(statusFilter === 'pending' || statusFilter === 'processing') && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              {statusFilter === 'pending' ? 'Pending' : 'Processing'} Withdrawals Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-3xl font-bold">{total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(withdrawals.reduce((sum, w) => sum + w.amount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Withdrawal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Check className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No {statusFilter} withdrawals</h3>
              <p className="text-muted-foreground">No withdrawal requests with this status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Request ID</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Seller</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Requested</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div className="font-mono text-sm">{withdrawal._id.slice(-8)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{withdrawal.sellerName}</div>
                            <div className="text-xs text-muted-foreground">Balance: {formatPrice(withdrawal.currentBalance)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono">{withdrawal.sellerPhone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{withdrawal.sellerEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-lg">{formatPrice(withdrawal.amount)}</div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(withdrawal.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(withdrawal.requestedAt)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {statusFilter === 'pending' && (
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleProcessWithdrawal(withdrawal._id, 'processing')}
                              disabled={processing === withdrawal._id}
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              {processing === withdrawal._id ? 'Processing...' : 'Mark Processing'}
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm(`Have you sent ${formatPrice(withdrawal.amount)} to ${withdrawal.sellerPhone}?`)) {
                                  handleProcessWithdrawal(withdrawal._id, 'completed', 'Payment sent via M-Pesa');
                                }
                              }}
                              disabled={processing === withdrawal._id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark Paid
                            </Button>
                          </div>
                        )}
                        {statusFilter === 'processing' && (
                          <Button
                            onClick={() => {
                              if (confirm(`Confirm you have sent ${formatPrice(withdrawal.amount)} to ${withdrawal.sellerPhone}?`)) {
                                handleProcessWithdrawal(withdrawal._id, 'completed', 'Payment sent via M-Pesa');
                              }
                            }}
                            disabled={processing === withdrawal._id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processing === withdrawal._id ? 'Processing...' : 'Confirm Payment'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
