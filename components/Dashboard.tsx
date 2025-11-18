
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { CHART_OF_ACCOUNTS } from '../constants';
import { JournalEntry } from '../types';
import { formatCurrency } from '../utils/currency';
import { useTranslation } from '../i18n/useTranslation';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-cctech-dark">{value}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ data: { name: string; value: number }[], currency: string }> = ({ data, currency }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    const colors = ['bg-cctech-primary', 'bg-cctech-secondary', 'bg-blue-300', 'bg-sky-200', 'bg-cyan-200'];

    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={item.name} className="flex items-center">
                    <div className="w-32 text-sm text-gray-600 truncate">{item.name}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6">
                         <div
                            className={`h-6 rounded-full ${colors[index % colors.length]} flex items-center justify-end pr-2`}
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        >
                           <span className="text-white text-xs font-bold">{formatCurrency(item.value, currency)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const RecentTransactions: React.FC = () => {
    const { journalEntries, currency } = useAppContext();
    const recent = journalEntries.slice(0, 5);

    const statusColors: { [key in JournalEntry['status']]: string } = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };

    return (
        <div>
            {recent.map(entry => (
                <div key={entry.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div>
                        <p className="font-medium text-gray-800">{entry.description}</p>
                        <p className="text-sm text-gray-500">{entry.date}</p>
                    </div>
                    <div className="text-right">
                         <p className="font-mono font-semibold text-cctech-dark">{formatCurrency(entry.amount, currency)}</p>
                         <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[entry.status]}`}>{entry.status}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};


const Dashboard: React.FC = () => {
    const { currentUser, journalEntries, currency } = useAppContext();
    const { t } = useTranslation();

    const pendingCount = journalEntries.filter(j => j.status === 'Pending').length;
    const totalApprovedAmount = journalEntries.filter(j => j.status === 'Approved').reduce((acc, j) => acc + j.amount, 0);
    const rejectedCount = journalEntries.filter(j => j.status === 'Rejected').length;

    const expenseByCategory = useMemo(() => {
        const approvedEntries = journalEntries.filter(e => e.status === 'Approved');
        const expenseAccounts = CHART_OF_ACCOUNTS.filter(a => a.type === 'Expense').map(a => a.code);
        
        const expenseData = new Map<string, number>();

        approvedEntries.forEach(entry => {
            if (expenseAccounts.includes(entry.debitAccount)) {
                const currentTotal = expenseData.get(entry.debitAccount) || 0;
                expenseData.set(entry.debitAccount, currentTotal + entry.amount);
            }
        });

        return Array.from(expenseData.entries())
            .map(([code, value]) => ({
                name: t(`account_${code}` as any) || 'Unknown',
                value
            }))
            .sort((a,b) => b.value - a.value)
            .slice(0, 5); // top 5

    }, [journalEntries, t]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-cctech-dark mb-2">{t('dashboardWelcome', { name: currentUser?.name || '' })}</h1>
            <p className="text-gray-600 mb-8">{t('dashboardSummary')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title={t('pendingEntries')}
                    value={pendingCount}
                    color="bg-yellow-100 text-yellow-600"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                 <StatCard 
                    title={t('approvedVolume')}
                    value={formatCurrency(totalApprovedAmount, currency)}
                    color="bg-green-100 text-green-600"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                 <StatCard 
                    title={t('rejectedEntries')}
                    value={rejectedCount}
                    color="bg-red-100 text-red-600"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-cctech-dark mb-4">{t('topExpenses')}</h2>
                    {expenseByCategory.length > 0 ? <BarChart data={expenseByCategory} currency={currency} /> : <p className="text-gray-500 text-center py-8">{t('noExpenseData')}</p>}
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                     <h2 className="text-xl font-bold text-cctech-dark mb-4">{t('recentTransactions')}</h2>
                     <RecentTransactions />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
