import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import NewJournalEntry from './components/NewJournalEntry';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import { useAppContext } from './context/AppContext';

const App: React.FC = () => {
  const { currentUser } = useAppContext();
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (route) {
      case '#/new-entry':
        return <NewJournalEntry />;
      case '#/journal':
        return <Journal />;
      case '#/reports':
        return <Reports />;
      case '#/settings':
        // Protected route
        if (currentUser.role === 'Super Admin') {
          return <Settings />;
        }
        window.location.hash = '#/'; // Redirect if not authorized
        return <Dashboard />;
      case '#/':
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

export default App;
