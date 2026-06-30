'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockSubmissions, mockCourses } from '@/data/mock';
import StatsCard from '@/components/ui/StatsCard';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export default function InstructorDashboard() {
  const { user } = useAuth();

  const myCourses = mockCourses.filter((c) => c.instructor === user?.name);
  const pendingSubmissions = mockSubmissions.filter((s) => s.status === 'pending' || s.status === 'ai_reviewed');

  const stats = [
    { label: 'Total Courses', value: myCourses.length || '2', icon: '📚', trend: '1 in draft' },
    { label: 'Active Students', value: '3,081', icon: '👥', trend: '+45 this week' },
    { label: 'Pending Reviews', value: pendingSubmissions.length, icon: '📝', trend: 'Needs action' },
  ];

  const columns = [
    { header: 'Student Name', accessor: 'studentName' as keyof typeof mockSubmissions[0] },
    { header: 'Assignment', accessor: 'assignmentTitle' as keyof typeof mockSubmissions[0] },
    { header: 'Submitted At', accessor: 'submittedAt' as keyof typeof mockSubmissions[0] },
    {
      header: 'AI Score',
      accessor: (item: typeof mockSubmissions[0]) => (
        <span style={{ fontWeight: 600, color: item.aiScore && item.aiScore >= 80 ? 'var(--success)' : 'var(--warning)' }}>
          {item.aiScore ? `${item.aiScore}/100` : 'Pending'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (item: typeof mockSubmissions[0]) => (
        <Badge variant={item.status === 'ai_reviewed' ? 'info' : 'warning'}>
          {item.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessor: (item: typeof mockSubmissions[0]) => (
        <button
          onClick={() => alert(`Reviewing and grading ${item.studentName}'s submission...`)}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--accent-primary-hover)', fontWeight: 600 }}
        >
          Grade ➔
        </button>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Instructor Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Manage your courses and review student work.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
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

      {/* Dynamic Submissions Pending Action */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex-between" style={{ marginBottom: 'var(--spacing-base)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Pending Student Submissions</h2>
          <Link href="/dashboard/instructor/assignments" className="btn btn-ghost btn-sm">
            All Assignments →
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={pendingSubmissions}
          emptyMessage="No pending assignments to review."
        />
      </section>

      {/* Quick Overview of Courses */}
      <section>
        <h2 className="section-title">Your Active Courses</h2>
        <div className="grid-3 animate-fade-in-up">
          {myCourses.map((course) => (
            <div className="card" key={course.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-primary-hover)' }}>
                  {course.category}
                </span>
                <Badge variant={course.status === 'published' ? 'success' : 'warning'}>{course.status}</Badge>
              </div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{course.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '8px' }}>
                <span>👥 {course.studentsEnrolled} enrolled</span>
                <span>⭐ {course.rating} Rating</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
