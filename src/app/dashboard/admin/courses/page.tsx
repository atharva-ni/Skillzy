'use client';

import React, { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';

interface CourseRow {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  status: 'published' | 'draft' | 'pending';
}

export default function CourseApprovals() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          const filtered = (data.courses || [])
            .filter((c: any) => c.status === 'pending' || c.status === 'published')
            .map((c: any) => ({
              id: c.id,
              title: c.title,
              instructor: `${c.instructor?.firstName || ''} ${c.instructor?.lastName || ''}`.trim() || 'Unknown',
              category: c.category?.name || 'Uncategorized',
              price: c.price || 0,
              status: c.status,
            }));
          setCourses(filtered);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handleApprove = (id: string) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, status: 'published' as const } : c))
    );
    alert(`Course ID: ${id} successfully approved and published!`);
  };

  const columns = [
    { header: 'Title', accessor: 'title' as keyof CourseRow },
    { header: 'Instructor', accessor: 'instructor' as keyof CourseRow },
    { header: 'Category', accessor: 'category' as keyof CourseRow },
    {
      header: 'Price',
      accessor: (item: CourseRow) => (
        <span>₹{item.price.toLocaleString('en-IN')}</span>
      )
    },
    {
      header: 'Status',
      accessor: (item: CourseRow) => (
        <Badge variant={item.status === 'published' ? 'success' : 'warning'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessor: (item: CourseRow) => (
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
        emptyMessage="No courses to review. Courses will appear here once instructors submit them."
      />
    </div>
  );
}
