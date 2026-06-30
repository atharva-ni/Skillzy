'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/data/mock';
import styles from './Header.module.css';

const roleLabels: Record<UserRole, { label: string; icon: string }> = {
  student: { label: 'Student', icon: '🎓' },
  instructor: { label: 'Instructor', icon: '👩‍🏫' },
  recruiter: { label: 'Recruiter', icon: '🏢' },
  admin: { label: 'Admin', icon: '⚙️' },
};

const roleDashboardPaths: Record<UserRole, string> = {
  student: '/dashboard',
  instructor: '/dashboard/instructor',
  recruiter: '/dashboard/recruiter',
  admin: '/dashboard/admin',
};

export default function Header() {
  const { user, setRole, logout } = useAuth();
  const router = useRouter();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleRoleSwitch = (role: UserRole) => {
    setRole(role);
    setShowRoleMenu(false);
    router.push(roleDashboardPaths[role]);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search courses, jobs, community..."
            id="global-search"
          />
        </div>
      </div>

      <div className={styles.right}>
        {/* Role Switcher */}
        <div className={styles.dropdown} ref={roleMenuRef}>
          <button
            className={styles.roleSwitcher}
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            id="role-switcher"
          >
            <span>{roleLabels[user.role].icon}</span>
            <span className={styles.roleLabel}>{roleLabels[user.role].label}</span>
            <span className={styles.chevron}>▾</span>
          </button>
          {showRoleMenu && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>Switch Role (Demo)</div>
              {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                <button
                  key={role}
                  className={`${styles.dropdownItem} ${user.role === role ? styles.activeRole : ''}`}
                  onClick={() => handleRoleSwitch(role)}
                >
                  <span>{roleLabels[role].icon}</span>
                  <span>{roleLabels[role].label}</span>
                  {user.role === role && <span className={styles.checkmark}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className={styles.iconBtn} id="notifications-btn" aria-label="Notifications">
          🔔
          <span className={styles.notifBadge}>3</span>
        </button>

        {/* User Menu */}
        <div className={styles.dropdown} ref={userMenuRef}>
          <button
            className={styles.userBtn}
            onClick={() => setShowUserMenu(!showUserMenu)}
            id="user-menu-btn"
          >
            <span className={styles.avatar}>{user.avatar}</span>
          </button>
          {showUserMenu && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownUserInfo}>
                <span className={styles.dropdownUserName}>{user.name}</span>
                <span className={styles.dropdownUserEmail}>{user.email}</span>
              </div>
              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItem}>
                <span>👤</span>
                <span>Profile</span>
              </button>
              <button className={styles.dropdownItem}>
                <span>⚙️</span>
                <span>Settings</span>
              </button>
              <div className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
