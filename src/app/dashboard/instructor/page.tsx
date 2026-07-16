'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/ui/StatsCard';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          // Filter courses by this instructor
          const myCourses = (data.courses || []).filter((c: any) => {
            const instructorName = `${c.instructor?.firstName || ''} ${c.instructor?.lastName || ''}`.trim();
            return instructorName === user?.name;
          });
          setCourses(myCourses);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchCourses();
  }, [user?.id]);

  const stats = [
    { label: 'Total Courses', value: courses.length.toString(), icon: '📚', trend: 'Your courses' },
    { label: 'Active Students', value: '0', icon: '👥', trend: 'Enrolled learners' },
    { label: 'Pending Reviews', value: '0', icon: '📝', trend: 'No submissions yet' },
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

      {/* Pending Submissions */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex-between" style={{ marginBottom: 'var(--spacing-base)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Pending Student Submissions</h2>
          <Link href="/dashboard/instructor/assignments" className="btn btn-ghost btn-sm">
            All Assignments →
          </Link>
        </div>
        <div className="card" style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          No pending submissions to review. Submissions will appear here when students complete assignments.
        </div>
      </section>

      {/* Quick Overview of Courses */}
      <section>
        <h2 className="section-title">Your Active Courses</h2>
        {courses.length === 0 ? (
          <div className="card" style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            You haven't created any courses yet.{' '}
            <Link href="/dashboard/instructor/courses" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Create your first course →</Link>
          </div>
        ) : (
          <div className="grid-3 animate-fade-in-up">
            {courses.map((course: any) => (
              <div className="card" key={course.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-primary-hover)' }}>
                    {course.category?.name || 'Uncategorized'}
                  </span>
                  <Badge variant={course.status === 'published' ? 'success' : 'warning'}>{course.status}</Badge>
                </div>
                <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{course.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  <span>📚 {course._count?.lessons || 0} lessons</span>
                  <span>⭐ {course.level || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
