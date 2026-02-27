import { api } from './index';

/**
 * Seller API endpoints
 * Handles seller balance, withdrawals, and transaction history
 */

export interface SellerBalance {
  sellerId: string;
  totalEarnings: number;
  totalOrders: number;
  currentBalance: number;
  pendingWithdrawals: number;
  withdrawnTotal: number;
  lastUpdated: string;
  ledger: Transaction[];
}

export interface Transaction {
  type: 'sale' | 'withdrawal' | 'fee' | 'adjustment';
  amount: number;
  orderId?: string;
  productTitle?: string;
  buyerName?: string;
  description?: string;
  status: 'available' | 'pending' | 'completed' | 'failed';
  date: string;
  metadata?: any;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalEarnings: number;
    currentBalance: number;
    pendingWithdrawals: number;
    withdrawnTotal: number;
  };
}

export const sellersAPI = {
  /**
   * Get seller's current balance and transaction history
   */
  getBalance: () =>
    api.get<{ success: boolean; data: SellerBalance }>('/sellers/balance'),

  /**
   * Request a withdrawal from seller's available balance
   */
  requestWithdrawal: (data: { amount: number; notes?: string }) =>
    api.post<{
      success: boolean;
      message: string;
      data: {
        withdrawalAmount: number;
        currentBalance: number;
        pendingWithdrawals: number;
        status: string;
      };
    }>('/sellers/withdraw', data),

  /**
   * Get seller's detailed transaction history
   */
  getTransactionHistory: (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }) =>
    api.get<{ success: boolean; data: TransactionHistoryResponse }>('/sellers/transactions', { params }),
};
