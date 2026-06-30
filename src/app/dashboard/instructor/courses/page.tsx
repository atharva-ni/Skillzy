'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockCourses } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function InstructorCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState(mockCourses.filter((c) => c.instructor === user?.name));

  const handleCreateCourse = () => {
    const title = prompt('Enter Course Title:');
    if (!title) return;
    const category = prompt('Enter Course Category (e.g. Web Development):') || 'Programming';

    const newCourse = {
      id: `course-${Date.now()}`,
      title,
      description: 'Course description placeholder text.',
      instructor: user?.name || 'Priya Sharma',
      instructorAvatar: '👩‍🏫',
      category,
      level: 'Beginner' as const,
      price: 1999,
      rating: 5.0,
      studentsEnrolled: 0,
      duration: '10 hours',
      modules: 1,
      lessons: 5,
      image: '/placeholder.jpg',
      status: 'draft' as const,
    };

    setCourses([...courses, newCourse]);
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

      <div className="grid-3 animate-fade-in-up">
        {courses.map((course) => (
          <div key={course.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-primary-hover)' }}>
                {course.category}
              </span>
              <Badge variant={course.status === 'published' ? 'success' : course.status === 'pending' ? 'info' : 'warning'}>
                {course.status}
              </Badge>
            </div>

            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>{course.title}</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              Modules: {course.modules} • Lessons: {course.lessons} • Level: {course.level}
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
                ₹{course.price.toLocaleString('en-IN')}
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
    </div>
  );
}
