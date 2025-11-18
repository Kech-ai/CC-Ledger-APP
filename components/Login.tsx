
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';

const Login: React.FC = () => {
    const { login, users } = useAppContext();
    const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
    const { t } = useTranslation();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if(selectedUserId) {
            login(selectedUserId);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cctech-gray">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="flex items-center justify-center mx-auto bg-cctech-primary w-16 h-16 rounded-2xl">
                        <span className="text-white text-3xl font-bold tracking-tighter">CC</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-cctech-dark">
                        {t('loginWelcome')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t('loginPrompt')}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
                           {t('loginSelectUser')}
                        </label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cctech-primary focus:border-cctech-primary sm:text-sm"
                        >
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cctech-primary hover:bg-cctech-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cctech-secondary"
                        >
                            {t('signIn')}
                        </button>
                    </div>
                </form>
                 <div className="mt-4 text-center text-xs text-gray-400">
                    <p>{t('sidebarMotto')}</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
