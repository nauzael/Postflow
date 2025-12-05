import React, { useState, useEffect, Suspense } from 'react';
import Layout from './components/Layout';
import AuthScreen from './components/AuthScreen';
import { 
  getCurrentUser, 
  logout, 
  seedData
} from './services/storageService';
import { User } from './types';
import { Loader2 } from 'lucide-react';

// Lazy Load Components for Performance (Code Splitting)
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const PostGenerator = React.lazy(() => import('./components/PostGenerator'));
const Analytics = React.lazy(() => import('./components/Analytics'));
const CalendarView = React.lazy(() => import('./components/CalendarView'));
const CompanySettings = React.lazy(() => import('./components/CompanySettings'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex h-full items-center justify-center p-12">
    <Loader2 className="animate-spin text-indigo-600" size={32} />
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Initialize theme from localStorage or system preference
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      seedData(currentUser.uid);
    }
  }, []);

  const handleLogin = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if(currentUser) seedData(currentUser.uid);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    // Suspense handles the loading state while the chunk is being downloaded
    return (
      <Suspense fallback={<PageLoader />}>
        {(() => {
          switch (activeTab) {
            case 'generator': return <PostGenerator />;
            case 'profile': return <CompanySettings />;
            case 'analytics': return <Analytics isDarkMode={darkMode} />;
            case 'calendar': return <CalendarView />;
            case 'dashboard':
            default: return <Dashboard />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={handleLogout}
      isDarkMode={darkMode}
      toggleTheme={toggleTheme}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;