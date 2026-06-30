'use client';

import React, { useState } from 'react';
import { mockCourses } from '@/data/mock';
import CourseCard from '@/components/ui/CourseCard';
import { useAuth } from '@/context/AuthContext';

export default function MyLearning() {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const { enrolledCourseIds } = useAuth();

  const enrolledCourses = mockCourses
    .filter((c) => enrolledCourseIds.includes(c.id))
    .map((c) => ({ ...c, progress: c.progress !== undefined ? c.progress : 0 }));

  const filteredCourses = enrolledCourses.filter((c) => {
    if (filter === 'in-progress') return c.progress < 100;
    if (filter === 'completed') return c.progress === 100;
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Learning</h1>
        <p className="page-subtitle">Track your progress and continue where you left off.</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: 'var(--spacing-xl)',
        borderBottom: '1px solid var(--border-primary)',
        paddingBottom: '12px'
      }}>
        {[
          { label: 'All Enrolled', value: 'all' },
          { label: 'In Progress', value: 'in-progress' },
          { label: 'Completed', value: 'completed' },
        ].map((tab) => (
          <button
            key={tab.value}
                        onClick={() => setFilter(tab.value as 'all' | 'in-progress' | 'completed')}
            className={`btn ${filter === tab.value ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 16px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <h3>No courses found</h3>
          <p>
            {filter === 'completed'
              ? "You haven't completed any courses yet. Keep learning!"
              : "You are not enrolled in any courses. Browse catalog to start."}
          </p>
        </div>
      ) : (
        <div className="grid-3 animate-fade-in-up">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              instructor={course.instructor}
              category={course.category}
              price={course.price}
              rating={course.rating}
              studentsEnrolled={course.studentsEnrolled}
              duration={course.duration}
              progress={course.progress}
            />
          ))}
        </div>
      )}
    </div>
  );
}
