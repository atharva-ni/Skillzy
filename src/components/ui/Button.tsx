import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  
  return (
    <motion.button
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
