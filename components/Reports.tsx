
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CHART_OF_ACCOUNTS } from '../constants';
import { summarizeReport } from '../services/geminiService';
import { formatCurrency } from '../utils/currency';
import { useTranslation } from '../i18n/useTranslation';

type ReportTab = 'TrialBalance' | 'IncomeStatement' | 'BalanceSheet';

const TrialBalance: React.FC = () => {
    const { journalEntries, currency } = useAppContext();
    const { t } = useTranslation();
    const data = useMemo(() => {
        // Calculation logic remains the same
        const approvedEntries = journalEntries.filter(e => e.status === 'Approved');
        const accountBalances = new Map<string, {debit: number, credit: number}>();

        CHART_OF_ACCOUNTS.forEach(acc => {
            accountBalances.set(acc.code, { debit: 0, credit: 0});
        });

        approvedEntries.forEach(entry => {
            const debitAcc = accountBalances.get(entry.debitAccount);
            if(debitAcc) debitAcc.debit += entry.amount;

            const creditAcc = accountBalances.get(entry.creditAccount);
            if(creditAcc) creditAcc.credit += entry.amount;
        });

        const tableData: { accountCode: string; accountName: string; debit: number; credit: number; }[] = [];
        let totalDebit = 0;
        let totalCredit = 0;

        accountBalances.forEach((balance, code) => {
            if(balance.debit > 0 || balance.credit > 0) {
                 tableData.push({
                    accountCode: code,
                    accountName: t(`account_${code}` as any) || 'Unknown',
                    debit: balance.debit,
                    credit: balance.credit,
                });
                totalDebit += balance.debit;
                totalCredit += balance.credit;
            }
        });

        return { tableData, totalDebit, totalCredit };
    }, [journalEntries, t]);

    return <ReportLayout title={t('trialBalance')} reportKey="TrialBalance" reportData={data}>
        <table className="w-full text-sm text-left text-gray-500">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">{t('account')}</th>
                    <th scope="col" className="px-6 py-3 text-right">{t('debit')}</th>
                    <th scope="col" className="px-6 py-3 text-right">{t('credit')}</th>
                </tr>
            </thead>
            <tbody>
                {data.tableData.map(line => (
                    <tr key={line.accountCode} className="bg-white border-b">
                        <td className="px-6 py-4 font-medium text-gray-900">{line.accountCode} - {line.accountName}</td>
                        <td className="px-6 py-4 text-right font-mono">{line.debit > 0 ? formatCurrency(line.debit, currency) : '-'}</td>
                        <td className="px-6 py-4 text-right font-mono">{line.credit > 0 ? formatCurrency(line.credit, currency) : '-'}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr className="font-semibold text-gray-900 bg-gray-50">
                    <th scope="row" className="px-6 py-3 text-base">{t('totals')}</th>
                    <td className={`px-6 py-3 text-right font-mono ${data.totalDebit !== data.totalCredit ? 'text-red-500' : ''}`}>{formatCurrency(data.totalDebit, currency)}</td>
                    <td className={`px-6 py-3 text-right font-mono ${data.totalDebit !== data.totalCredit ? 'text-red-500' : ''}`}>{formatCurrency(data.totalCredit, currency)}</td>
                </tr>
            </tfoot>
        </table>
        {data.totalDebit !== data.totalCredit && (
            <p className="mt-4 text-center text-red-600 font-bold">{t('warningBalance')}</p>
        )}
    </ReportLayout>
};

const IncomeStatement: React.FC = () => {
    const { journalEntries, currency } = useAppContext();
    const { t } = useTranslation();
    const data = useMemo(() => {
        const approvedEntries = journalEntries.filter(e => e.status === 'Approved');
        let totalRevenue = 0;
        let totalExpenses = 0;
        const revenues: { name: string, amount: number }[] = [];
        const expenses: { name: string, amount: number }[] = [];

        CHART_OF_ACCOUNTS.forEach(account => {
            let balance = 0;
            approvedEntries.forEach(entry => {
                if(entry.creditAccount === account.code) balance += entry.amount;
                if(entry.debitAccount === account.code) balance -= entry.amount;
            });

            if (account.type === 'Income' && balance !== 0) {
                const amount = -balance; // Income is credit-positive
                revenues.push({ name: t(`account_${account.code}` as any), amount });
                totalRevenue += amount;
            }
            if (account.type === 'Expense' && balance !== 0) {
                const amount = balance; // Expense is debit-positive
                expenses.push({ name: t(`account_${account.code}` as any), amount });
                totalExpenses += amount;
            }
        });
        const netIncome = totalRevenue - totalExpenses;
        return { revenues, expenses, totalRevenue, totalExpenses, netIncome };
    }, [journalEntries, t]);

    return <ReportLayout title={t('incomeStatement')} reportKey="IncomeStatement" reportData={data}>
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-cctech-dark px-6 py-3 bg-gray-50 border-b">{t('revenue')}</h3>
                {data.revenues.map(rev => <div key={rev.name} className="flex justify-between px-6 py-3 border-b"><span className="font-medium text-gray-800">{rev.name}</span> <span className="font-mono">{formatCurrency(rev.amount, currency)}</span></div>)}
                <div className="flex justify-between px-6 py-3 bg-gray-50 font-bold text-gray-900 border-b"><span >{t('totalRevenue')}</span> <span className="font-mono">{formatCurrency(data.totalRevenue, currency)}</span></div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-cctech-dark px-6 py-3 bg-gray-50 border-b">{t('expenses')}</h3>
                {data.expenses.map(exp => <div key={exp.name} className="flex justify-between px-6 py-3 border-b"><span>{exp.name}</span> <span className="font-mono">{formatCurrency(exp.amount, currency)}</span></div>)}
                <div className="flex justify-between px-6 py-3 bg-gray-50 font-bold text-gray-900 border-b"><span>{t('totalExpenses')}</span> <span className="font-mono">{formatCurrency(data.totalExpenses, currency)}</span></div>
            </div>
            <div className={`flex justify-between px-6 py-4 text-lg font-bold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>{t('netIncome')}</span>
                <span className="font-mono">{formatCurrency(data.netIncome, currency)}</span>
            </div>
        </div>
    </ReportLayout>;
};

const BalanceSheet: React.FC = () => {
    const { journalEntries, currency } = useAppContext();
    const { t } = useTranslation();
    // This is a simplified calculation
    const data = useMemo(() => {
        const approvedEntries = journalEntries.filter(e => e.status === 'Approved');
        const assets: { name: string, amount: number }[] = [];
        let totalAssets = 0;
        const liabilities: { name: string, amount: number }[] = [];
        let totalLiabilities = 0;
        const equity: { name: string, amount: number }[] = [];
        let totalEquity = 0;

        CHART_OF_ACCOUNTS.forEach(account => {
            let balance = 0;
            approvedEntries.forEach(entry => {
                if(entry.debitAccount === account.code) balance += entry.amount;
                if(entry.creditAccount === account.code) balance -= entry.amount;
            });
            
             if (account.type === 'Asset' && balance !== 0) {
                assets.push({ name: t(`account_${account.code}` as any), amount: balance });
                totalAssets += balance;
            } else if (account.type === 'Liability' && balance !== 0) {
                liabilities.push({ name: t(`account_${account.code}` as any), amount: -balance });
                totalLiabilities -= balance;
            } else if (account.type === 'Equity' && balance !== 0) {
                equity.push({ name: t(`account_${account.code}` as any), amount: -balance });
                totalEquity -= balance;
            }
        });
        
        return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity, totalLiabilitiesAndEquity: totalLiabilities + totalEquity };
    }, [journalEntries, t]);

     return <ReportLayout title={t('balanceSheet')} reportKey="BalanceSheet" reportData={data}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                 <h3 className="text-lg font-semibold text-cctech-dark px-6 py-3 bg-gray-50 border-b">{t('assets')}</h3>
                 {data.assets.map(item => <div key={item.name} className="flex justify-between px-6 py-3 border-b"><span>{item.name}</span> <span className="font-mono">{formatCurrency(item.amount, currency)}</span></div>)}
                 <div className="flex justify-between px-6 py-3 bg-gray-50 font-bold text-gray-900 border-b"><span>{t('totalAssets')}</span> <span className="font-mono">{formatCurrency(data.totalAssets, currency)}</span></div>
            </div>
            <div className="space-y-6">
                <div>
                     <h3 className="text-lg font-semibold text-cctech-dark px-6 py-3 bg-gray-50 border-b">{t('liabilities')}</h3>
                     {data.liabilities.map(item => <div key={item.name} className="flex justify-between px-6 py-3 border-b"><span>{item.name}</span> <span className="font-mono">{formatCurrency(item.amount, currency)}</span></div>)}
                     <div className="flex justify-between px-6 py-3 bg-gray-50 font-bold text-gray-900 border-b"><span>{t('totalLiabilities')}</span> <span className="font-mono">{formatCurrency(data.totalLiabilities, currency)}</span></div>
                </div>
                 <div>
                     <h3 className="text-lg font-semibold text-cctech-dark px-6 py-3 bg-gray-50 border-b">{t('equity')}</h3>
                     {data.equity.map(item => <div key={item.name} className="flex justify-between px-6 py-3 border-b"><span>{item.name}</span> <span className="font-mono">{formatCurrency(item.amount, currency)}</span></div>)}
                     <div className="flex justify-between px-6 py-3 bg-gray-50 font-bold text-gray-900 border-b"><span>{t('totalEquity')}</span> <span className="font-mono">{formatCurrency(data.totalEquity, currency)}</span></div>
                </div>
                 <div className={`flex justify-between px-6 py-3 font-bold text-gray-900 border-t-2 ${Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) > 0.01 ? 'bg-red-100' : 'bg-green-100'}`}>
                    <span>{t('totalLiabilitiesAndEquity')}</span> <span className="font-mono">{formatCurrency(data.totalLiabilitiesAndEquity, currency)}</span>
                </div>
            </div>
        </div>
    </ReportLayout>;
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderInline = (text: string) => {
        // Using regex to replace markdown with HTML tags.
        // This is safe as we control the replacement and the source is the AI.
        const html = text
            .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>') // Bold
            .replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>'); // Italic
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1">
                    {currentList}
                </ul>
            );
            currentList = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.startsWith('* ') || line.startsWith('- ')) {
            const listItemContent = line.substring(2);
            currentList.push(<li key={`li-${index}`}>{renderInline(listItemContent)}</li>);
        } else {
            flushList();
            if (line.trim()) {
                elements.push(<p key={`p-${index}`}>{renderInline(line)}</p>);
            }
        }
    });

    flushList(); // Flush any remaining list items

    return <>{elements}</>;
};


const ReportLayout: React.FC<{title: string, reportKey: string, reportData: any, children: React.ReactNode}> = ({title, reportKey, reportData, children}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const { t } = useTranslation();

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAiSummary('');
        const summary = await summarizeReport(title, reportData);
        setAiSummary(summary);
        setIsLoading(false);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-cctech-dark mb-1">{title}</h2>
                    <p className="text-gray-600">{t('asOf', { date: new Date().toLocaleDateString() })}</p>
                </div>
                <button onClick={handleAnalyze} disabled={isLoading} className="bg-cctech-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center disabled:bg-gray-400">
                    {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> {t('analyzing')}...</> : t('analyzeWithAI')}
                </button>
            </div>
            {aiSummary && (
                <div className="bg-cctech-light border-l-4 border-cctech-secondary text-cctech-dark p-4 mb-6 rounded-r-lg" role="alert" aria-live="polite">
                    <p className="font-bold">{t('aiSummaryTitle')}</p>
                    <div className="mt-2 text-sm space-y-2">
                        <MarkdownRenderer content={aiSummary} />
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">{children}</div>
        </div>
    )
}

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReportTab>('TrialBalance');
    const { t } = useTranslation();

    const renderReport = () => {
        switch(activeTab) {
            case 'IncomeStatement': return <IncomeStatement />;
            case 'BalanceSheet': return <BalanceSheet />;
            case 'TrialBalance':
            default: return <TrialBalance />;
        }
    }
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('TrialBalance')} className={`${activeTab === 'TrialBalance' ? 'border-cctech-primary text-cctech-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('trialBalance')}</button>
                    <button onClick={() => setActiveTab('IncomeStatement')} className={`${activeTab === 'IncomeStatement' ? 'border-cctech-primary text-cctech-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('incomeStatement')}</button>
                    <button onClick={() => setActiveTab('BalanceSheet')} className={`${activeTab === 'BalanceSheet' ? 'border-cctech-primary text-cctech-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('balanceSheet')}</button>
                </nav>
            </div>
            {renderReport()}
        </div>
    );
};

export default Reports;
