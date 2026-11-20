import React from 'react';
import { PaymentStatus, TransactionDirection, PaymentMethod } from '../../types/financial';

interface BadgeProps {
  type: 'status' | 'direction' | 'method' | 'categoryType' | 'budget';
  value: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  if (type === 'status') {
    const status = value as PaymentStatus;
    if (status === 'PAID') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          ● PAID
        </span>
      );
    }
    if (status === 'PARTIALLY PAID') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          ◐ PARTIALLY PAID
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-[#DC2626] border border-rose-200">
        ○ UNPAID
      </span>
    );
  }

  if (type === 'direction') {
    const dir = value as TransactionDirection;
    if (dir === 'CREDIT') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          + CREDIT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-[#DC2626] border border-rose-200">
        - DEBIT
      </span>
    );
  }

  if (type === 'budget') {
    if (value === 'EXCEEDED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-[#DC2626] border border-rose-200">
          EXCEEDED
        </span>
      );
    }
    if (value === 'WARNING') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          NEAR LIMIT (80%+)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-[#16A34A] border border-emerald-200">
        HEALTHY
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
      {value}
    </span>
  );
};
