import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

export default function StatsCard({ label, value, icon, trend, className = '' }: StatsCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className={`card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-lg)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
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
            background: `radial-gradient(220px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 0, 0, 0.015), transparent 80%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Decorative gradient border glow on hover */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px solid #d4d4d4',
          }}
        />
      )}

      <div
        style={{
          fontSize: '1.5rem',
          background: '#f4f4f5',
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e5e5e5',
          flexShrink: 0,
          zIndex: 2,
          position: 'relative',
        }}
      >
        {icon}
      </div>
      <div style={{ zIndex: 2, position: 'relative' }}>
        <motion.div 
          style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {value}
        </motion.div>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '4px' }}>
          {label}
        </div>
        {trend && (
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--success)', marginTop: '4px', opacity: 0.85 }}>
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}
