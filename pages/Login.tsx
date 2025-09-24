
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, role);
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">Hostel Management System</h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Welcome back! Please sign in.</p>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="role">
              I am a
            </label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 px-4 py-2 rounded-l-md transition ${role === 'student' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 px-4 py-2 rounded-r-md transition ${role === 'admin' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                Admin
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'admin' ? 'admin@hms.com' : 'student@example.com'}
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
             <p className="text-xs text-slate-500 mt-2">Hint: Any password will work for this demo.</p>
             {role === 'student' && <p className="text-xs text-slate-500 mt-1">Student emails: alice@example.com, bob@example.com</p>}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
