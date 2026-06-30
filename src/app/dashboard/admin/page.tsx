'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { platformStats, mockCourses, Payment } from '@/data/mock';
import StatsCard from '@/components/ui/StatsCard';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, payments } = useAuth();

  const pendingCourses = mockCourses.filter((c) => c.status === 'pending');
  const recentPayments = payments.slice(0, 4);

  const totalRevenueCalculated = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: 'Total Users', value: platformStats.totalUsers.toLocaleString(), icon: '👥', trend: `+${platformStats.monthlyGrowth}% MoM` },
    { label: 'Courses Created', value: platformStats.totalCourses, icon: '📚', trend: `${pendingCourses.length} pending approval` },
    { label: 'Total Revenue', value: `₹${(totalRevenueCalculated / 100000).toFixed(2)}L`, icon: '💳', trend: 'Secure flow' },
    { label: 'Active Job Roles', value: platformStats.activeJobs, icon: '💼', trend: '89 positions' },
  ];

  const columns = [
    { header: 'Student Name', accessor: 'studentName' as keyof Payment },
    { header: 'Course', accessor: 'courseName' as keyof Payment },
    {
      header: 'Amount',
      accessor: (item: Payment) => (
        <span>₹{item.amount.toLocaleString('en-IN')}</span>
      )
    },
    { header: 'Date', accessor: 'date' as keyof Payment },
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
        <h1 className="page-title">Super Admin Control Center</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Monitor business analytics and approve platform resources.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Dynamic Payments Table */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex-between" style={{ marginBottom: 'var(--spacing-base)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Transaction Records</h2>
          <Link href="/dashboard/admin/payments" className="btn btn-ghost btn-sm">
            All Payments →
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={recentPayments}
          emptyMessage="No payment transactions logged."
        />
      </section>

      {/* Course Approvals Quick list */}
      <section>
        <div className="flex-between" style={{ marginBottom: 'var(--spacing-base)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Courses Pending Review</h2>
          <Link href="/dashboard/admin/courses" className="btn btn-ghost btn-sm">
            Review Board →
          </Link>
        </div>
        <div className="grid-3 animate-fade-in-up">
          {pendingCourses.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '12px' }}>All courses are reviewed!</div>
          ) : (
            pendingCourses.map((course) => (
              <div className="card" key={course.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-primary-hover)' }}>
                  {course.category}
                </span>
                <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{course.title}</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Instructor: {course.instructor}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
