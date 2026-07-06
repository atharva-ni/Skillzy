'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function InstructorCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
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
  }, [user]);

  const handleCreateCourse = () => {
    alert('Course creation will be available soon. This feature requires an API endpoint.');
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Create, design, and manage your student curricula.</p>
        </div>
        <Button onClick={handleCreateCourse}>+ New Course</Button>
      </div>

      {courses.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No courses yet</h3>
          <p>Create your first course to start teaching on Skillzy.</p>
        </div>
      ) : (
        <div className="grid-3 animate-fade-in-up">
          {courses.map((course: any) => (
            <div key={course.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-primary-hover)' }}>
                  {course.category?.name || 'Uncategorized'}
                </span>
                <Badge variant={course.status === 'published' ? 'success' : course.status === 'pending' ? 'info' : 'warning'}>
                  {course.status}
                </Badge>
              </div>

              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>{course.title}</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Lessons: {course._count?.lessons || 0} • Level: {course.level || 'N/A'}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-primary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  ₹{(course.price || 0).toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => alert(`Editing course layout for course ID: ${course.id}`)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--accent-primary-hover)', fontWeight: 600 }}
                >
                  Manage ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
