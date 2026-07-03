import React, { useState } from 'react';
import Link from 'next/link';
import ProgressBar from './ProgressBar';
import { motion } from 'framer-motion';

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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

  const getSpotlightColor = (cat: string) => {
    switch (cat) {
      case 'Web Development': return 'rgba(6, 182, 212, 0.06)';
      case 'AI & ML': return 'rgba(99, 102, 241, 0.06)';
      case 'Design': return 'rgba(236, 72, 153, 0.06)';
      case 'Security': return 'rgba(244, 63, 94, 0.06)';
      case 'DevOps': return 'rgba(16, 185, 129, 0.06)';
      case 'Computer Science': return 'rgba(245, 158, 11, 0.06)';
      default: return 'rgba(99, 102, 241, 0.04)';
    }
  };

  const getCategoryGradient = (cat: string) => {
    switch (cat) {
      case 'Web Development': return 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)';
      case 'AI & ML': return 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)';
      case 'Design': return 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)';
      case 'Security': return 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)';
      case 'DevOps': return 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)';
      case 'Computer Science': return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
      default: return 'var(--accent-gradient)';
    }
  };

  return (
    <Link href={`/dashboard/courses/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <motion.div
        className="card card-interactive"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-primary)',
          background: 'var(--bg-card)',
        }}
      >
        {/* Spotlight highlight */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, ${getSpotlightColor(category)}, transparent 80%)`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* Dynamic colored accent bar */}
        <div style={{
          height: '3px',
          width: '100%',
          background: getCategoryGradient(category),
          opacity: isHovered ? 1 : 0.4,
          transition: 'opacity 0.3s ease',
          zIndex: 1
        }} />

        <div style={{
          height: '130px',
          background: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3.25rem',
          position: 'relative',
          borderBottom: '1px solid #e5e5e5',
          zIndex: 1
        }}>
          <motion.span
            animate={{ scale: isHovered ? 1.1 : 1, rotate: isHovered ? [0, 5, -5, 0] : 0 }}
            transition={{ duration: 0.4 }}
          >
            {getCategoryEmoji(category)}
          </motion.span>
          <span className="badge badge-primary" style={{ position: 'absolute', top: '12px', right: '12px' }}>
            {duration}
          </span>
        </div>

        <div style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', flex: 1, zIndex: 1, position: 'relative' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-primary-hover)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {category}
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '8px 0', color: 'var(--text-primary)', lineBreak: 'anywhere', lineHeight: 1.4 }}>
            {title}
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'auto' }}>
            by {instructor}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 16px 0', fontSize: 'var(--font-size-xs)' }}>
            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>★ {rating}</span>
            <span style={{ color: 'var(--text-tertiary)' }}>({studentsEnrolled} students)</span>
          </div>

          {progress !== undefined ? (
            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <ProgressBar progress={progress} showLabel />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
              <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
              </span>
              <motion.span 
                style={{ fontSize: '11px', color: 'var(--accent-primary-hover)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                animate={{ x: isHovered ? 4 : 0 }}
              >
                Learn More →
              </motion.span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
