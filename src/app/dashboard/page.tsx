'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Briefcase, 
  ArrowRight,
  Terminal as TerminalIcon,
  Sparkles
} from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedCount: 0,
    certificatesCount: 0,
    applicationsCount: 0,
  });

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch real courses list from catalog to extract details
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to load courses');
        const data = await res.json();
        
        // Fetch user progress for all enrolled courses
        const meRes = await fetch('/api/users/me');
        if (!meRes.ok) throw new Error('Failed to load profile details');
        const meData = await meRes.json();
        
        const courseIds = meData.enrolledCourseIds || [];
        
        // Match course IDs to full courses details
        const fullEnrolled = data.courses.filter((c: any) => courseIds.includes(c.id));
        
        // Fetch progress for each course
        const coursesWithProgress = await Promise.all(
          fullEnrolled.map(async (course: any) => {
            const progressRes = await fetch(`/api/courses/${course.id}/progress`);
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              return {
                ...course,
                progress: progressData.progressPct || 0,
              };
            }
            return { ...course, progress: 0 };
          })
        );

        setEnrolledCourses(coursesWithProgress);
        
        // Calculate statistics
        const completed = coursesWithProgress.filter((c: any) => c.progress === 100).length;
        setStats({
          enrolledCount: courseIds.length,
          completedCount: completed,
          certificatesCount: completed, // 1 certificate per completed course
          applicationsCount: 1, // mock job app
        });

      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  // tech loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', flexDirection: 'column', gap: '20px', position: 'relative' }}>
        <div style={{
          width: '50px', height: '50px',
          borderRadius: '50%', border: '3px solid rgba(255,255,255,0.02)',
          borderTop: '3px solid var(--accent-primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>loading_learner_metrics...</p>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 22 }
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <motion.div 
        className={styles.welcomeBanner}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-premium)'
        }}
      >
        <div style={{ zIndex: 1 }}>
          <h1 className={styles.welcomeTitle} style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Learner'}</span> 👋
          </h1>
          <p className={styles.welcomeSubtitle} style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>
            Continue your learning journey. You have {stats.enrolledCount} active courses.
          </p>
        </div>
        <motion.div 
          className={styles.welcomeArt}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          style={{ fontSize: '3rem', zIndex: 1 }}
        >
          🎓
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className={styles.statsGrid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}
      >
        {[
          { label: 'Enrolled Courses', value: stats.enrolledCount.toString(), icon: <BookOpen size={20} className="text-gradient" />, trend: 'Lifetime access' },
          { label: 'Completed', value: stats.completedCount.toString(), icon: <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />, trend: 'Keep it up!' },
          { label: 'Certificates', value: stats.certificatesCount.toString(), icon: <Award size={20} style={{ color: 'var(--warning)' }} />, trend: 'Verified' },
          { label: 'Applications', value: stats.applicationsCount.toString(), icon: <Briefcase size={20} style={{ color: 'var(--info)' }} />, trend: '1 active' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label} 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{
              background: '#f4f4f5',
              border: '1px solid #e5e5e5',
              borderRadius: 'var(--radius-md)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{stat.trend}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Continue Learning */}
      <motion.section 
        className={styles.section}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title" style={{ margin: 0, fontSize: '1.15rem' }}>Continue Learning</h2>
          <Link href="/dashboard/my-learning" style={{ fontSize: '0.8rem', color: 'var(--accent-primary-hover)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#ffffff', border: '1px solid #e5e5e5' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 700 }}>Not enrolled in any courses yet</h3>
            <p style={{ margin: '8px 0 20px 0', fontSize: 'var(--font-size-sm)' }}>Explore our catalog to start building new skills.</p>
            <Link href="/dashboard/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className={styles.courseGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
            {enrolledCourses.map((course) => (
              <Link href={`/dashboard/courses/${course.id}`} key={course.id} className={styles.courseCard} style={{ display: 'block', textDecoration: 'none', maxWidth: '360px', width: '100%' }}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e5e5',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%'
                  }}
                >
                  <div style={{
                    height: '100px',
                    background: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    borderBottom: '1px solid #e5e5e5'
                  }}>
                    {course.category?.icon || '🌐'}
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-primary-hover)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {course.category?.name || 'Technology'}
                    </span>
                    <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, margin: '6px 0 4px 0', color: 'var(--text-primary)' }}>{course.title}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>by {course.instructor?.firstName} {course.instructor?.lastName}</p>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <ProgressBar progress={course.progress} showLabel />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </motion.section>

      {/* Recent AI Feedback Preview */}
      <motion.section 
        className={styles.section}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={16} className="text-gradient" />
          <h2 className="section-title" style={{ margin: 0, fontSize: '1.15rem' }}>Recent AI Feedback</h2>
        </div>

        <div 
          className={styles.aiFeedbackCard}
          style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-premium)',
          }}
        >
          {/* Subtle code terminal glow background overlay */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '200px', height: '100%',
            background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div className={styles.aiHeader} style={{ display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid #e5e5e5', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              borderRadius: 'var(--radius-md)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)'
            }}>
              <TerminalIcon size={18} />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>REST API Assignment — Code Review</h4>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>Interactive optimization feedback</p>
            </div>
            <span className={`badge badge-success`} style={{ marginLeft: 'auto', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '4px 10px', fontSize: '11px', borderRadius: 'var(--radius-sm)' }}>
              87/100
            </span>
          </div>

          <div className={styles.aiBody} style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-sm)' }}>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
              <p>Good use of async/await patterns and error handling middleware.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>⚡</span>
              <p>Consider using connection pooling for database queries to improve performance by ~40%.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>🔒</span>
              <p>Add input validation with a library like Zod to prevent SQL injection vectors.</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
