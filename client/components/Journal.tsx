import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { JournalEntry } from '../types';
import { formatCurrency } from '../utils/currency';
import { useTranslation } from '../i18n/useTranslation';

const statusColors: { [key in JournalEntry['status']]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const JournalDetailModal: React.FC<{ entry: JournalEntry; onClose: () => void }> = ({ entry, onClose }) => {
    const { currency } = useAppContext();
    const { t } = useTranslation();
    const findAccountName = (code: string) => t(`account_${code}` as any) || 'Unknown';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-cctech-dark mb-4">{t('transactionDetailsModalTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>

                {entry.isPotentialDuplicate && (
                     <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-sm">
                        <p className="font-bold flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {t('potentialDuplicate')}
                        </p>
                        <p className="pl-7 mt-1"><strong>{t('reason')}:</strong> {entry.duplicateReason}</p>
                    </div>
                )}
               
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-cctech-dark mb-2">{t('details')}</h3>
                        <p><strong>{t('description')}:</strong> {entry.description}</p>
                        <p><strong>{t('date')}:</strong> {new Date(entry.date).toLocaleDateString()}</p>
                        <p><strong>{t('amount')}:</strong> <span className="font-mono">{formatCurrency(entry.amount, currency)}</span></p>
                        <p><strong>{t('status')}:</strong> <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[entry.status]}`}>{t(entry.status.toLowerCase() as any)}</span></p>
                        <p><strong>{t('createdBy')}:</strong> {entry.createdBy.name}</p>

                        <h3 className="font-semibold text-cctech-dark mt-4 mb-2">{t('accounts')}</h3>
                        <p><strong>{t('debit')}:</strong> {findAccountName(entry.debitAccount)} ({entry.debitAccount})</p>
                        <p><strong>{t('credit')}:</strong> {findAccountName(entry.creditAccount)} ({entry.creditAccount})</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-cctech-dark mb-2">{t('receipt')}</h3>
                        {entry.receiptUrl ? (
                             <img src={entry.receiptUrl} alt="Receipt" className="rounded-lg border max-h-80 w-auto" />
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg h-full flex items-center justify-center">
                                <p className="text-gray-500">{t('noReceipt')}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-right mt-6">
                    <button onClick={onClose} className="bg-cctech-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-cctech-dark transition-colors">{t('close')}</button>
                </div>
            </div>
        </div>
    );
};

const Journal: React.FC = () => {
    const { journalEntries, currentUser, updateJournalEntryStatus, currency } = useAppContext();
    const { t } = useTranslation();
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    const findAccountName = (code: string) => t(`account_${code}` as any) || 'Unknown';

    const filteredEntries = useMemo(() => {
        return journalEntries
            .filter(entry => filterStatus === 'All' || entry.status === filterStatus)
            .filter(entry => entry.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [journalEntries, filterStatus, searchTerm]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-cctech-dark">{t('journalEntries')}</h1>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder={t('searchDescription')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full md:w-48 rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="block w-full md:w-40 rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm"
                    >
                        <option value="All">{t('all')}</option>
                        <option value="Pending">{t('pending')}</option>
                        <option value="Approved">{t('approved')}</option>
                        <option value="Rejected">{t('rejected')}</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('date')}</th>
                            <th scope="col" className="px-6 py-3">{t('description')}</th>
                            <th scope="col" className="px-6 py-3">{t('debit')}</th>
                            <th scope="col" className="px-6 py-3">{t('credit')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('amount')}</th>
                            <th scope="col" className="px-6 py-3 text-center">{t('status')}</th>
                            {currentUser?.role === 'Finance Manager' && <th scope="col" className="px-6 py-3 text-center">{t('actions')}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEntries.map(entry => (
                            <tr key={entry._id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                                <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center">
                                        {entry.description}
                                        {entry.isPotentialDuplicate && 
                                            <div className="ml-2 group relative">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <div className="absolute bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                   <strong>{t('potentialDuplicate')}:</strong> {entry.duplicateReason}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </td>
                                <td className="px-6 py-4">{findAccountName(entry.debitAccount)}</td>
                                <td className="px-6 py-4">{findAccountName(entry.creditAccount)}</td>
                                <td className="px-6 py-4 text-right font-mono">{formatCurrency(entry.amount, currency)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[entry.status]}`}>
                                        {t(entry.status.toLowerCase() as any)}
                                    </span>
                                </td>
                                {currentUser?.role === 'Finance Manager' && (
                                    <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                                        {entry.status === 'Pending' ? (
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => updateJournalEntryStatus(entry._id, 'Approved')} className="text-green-600 hover:text-green-900 font-medium">{t('approve')}</button>
                                                <button onClick={() => updateJournalEntryStatus(entry._id, 'Rejected')} className="text-red-600 hover:text-red-900 font-medium">{t('reject')}</button>
                                            </div>
                                        ) : '-'}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredEntries.length === 0 && <p className="text-center text-gray-500 py-8">{t('noMatchingEntries')}</p>}
            {selectedEntry && <JournalDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
        </div>
    );
};

export default Journal;