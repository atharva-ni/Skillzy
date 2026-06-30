import React from 'react';
import Badge from './Badge';
import Button from './Button';

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  salary: string;
  skills: string[];
  posted: string;
  applicants: number;
  onApply?: (id: string) => void;
}

export default function JobCard({
  id,
  title,
  company,
  location,
  type,
  salary,
  skills,
  posted,
  applicants,
  onApply
}: JobCardProps) {
  const getTypeVariant = (t: string) => {
    switch (t) {
      case 'Full-time': return 'primary';
      case 'Internship': return 'success';
      case 'Contract': return 'info';
      default: return 'warning';
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary-hover)', fontWeight: 500 }}>
            {company}
          </p>
        </div>
        <Badge variant={getTypeVariant(type)}>{type}</Badge>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
        <span>📍 {location}</span>
        <span>💰 {salary}</span>
        <span>⏱️ {posted}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
        {skills.map((skill) => (
          <span
            key={skill}
            style={{
              fontSize: 'var(--font-size-xs)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)'
            }}
          >
            {skill}
          </span>
        ))}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-primary)'
      }}>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
          👥 {applicants} applicants
        </span>
        <Button size="sm" onClick={() => onApply?.(id)}>
          Apply Now
        </Button>
      </div>
    </div>
  );
}
