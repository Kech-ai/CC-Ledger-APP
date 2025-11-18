
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';

const NavItem: React.FC<{ icon: React.ReactElement; label: string; href: string; active?: boolean }> = ({ icon, label, href, active }) => (
  <a
    href={href}
    className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 ${
      active ? 'bg-cctech-primary text-white shadow-md' : 'text-gray-600 hover:bg-cctech-light hover:text-cctech-primary'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </a>
);

const Sidebar: React.FC = () => {
  const { currentUser } = useAppContext();
  const [activeRoute, setActiveRoute] = useState(window.location.hash || '#/');
  const { t } = useTranslation();

  useEffect(() => {
    const handleHashChange = () => {
      setActiveRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-white border-r border-gray-200 p-4 md:flex">
      <div className="flex items-center justify-center h-16">
        <h2 className="text-2xl font-bold text-cctech-primary">{t('appName')}</h2>
      </div>
      <nav className="mt-8 flex-1 space-y-2">
        <NavItem 
            icon={<Icon icon="dashboard" />} 
            label={t('dashboard')} 
            href="#/"
            active={activeRoute === '#/'}
        />
        {['Accountant', 'Finance Manager', 'Super Admin'].includes(currentUser?.role || '') &&
            <NavItem 
                icon={<Icon icon="add_entry" />} 
                label={t('newJournalEntry')} 
                href="#/new-entry"
                active={activeRoute === '#/new-entry'}
            />
        }
        <NavItem 
            icon={<Icon icon="journal" />} 
            label={t('journal')} 
            href="#/journal"
            active={activeRoute === '#/journal'}
        />
        {['Finance Manager', 'Super Admin', 'Auditor'].includes(currentUser?.role || '') &&
            <NavItem 
                icon={<Icon icon="reports" />} 
                label={t('reports')} 
                href="#/reports"
                active={activeRoute === '#/reports'}
            />
        }
        {currentUser?.role === 'Super Admin' &&
            <NavItem 
                icon={<Icon icon="settings" />} 
                label={t('settings')} 
                href="#/settings"
                active={activeRoute === '#/settings'}
            />
        }
      </nav>
      <div className="mt-auto text-center text-xs text-gray-400">
        <p>{t('sidebarMotto')}</p>
        <p>&copy; {new Date().getFullYear()} CC Tech</p>
      </div>
    </aside>
  );
};

const Icon: React.FC<{ icon: string }> = ({ icon }) => {
    const icons: { [key: string]: React.ReactElement } = {
        dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        add_entry: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
        journal: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zM3 7l9-4 9 4M5 7l7 4 7-4" />,
        reports: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
        settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icons[icon]}
        </svg>
    );
};


export default Sidebar;
