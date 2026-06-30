import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ progress, className = '', showLabel = false }: ProgressBarProps) {
  const boundedProgress = Math.min(100, Math.max(0, progress));
  return (
    <div className={`progress-section ${className}`} style={{ width: '100%' }}>
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${boundedProgress}%` }} />
      </div>
      {showLabel && (
        <span className="progress-label" style={{ display: 'block', textAlign: 'right', marginTop: '4px', fontSize: 'var(--font-size-xs)' }}>
          {boundedProgress}% complete
        </span>
      )}
    </div>
  );
}
