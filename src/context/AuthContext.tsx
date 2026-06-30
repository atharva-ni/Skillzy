'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, mockUsers, Payment, mockPayments } from '@/data/mock';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  enrolledCourseIds: string[];
  enrollInCourse: (courseId: string) => void;
  payments: Payment[];
  addPayment: (payment: Payment) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  setRole: () => {},
  enrolledCourseIds: [],
  enrollInCourse: () => {},
  payments: [],
  addPayment: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(['course-1', 'course-2']);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  const login = useCallback((role: UserRole) => {
    setUser(mockUsers[role]);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setUser(mockUsers[role]);
  }, []);

  const enrollInCourse = useCallback((courseId: string) => {
    setEnrolledCourseIds((prev) => {
      if (prev.includes(courseId)) return prev;
      return [...prev, courseId];
    });
  }, []);

  const addPayment = useCallback((payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      setRole,
      enrolledCourseIds,
      enrollInCourse,
      payments,
      addPayment
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
