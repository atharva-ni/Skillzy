'use client';

import React, { useState } from 'react';
import { mockCourses } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';

export default function CourseApprovals() {
  const [courses, setCourses] = useState(mockCourses.filter((c) => c.status === 'pending' || c.status === 'published'));

  const handleApprove = (id: string) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, status: 'published' as const } : c))
    );
    alert(`Course ID: ${id} successfully approved and published!`);
  };

  const columns = [
    { header: 'Title', accessor: 'title' as keyof typeof mockCourses[0] },
    { header: 'Instructor', accessor: 'instructor' as keyof typeof mockCourses[0] },
    { header: 'Category', accessor: 'category' as keyof typeof mockCourses[0] },
    {
      header: 'Price',
      accessor: (item: typeof mockCourses[0]) => (
        <span>₹{item.price.toLocaleString('en-IN')}</span>
      )
    },
    {
      header: 'Status',
      accessor: (item: typeof mockCourses[0]) => (
        <Badge variant={item.status === 'published' ? 'success' : 'warning'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessor: (item: typeof mockCourses[0]) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {item.status === 'pending' ? (
            <button
              onClick={() => handleApprove(item.id)}
              className="btn btn-primary btn-sm"
              style={{ padding: '2px 8px' }}
            >
              Approve
            </button>
          ) : (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Verified</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Course Approvals Portal</h1>
        <p className="page-subtitle">Verify content submissions before authorizing public catalogue enrollment.</p>
      </div>

      <DataTable
        columns={columns}
        data={courses}
        emptyMessage="No pending course applications to review."
      />
    </div>
  );
}
