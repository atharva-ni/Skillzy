'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/data/mock';
import styles from './Header.module.css';
import { UserButton } from '@clerk/nextjs';
import { Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const roleLabels: Record<UserRole | 'super_admin', { label: string; icon: string }> = {
  student: { label: 'Student', icon: '🎓' },
  instructor: { label: 'Instructor', icon: '👩‍🏫' },
  recruiter: { label: 'Recruiter', icon: '🏢' },
  admin: { label: 'Admin', icon: '⚙️' },
  super_admin: { label: 'Super Admin', icon: '👑' },
};

export default function Header() {
  const { user } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  if (!user) return null;

  const userRole = user.role as UserRole | 'super_admin';
  const roleInfo = roleLabels[userRole] || { label: 'Student', icon: '🎓' };

  return (
    <motion.header 
      className={styles.header}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
      }}
    >
      <div className={styles.left}>
        <motion.div 
          className={styles.searchWrapper}
          animate={{ width: isSearchFocused ? '100%' : '85%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <span className={styles.searchIcon} style={{ top: '53%' }}>
            <Search size={14} className="text-muted" style={{ opacity: 0.7 }} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search courses, coding labs, jobs..."
            id="global-search"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              borderRadius: 'var(--radius-md)',
              background: isSearchFocused ? '#ffffff' : '#f4f4f5',
              borderColor: isSearchFocused ? '#171717' : '#e5e5e5',
              boxShadow: isSearchFocused ? '0 0 0 2px rgba(0, 0, 0, 0.08)' : 'none',
              paddingLeft: '2.5rem',
            }}
          />
        </motion.div>
      </div>

      <div className={styles.right}>
        {/* Role Display */}
        <motion.div 
          className={styles.roleSwitcher} 
          style={{ cursor: 'default', borderRadius: 'var(--radius-md)', background: '#f4f4f5', border: '1px solid #e5e5e5' }}
          whileHover={{ scale: 1.02, background: '#ebebeb' }}
        >
          <span>{roleInfo.icon}</span>
          <span className={styles.roleLabel}>{roleInfo.label}</span>
        </motion.div>

        {/* Notifications */}
        <motion.button 
          className={styles.iconBtn} 
          id="notifications-btn" 
          aria-label="Notifications"
          whileHover={{ scale: 1.05, background: '#f4f4f5' }}
          whileTap={{ scale: 0.95 }}
          style={{ borderRadius: 'var(--radius-md)', background: 'transparent', position: 'relative' }}
        >
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
          <motion.span 
            className={styles.notifBadge}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            style={{
              top: '-3px',
              right: '-3px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              fontSize: '0.6rem',
              background: '#ef4444',
              boxShadow: 'none'
            }}
          >
            1
          </motion.span>
        </motion.button>

        {/* Clerk User Button */}
        <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: {
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #e5e5e5',
                  boxShadow: 'none'
                },
              },
            }}
          />
        </div>
      </div>
    </motion.header>
  );
}
