'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockJobs, mockApplicants } from '@/data/mock';
import StatsCard from '@/components/ui/StatsCard';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const myJobs = mockJobs.filter((j) => j.company === 'TechNova Solutions' || j.company === 'DataStream Inc.');
  const recentApplicants = mockApplicants.slice(0, 4);

  const stats = [
    { label: 'Active Jobs', value: myJobs.length || '3', icon: '📋', trend: '1 pending approval' },
    { label: 'Total Applicants', value: '254', icon: '👥', trend: '+15 today' },
    { label: 'Shortlisted', value: '45', icon: '🎯', trend: '18% rate' },
    { label: 'Total Hired', value: '12', icon: '🏆', trend: 'Goal: 20' },
  ];

  const columns = [
    { header: 'Applicant', accessor: 'name' as keyof typeof mockApplicants[0] },
    { header: 'Target Role', accessor: 'jobTitle' as keyof typeof mockApplicants[0] },
    {
      header: 'Match Score',
      accessor: (item: typeof mockApplicants[0]) => (
        <span style={{
          fontWeight: 700,
          color: item.matchScore >= 90 ? 'var(--success)' : item.matchScore >= 80 ? 'var(--accent-primary-hover)' : 'var(--warning)'
        }}>
          {item.matchScore}%
        </span>
      )
    },
    { header: 'Applied Date', accessor: 'appliedDate' as keyof typeof mockApplicants[0] },
    {
      header: 'Status',
      accessor: (item: typeof mockApplicants[0]) => (
        <Badge variant={
          item.status === 'hired' ? 'success' :
          item.status === 'interviewing' ? 'info' :
          item.status === 'shortlisted' ? 'primary' :
          item.status === 'rejected' ? 'error' : 'warning'
        }>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessor: (item: typeof mockApplicants[0]) => (
        <button
          onClick={() => alert(`Opening profile details for candidate: ${item.name}`)}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--accent-primary-hover)', fontWeight: 600 }}
        >
          Review ➔
        </button>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Recruiter Hub</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Source top technical developers from Skillzy.</p>
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

      {/* Dynamic Applicants Table */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex-between" style={{ marginBottom: 'var(--spacing-base)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Technical Applicants</h2>
          <Link href="/dashboard/recruiter/applicants" className="btn btn-ghost btn-sm">
            All Candidates →
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={recentApplicants}
          emptyMessage="No applications received yet."
        />
      </section>

      {/* Quick Job board view */}
      <section>
        <h2 className="section-title">Your Job Postings</h2>
        <div className="grid-3 animate-fade-in-up">
          {myJobs.map((job) => (
            <div className="card" key={job.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-primary-hover)' }}>
                  {job.type}
                </span>
                <Badge variant={job.status === 'active' ? 'success' : 'error'}>{job.status}</Badge>
              </div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{job.title}</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{job.salary}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                <span>👥 {job.applicants} candidates</span>
                <span>⏱️ {job.posted}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
