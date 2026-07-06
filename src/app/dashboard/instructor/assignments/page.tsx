'use client';

import React, { useState } from 'react';
import { Assignment } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';

export default function InstructorAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const handleCreateAssignment = () => {
    alert('Assignment creation will be available soon. This feature requires an API endpoint.');
  };

  const columns = [
    { header: 'Title', accessor: 'title' as keyof Assignment },
    { header: 'Course', accessor: 'courseName' as keyof Assignment },
    { header: 'Due Date', accessor: 'dueDate' as keyof Assignment },
    {
      header: 'Submissions',
      accessor: (item: Assignment) => (
        <span>{item.submissions} / {item.totalStudents}</span>
      )
    },
    {
      header: 'Status',
      accessor: (item: Assignment) => (
        <Badge variant={item.status === 'active' ? 'success' : 'error'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessor: (item: Assignment) => (
        <button
          onClick={() => alert(`Modifying assignment configuration for ${item.title}`)}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--accent-primary-hover)' }}
        >
          Edit
        </button>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Assignment Workspace</h1>
          <p className="page-subtitle">Publish coding challenges, review student completions, and set grading criteria.</p>
        </div>
        <Button onClick={handleCreateAssignment}>+ Add Assignment</Button>
      </div>

      <DataTable
        columns={columns}
        data={assignments}
        emptyMessage="No assignments created yet. Create your first assignment to get started."
      />
    </div>
  );
}
