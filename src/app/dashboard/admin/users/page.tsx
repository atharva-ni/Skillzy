'use client';

import React, { useState } from 'react';
import { mockUsers, User } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(Object.values(mockUsers));

  const handleRoleChange = (id: string, newRole: User['role']) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
    alert(`User role updated successfully for user ID: ${id}`);
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof User },
    { header: 'Name', accessor: 'name' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    {
      header: 'Role',
      accessor: (item: User) => (
        <Badge variant={
          item.role === 'admin' ? 'error' :
          item.role === 'instructor' ? 'info' :
          item.role === 'recruiter' ? 'warning' : 'primary'
        }>
          {item.role}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (item: User) => (
        <select
          className="input select"
          style={{ width: '120px', padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
          value={item.role}
          onChange={(e) => handleRoleChange(item.id, e.target.value as User['role'])}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">User Management Workspace</h1>
        <p className="page-subtitle">Configure system roles and inspect user accounts.</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        emptyMessage="No platform users found."
      />
    </div>
  );
}
