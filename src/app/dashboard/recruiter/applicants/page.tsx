'use client';

import React, { useState } from 'react';
import { Applicant } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';

export default function RecruiterApplicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const handleStatusChange = (id: string, newStatus: Applicant['status']) => {
    setApplicants(
      applicants.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    alert(`Applicant status updated successfully to: ${newStatus}`);
  };

  const columns = [
    { header: 'Applicant Name', accessor: 'name' as keyof Applicant },
    { header: 'Email', accessor: 'email' as keyof Applicant },
    { header: 'Target Job', accessor: 'jobTitle' as keyof Applicant },
    {
      header: 'Skill Match',
      accessor: (item: Applicant) => (
        <span style={{
          fontWeight: 700,
          color: item.matchScore >= 90 ? 'var(--success)' : item.matchScore >= 80 ? 'var(--accent-primary-hover)' : 'var(--warning)'
        }}>
          {item.matchScore}%
        </span>
      )
    },
    { header: 'Experience', accessor: 'experience' as keyof Applicant },
    {
      header: 'Status',
      accessor: (item: Applicant) => (
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
      header: 'Actions',
      accessor: (item: Applicant) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {item.status === 'applied' && (
            <button
              onClick={() => handleStatusChange(item.id, 'shortlisted')}
              className="btn btn-primary btn-sm"
              style={{ padding: '2px 8px' }}
            >
              Shortlist
            </button>
          )}
          {item.status === 'shortlisted' && (
            <button
              onClick={() => handleStatusChange(item.id, 'interviewing')}
              className="btn btn-outline btn-sm"
              style={{ padding: '2px 8px' }}
            >
              Interview
            </button>
          )}
          {item.status === 'interviewing' && (
            <button
              onClick={() => handleStatusChange(item.id, 'hired')}
              className="btn btn-success btn-sm"
              style={{ padding: '2px 8px', background: 'var(--success)', border: 'none' }}
            >
              Hire
            </button>
          )}
          {item.status !== 'hired' && item.status !== 'rejected' && (
            <button
              onClick={() => handleStatusChange(item.id, 'rejected')}
              className="btn btn-danger btn-sm"
              style={{ padding: '2px 8px' }}
            >
              Reject
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Candidate Pipeline</h1>
        <p className="page-subtitle">Track, filter, and schedule interview actions for job applicants.</p>
      </div>

      <DataTable
        columns={columns}
        data={applicants}
        emptyMessage="No applicants found. Candidates will appear here once they apply to your jobs."
      />
    </div>
  );
}
