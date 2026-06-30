'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/data/mock';
import styles from './page.module.css';

const roles: { role: UserRole; icon: string; label: string; description: string; color: string }[] = [
  {
    role: 'student',
    icon: '🎓',
    label: 'Student',
    description: 'Browse courses, practice coding, apply for jobs, and track your learning progress.',
    color: '#6366f1',
  },
  {
    role: 'instructor',
    icon: '👩‍🏫',
    label: 'Instructor',
    description: 'Create courses, publish assignments, review submissions, and guide students.',
    color: '#8b5cf6',
  },
  {
    role: 'recruiter',
    icon: '🏢',
    label: 'Recruiter',
    description: 'Post job opportunities, review applicants, and find the best talent.',
    color: '#a78bfa',
  },
  {
    role: 'admin',
    icon: '⚙️',
    label: 'Admin',
    description: 'Manage platform users, approve courses, monitor payments and analytics.',
    color: '#c084fc',
  },
];

const roleDashboardPaths: Record<UserRole, string> = {
  student: '/dashboard',
  instructor: '/dashboard/instructor',
  recruiter: '/dashboard/recruiter',
  admin: '/dashboard/admin',
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (role: UserRole) => {
    login(role);
    router.push(roleDashboardPaths[role]);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>Skillzy</span>
          </div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>
            Select a role to explore the platform. In production, this will use Clerk authentication.
          </p>
        </div>

        <div className={styles.rolesGrid}>
          {roles.map((item) => (
            <button
              key={item.role}
              className={styles.roleCard}
              onClick={() => handleLogin(item.role)}
              id={`login-${item.role}`}
              style={{ '--card-accent': item.color } as React.CSSProperties}
            >
              <div className={styles.roleIcon}>{item.icon}</div>
              <h3 className={styles.roleLabel}>{item.label}</h3>
              <p className={styles.roleDesc}>{item.description}</p>
              <div className={styles.roleArrow}>→</div>
            </button>
          ))}
        </div>

        <p className={styles.footerNote}>
          🔒 Demo Mode — No real authentication required
        </p>
      </div>
    </div>
  );
}
