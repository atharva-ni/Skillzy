'use client';

import React from 'react';
import { Payment } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import { useAuth } from '@/context/AuthContext';

export default function PaymentRecords() {
  const { payments } = useAuth();

  const columns = [
    { header: 'Invoice ID', accessor: 'invoiceId' as keyof Payment },
    { header: 'Student Name', accessor: 'studentName' as keyof Payment },
    { header: 'Purchased Item', accessor: 'courseName' as keyof Payment },
    {
      header: 'Amount Paid',
      accessor: (item: Payment) => (
        <span>₹{item.amount.toLocaleString('en-IN')}</span>
      )
    },
    { header: 'Method', accessor: 'method' as keyof Payment },
    { header: 'Transaction Date', accessor: 'date' as keyof Payment },
    {
      header: 'Status',
      accessor: (item: Payment) => (
        <Badge variant={
          item.status === 'completed' ? 'success' :
          item.status === 'pending' ? 'warning' :
          item.status === 'failed' ? 'error' : 'info'
        }>
          {item.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Payment & Invoices Records</h1>
        <p className="page-subtitle">Inspect transactional audit files powered by Razorpay gateways.</p>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        emptyMessage="No payments recorded."
      />
    </div>
  );
}
