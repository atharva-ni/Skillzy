'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockCourses, mockAssignments } from '@/data/mock';
import styles from './page.module.css';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, enrolledCourseIds } = useAuth();
  const enrolledCourses = mockCourses
    .filter((c) => enrolledCourseIds.includes(c.id))
    .map((c) => ({ ...c, progress: c.progress !== undefined ? c.progress : 0 }))
    .slice(0, 3);
  const upcomingAssignments = mockAssignments.filter(a => a.status === 'active').slice(0, 3);

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className={styles.welcomeSubtitle}>
            Continue your learning journey. You have {upcomingAssignments.length} assignments due this week.
          </p>
        </div>
        <div className={styles.welcomeArt}>📚</div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Enrolled Courses', value: enrolledCourseIds.length.toString(), icon: '📚', trend: '+2 this month' },
          { label: 'Completed', value: '12', icon: '✅', trend: '72% rate' },
          { label: 'Certificates', value: '8', icon: '🏆', trend: '2 new' },
          { label: 'Applications', value: '5', icon: '💼', trend: '3 active' },
        ].map((stat, i) => (
          <div key={stat.label} className={`${styles.statCard} animate-fade-in-up stagger-${i + 1}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statTrend}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <section className={styles.section}>
        <div className="flex-between">
          <h2 className="section-title">Continue Learning</h2>
          <Link href="/dashboard/my-learning" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className={styles.courseGrid}>
          {enrolledCourses.map((course) => (
            <Link href={`/dashboard/courses/${course.id}`} key={course.id} className={styles.courseCard}>
              <div className={styles.courseThumbnail}>
                <span className={styles.courseEmoji}>
                  {course.category === 'Web Development' ? '🌐' :
                   course.category === 'Computer Science' ? '🧮' :
                   course.category === 'AI & ML' ? '🤖' : '💻'}
                </span>
              </div>
              <div className={styles.courseInfo}>
                <span className={styles.courseCategory}>{course.category}</span>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.courseInstructor}>by {course.instructor}</p>
                <div className={styles.progressSection}>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className={styles.progressLabel}>{course.progress}% complete</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Assignments */}
      <section className={styles.section}>
        <div className="flex-between">
          <h2 className="section-title">Upcoming Assignments</h2>
          <Link href="/dashboard/coding-lab" className="btn btn-ghost btn-sm">Coding Lab →</Link>
        </div>
        <div className={styles.assignmentList}>
          {upcomingAssignments.map((assignment) => (
            <div key={assignment.id} className={styles.assignmentItem}>
              <div className={styles.assignmentIcon}>
                {assignment.type === 'coding' ? '💻' : assignment.type === 'written' ? '📝' : '❓'}
              </div>
              <div className={styles.assignmentInfo}>
                <h4 className={styles.assignmentTitle}>{assignment.title}</h4>
                <p className={styles.assignmentCourse}>{assignment.courseName}</p>
              </div>
              <div className={styles.assignmentMeta}>
                <span className={`badge ${assignment.status === 'active' ? 'badge-warning' : 'badge-success'}`}>
                  {assignment.status}
                </span>
                <span className={styles.assignmentDue}>Due {assignment.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Feedback Preview */}
      <section className={styles.section}>
        <h2 className="section-title">Recent AI Feedback</h2>
        <div className={styles.aiFeedbackCard}>
          <div className={styles.aiHeader}>
            <span className={styles.aiIcon}>🤖</span>
            <div>
              <h4>REST API Assignment — Code Review</h4>
              <p className="text-muted">Analyzed 2 hours ago</p>
            </div>
            <span className={`badge badge-success`}>87/100</span>
          </div>
          <div className={styles.aiBody}>
            <p>✅ Good use of async/await patterns and error handling middleware.</p>
            <p>⚡ Consider using connection pooling for database queries to improve performance by ~40%.</p>
            <p>🔒 Add input validation with a library like Zod to prevent SQL injection vectors.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
