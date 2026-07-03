import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export default function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  return (
    <motion.span 
      className={`badge badge-${variant} ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      style={{
        border: '1px solid currentColor',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {children}
    </motion.span>
  );
}
