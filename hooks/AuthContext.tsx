
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';
// Fix: Replaced getStudentById with getStudents for fetching all students, simplifying the logic.
import { getStudents, getAdminUser, getStudentUser } from '../pages/services/mockApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('hms_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('hms_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, role: UserRole) => {
    setLoading(true);
    // Simulate API call to Firebase Auth
    await new Promise(res => setTimeout(res, 500));
    
    let loggedInUser: User | null = null;
    if (role === 'admin') {
      loggedInUser = getAdminUser();
    } else {
      const student = await getStudentByEmail(email);
      if (student) {
        loggedInUser = getStudentUser(student.id, student.email);
      }
    }
    
    if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('hms_user', JSON.stringify(loggedInUser));
    } else {
        throw new Error("User not found");
    }
    
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('hms_user');
  }, []);

  const getStudentByEmail = async (email: string) => {
      // In a real app, this would be a single API call `getStudentByEmail(email)`
      // Fix: Used getStudents() which returns a clean Student array, resolving the type error from getStudentById('all').
      const students = await getStudents(); // fetching all to find one by email
      return students.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
