
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { SUPPORTED_CURRENCIES } from '../utils/currency';
import { useTranslation } from '../i18n/useTranslation';

const CCTechLogo: React.FC = () => (
  <div className="flex items-center justify-center bg-cctech-primary w-12 h-12 rounded-lg">
    <span className="text-white text-2xl font-bold tracking-tighter">CC</span>
  </div>
);

const Header: React.FC = () => {
  const { currentUser, logout, currency, setCurrency, locale, setLocale } = useAppContext();
  const { t } = useTranslation();
  
  const getInitials = (name: string = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
      <div className="flex items-center space-x-3">
        <CCTechLogo />
        <h1 className="text-xl font-semibold text-cctech-dark">{t('headerTitle')}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div>
            <label htmlFor="currency-select" className="sr-only">Currency</label>
            <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm"
            >
                {SUPPORTED_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                ))}
            </select>
        </div>
        <div>
            <label htmlFor="locale-select" className="sr-only">{t('language')}</label>
            <select
                id="locale-select"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm"
            >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
            </select>
        </div>
        <div className="w-10 h-10 bg-cctech-light rounded-full flex items-center justify-center text-cctech-primary font-bold">
          {getInitials(currentUser?.name)}
        </div>
        <div className="hidden md:block">
            <p className="font-semibold text-cctech-dark">{currentUser?.name}</p>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
        </div>
        <button onClick={logout} className="p-2 rounded-md hover:bg-gray-100 transition-colors" title={t('logout')}>
            <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
