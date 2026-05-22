import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Repos from './pages/Repos';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Protected route wrapper layout
const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 stroke-[2.5]" size={36} />
        <p className="mt-4 text-sm font-semibold text-slate-550 dark:text-slate-400">
          Loading user session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-250">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Public route wrapper that redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            
            {/* Public Landing Route */}
            <Route path="/" element={<Landing />} />

            {/* Public Auth Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />

            {/* Protected Application Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/repos" element={<Repos />} />
              <Route path="/insights" element={<AIInsights />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
