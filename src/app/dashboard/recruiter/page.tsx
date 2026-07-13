'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/ui/StatsCard';
import Link from 'next/link';

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Jobs', value: '0', icon: '📋', trend: 'No postings yet' },
    { label: 'Total Applicants', value: '0', icon: '👥', trend: 'Awaiting applications' },
    { label: 'Shortlisted', value: '0', icon: '🎯', trend: '—' },
    { label: 'Total Hired', value: '0', icon: '🏆', trend: '—' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Recruiter Hub</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Source top technical developers from Skilotech.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Applicants */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex-between" style={{ marginBottom: 'var(--spacing-base)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Technical Applicants</h2>
          <Link href="/dashboard/recruiter/applicants" className="btn btn-ghost btn-sm">
            All Candidates →
          </Link>
        </div>
        <div className="card" style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          No applications received yet. Post a job to start receiving candidates.
        </div>
      </section>

      {/* Job Postings */}
      <section>
        <h2 className="section-title">Your Job Postings</h2>
        <div className="card" style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          No job postings yet.{' '}
          <Link href="/dashboard/recruiter/jobs" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Create your first job →</Link>
        </div>
      </section>
    </div>
  );
}
