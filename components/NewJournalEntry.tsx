
import React, { useState, useCallback, useEffect } from 'react';
import { extractReceiptData, suggestAccount } from '../services/geminiService';
import { OcrResult, Account } from '../types';
import { CHART_OF_ACCOUNTS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';
import { useTranslation } from '../i18n/useTranslation';

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const NewJournalEntry: React.FC = () => {
    const { addJournalEntry, currency } = useAppContext();
    const { t } = useTranslation();

    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [debitAccount, setDebitAccount] = useState<string>('');
    const [creditAccount, setCreditAccount] = useState<string>('1010'); // Default to Petty Cash
    const [isLoadingOcr, setIsLoadingOcr] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
    const [suggestedAccount, setSuggestedAccount] = useState<Account | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const debouncedDescription = useDebounce(description, 500);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReceiptFile(file);
            setReceiptPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleScanReceipt = useCallback(async () => {
        if (!receiptFile) return;
        setIsLoadingOcr(true);
        setError(null);
        try {
            const result: OcrResult = await extractReceiptData(receiptFile);
            setDate(result.transactionDate || new Date().toISOString().split('T')[0]);
            setDescription(result.vendorName || '');
            setAmount(result.totalAmount?.toString() || '');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingOcr(false);
        }
    }, [receiptFile]);
    
    useEffect(() => {
        const fetchSuggestion = async () => {
            if (debouncedDescription) {
                setIsSuggesting(true);
                const suggestion = await suggestAccount(debouncedDescription);
                setSuggestedAccount(suggestion);
                setIsSuggesting(false);
            } else {
                setSuggestedAccount(null);
            }
        };
        fetchSuggestion();
    }, [debouncedDescription]);

    const handleSuggestionClick = (account: Account) => {
        setDebitAccount(account.code);
        setSuggestedAccount(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!isFormValid) return;

        setIsSubmitting(true);
        
        const newEntry = {
            date,
            description,
            amount: parseFloat(amount),
            debitAccount,
            creditAccount,
            receiptUrl: receiptPreview
        };

        try {
            await addJournalEntry(newEntry);
            alert('Journal entry submitted for approval!');
            window.location.hash = '#/journal';
        } catch (error) {
            console.error("Failed to submit journal entry:", error);
            alert("There was an error submitting the entry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = description && amount && debitAccount && creditAccount && parseFloat(amount) > 0;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-cctech-dark mb-6">{t('createEntryTitle')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side: Receipt Upload */}
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-cctech-dark mb-4">{t('attachReceipt')}</h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input type="file" id="receipt-upload" className="hidden" accept="image/jpeg, image/png" onChange={handleFileChange} />
                        <label htmlFor="receipt-upload" className="cursor-pointer">
                            {receiptPreview ? (
                                <img src={receiptPreview} alt="Receipt Preview" className="mx-auto max-h-48 rounded-md" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                   <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <p className="font-medium">{t('uploadReceipt')}</p>
                                    <p className="text-sm">{t('uploadHint')}</p>
                                </div>
                            )}
                        </label>
                    </div>
                    {receiptFile && (
                        <button 
                            onClick={handleScanReceipt} 
                            disabled={isLoadingOcr}
                            className="mt-4 w-full bg-cctech-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center disabled:bg-gray-400">
                            {isLoadingOcr ? <Spinner /> : t('scanWithAI')}
                        </button>
                    )}
                     {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                {/* Right Side: Entry Form */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-cctech-dark mb-4">{t('transactionDetails')}</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">{t('date')}</label>
                                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">{t('amount')}</label>
                                <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('description')}</label>
                            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('descriptionPlaceholder')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm" />
                        </div>
                        
                        <div className="border-t pt-4">
                             <h3 className="text-lg font-medium text-gray-800 mb-2">{t('doubleEntry')}</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                <div className="relative">
                                    <label htmlFor="debitAccount" className="block text-sm font-medium text-gray-700">{t('debitAccount')}</label>
                                    <select id="debitAccount" value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm">
                                        <option value="">{t('selectAccount')}</option>
                                        {CHART_OF_ACCOUNTS.filter(a => a.type === 'Expense' || a.type === 'Asset').map(acc => <option key={acc.code} value={acc.code}>{acc.code} - {t(`account_${acc.code}` as any)}</option>)}
                                    </select>
                                    {isSuggesting && <div className="absolute right-2 top-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cctech-primary"></div></div>}
                                    {suggestedAccount && (
                                        <div className="mt-2 p-2 bg-cctech-light border border-cctech-secondary rounded-md text-sm">
                                            <span className="font-semibold">{t('aiSuggestion')}</span>
                                            <button type="button" onClick={() => handleSuggestionClick(suggestedAccount)} className="ml-2 text-cctech-primary font-bold hover:underline">
                                                {suggestedAccount.code} - {t(`account_${suggestedAccount.code}` as any)}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="creditAccount" className="block text-sm font-medium text-gray-700">{t('creditAccount')}</label>
                                    <select id="creditAccount" value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm">
                                        <option value="">{t('selectAccount')}</option>
                                        {CHART_OF_ACCOUNTS.filter(a => a.type === 'Asset' || a.type === 'Liability').map(acc => <option key={acc.code} value={acc.code}>{acc.code} - {t(`account_${acc.code}` as any)}</option>)}
                                    </select>
                                </div>
                             </div>
                             <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center font-mono text-gray-700">
                                 {t('debit')}: {debitAccount ? `${formatCurrency(parseFloat(amount) || 0, currency)}` : '...'} | {t('credit')}: {creditAccount ? `${formatCurrency(parseFloat(amount) || 0, currency)}`: '...'}
                             </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={!isFormValid || isSubmitting} className="bg-cctech-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-cctech-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center w-48">
                                {isSubmitting ? <Spinner/> : t('submitForApproval')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewJournalEntry;
