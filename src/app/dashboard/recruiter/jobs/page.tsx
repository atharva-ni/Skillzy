'use client';

import React, { useState } from 'react';
import { Job } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleCreateJob = () => {
    const title = prompt('Enter Job Title:');
    if (!title) return;
    const salary = prompt('Enter Salary Range (e.g. ₹8-12 LPA):') || '₹10-15 LPA';

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title,
      company: 'My Company',
      location: 'Remote',
      type: 'Full-time',
      salary,
      skills: ['React', 'TypeScript', 'Node.js'],
      posted: 'Just now',
      applicants: 0,
      status: 'active',
      description: 'Job description placeholder text.',
    };

    setJobs([...jobs, newJob]);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Manage Job Postings</h1>
          <p className="page-subtitle">Publish new technical career roles and view match statistics.</p>
        </div>
        <Button onClick={handleCreateJob}>+ Create Job</Button>
      </div>

      {jobs.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No job postings yet</h3>
          <p>Create your first job posting to start receiving applications from Skilotech learners.</p>
        </div>
      ) : (
        <div className="grid-3 animate-fade-in-up">
          {jobs.map((job) => (
            <div key={job.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge variant="primary">{job.type}</Badge>
                <Badge variant={job.status === 'active' ? 'success' : 'error'}>{job.status}</Badge>
              </div>

              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>{job.title}</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                {job.company} • {job.location}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {job.skills.map((s) => (
                  <span key={s} style={{ fontSize: '10px', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                    {s}
                  </span>
                ))}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-primary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                <span style={{ fontWeight: 600 }}>{job.salary}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                  {job.applicants} candidates
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
