'use client';

import { memo, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import Input from '@/components/ui/Input';

interface OrderFiltersProps {
  statusFilter: string;
  paymentStatusFilter: string;
  searchQuery: string;
  onFilterChange: (filters: {
    status: string;
    paymentStatus: string;
    search: string;
  }) => void;
  statuses: readonly string[];
  paymentStatuses: readonly string[];
}

const OrderFilters = memo(function OrderFilters({
  statusFilter,
  paymentStatusFilter,
  searchQuery,
  onFilterChange,
  statuses,
  paymentStatuses,
}: OrderFiltersProps) {
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      status: e.target.value,
      paymentStatus: paymentStatusFilter,
      search: searchQuery,
    });
  }, [paymentStatusFilter, searchQuery, onFilterChange]);

  const handlePaymentStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      status: statusFilter,
      paymentStatus: e.target.value,
      search: searchQuery,
    });
  }, [statusFilter, searchQuery, onFilterChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
      search: e.target.value,
    });
  }, [statusFilter, paymentStatusFilter, onFilterChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Status filter */}
      <div>
        <Label htmlFor="status-filter">Order Status</Label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={handleStatusChange}
          className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Payment status filter */}
      <div>
        <Label htmlFor="payment-status-filter">Payment Status</Label>
        <select
          id="payment-status-filter"
          value={paymentStatusFilter}
          onChange={handlePaymentStatusChange}
          className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Payment Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div>
        <Label htmlFor="search-orders">Search</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-orders"
            type="text"
            placeholder="Order number, buyer, seller, product..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
});

export default OrderFilters;
