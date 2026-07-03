import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ progress, className = '', showLabel = false }: ProgressBarProps) {
  const boundedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`progress-section ${className}`} style={{ width: '100%' }}>
      <div className="progress-container" style={{ position: 'relative', overflow: 'hidden' }}>
        <motion.div 
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${boundedProgress}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            background: 'var(--accent-gradient)',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)'
          }}
        />
      </div>
      {showLabel && (
        <span className="progress-label" style={{ display: 'block', textAlign: 'right', marginTop: '6px', fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {boundedProgress}% complete
        </span>
      )}
    </div>
  );
}
