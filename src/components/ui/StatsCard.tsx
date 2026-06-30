import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

export default function StatsCard({ label, value, icon, trend, className = '' }: StatsCardProps) {
  return (
    <div className={`card ${className}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
      <div style={{
        fontSize: '1.75rem',
        background: 'var(--bg-glass)',
        width: '56px',
        height: '56px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
                alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-primary)',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {label}
        </div>
        {trend && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)', marginTop: '4px' }}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
