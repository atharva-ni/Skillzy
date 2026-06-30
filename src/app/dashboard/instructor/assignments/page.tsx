'use client';

import React, { useState } from 'react';
import { mockAssignments } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';

export default function InstructorAssignments() {
  const [assignments, setAssignments] = useState(mockAssignments);

  const handleCreateAssignment = () => {
    const title = prompt('Enter Assignment Title:');
    if (!title) return;
    const courseName = prompt('Enter Course Name:') || 'Full-Stack Web Development';

    const newAssignment = {
      id: `assign-${Date.now()}`,
      title,
      courseId: 'course-1',
      courseName,
      dueDate: '2026-07-15',
      submissions: 0,
      totalStudents: 35,
      status: 'draft' as const,
      type: 'coding' as const,
    };

    setAssignments([...assignments, newAssignment]);
  };

  const columns = [
    { header: 'Title', accessor: 'title' as keyof typeof mockAssignments[0] },
    { header: 'Course', accessor: 'courseName' as keyof typeof mockAssignments[0] },
    { header: 'Due Date', accessor: 'dueDate' as keyof typeof mockAssignments[0] },
    {
      header: 'Submissions',
      accessor: (item: typeof mockAssignments[0]) => (
        <span>{item.submissions} / {item.totalStudents}</span>
      )
    },
    {
      header: 'Status',
      accessor: (item: typeof mockAssignments[0]) => (
        <Badge variant={item.status === 'active' ? 'success' : 'error'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessor: (item: typeof mockAssignments[0]) => (
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
        emptyMessage="No assignments created yet."
      />
    </div>
  );
}
