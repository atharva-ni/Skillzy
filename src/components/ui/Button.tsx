import React from 'react';

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
    <button
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
