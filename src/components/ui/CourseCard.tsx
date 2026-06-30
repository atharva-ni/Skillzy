import React from 'react';
import Link from 'next/link';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  rating: number;
  studentsEnrolled: number;
  duration: string;
  progress?: number;
}

export default function CourseCard({
  id,
  title,
  instructor,
  category,
  price,
  rating,
  studentsEnrolled,
  duration,
  progress
}: CourseCardProps) {
  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'Web Development': return '🌐';
      case 'Computer Science': return '🧮';
      case 'AI & ML': return '🤖';
      case 'DevOps': return '🛠️';
      case 'Design': return '🎨';
      case 'Security': return '🔐';
      default: return '💻';
    }
  };

  return (
    <Link href={`/dashboard/courses/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
        <div style={{
          height: '140px',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3.5rem',
          position: 'relative'
        }}>
          {getCategoryEmoji(category)}
          <span className="badge badge-primary" style={{ position: 'absolute', top: '12px', right: '12px' }}>
            {duration}
          </span>
        </div>
        <div style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-primary-hover)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {category}
          </span>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: '8px 0', color: 'var(--text-primary)', lineBreak: 'anywhere' }}>
            {title}
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'auto' }}>
            by {instructor}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0 16px 0', fontSize: 'var(--font-size-sm)' }}>
            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>★ {rating}</span>
            <span style={{ color: 'var(--text-tertiary)' }}>({studentsEnrolled} students)</span>
          </div>

          {progress !== undefined ? (
            <div style={{ marginTop: 'auto' }}>
              <ProgressBar progress={progress} showLabel />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-primary-hover)', fontWeight: 600 }}>
                Learn More →
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
