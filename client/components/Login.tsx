
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';

const Login: React.FC = () => {
    const { login } = useAppContext();
    const [email, setEmail] = useState<string>('admin@cctech.com');
    const [password, setPassword] = useState<string>('123456');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { t } = useTranslation();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login({ email, password });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
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
                        Sign in to your account
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                           {t('email')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cctech-primary focus:border-cctech-primary sm:text-sm"
                        />
                    </div>
                     <div>
                        {/* FIX: Corrected typo `cclassName` to `className` */}
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                           Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cctech-primary focus:border-cctech-primary sm:text-sm"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cctech-primary hover:bg-cctech-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cctech-secondary disabled:bg-gray-400"
                        >
                            {isLoading ? 'Signing In...' : t('signIn')}
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