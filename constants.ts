import { Account, User, JournalEntry } from './types';

// A simplified mock of the Ethiopian Chart of Accounts
export const CHART_OF_ACCOUNTS: Account[] = [
  { code: '1010', name: 'Petty Cash', type: 'Asset' },
  { code: '1020', name: 'Cash in Bank', type: 'Asset' },
  { code: '1200', name: 'Accounts Receivable', type: 'Asset' },
  { code: '2010', name: 'Accounts Payable', type: 'Liability' },
  { code: '3000', name: 'Owner\'s Equity', type: 'Equity' },
  { code: '4000', name: 'Sales Revenue', type: 'Income' },
  { code: '5005', name: 'Office Supplies', type: 'Expense' },
  { code: '5010', name: 'Rent Expense', type: 'Expense' },
  { code: '5015', name: 'Ground Transport', type: 'Expense' },
  { code: '5020', name: 'Air Travel', type: 'Expense' },
  { code: '5030', name: 'Utilities', type: 'Expense' },
  { code: '5040', name: 'Marketing Expense', type: 'Expense' },
];

export const MOCK_USERS: User[] = [
    { id: '1', name: 'Super Admin', email: 'admin@cctech.com', role: 'Super Admin' },
    { id: '2', name: 'Dana Accountant', email: 'dana@cctech.com', role: 'Accountant' },
    { id: '3', name: 'Alex Manager', email: 'alex@cctech.com', role: 'Finance Manager' },
    { id: '4', name: 'Sam Auditor', email: 'sam@cctech.com', role: 'Auditor' },
];

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
    {
        id: 'txn_123',
        date: '2025-11-10',
        description: 'Taxi fare for client meeting',
        amount: 15.75,
        debitAccount: '5015',
        creditAccount: '1010',
        receiptUrl: null,
        status: 'Pending',
        createdBy: 'Dana Accountant'
    },
    {
        id: 'txn_124',
        date: '2025-11-09',
        description: 'Office supplies from Addis Stationery',
        amount: 120.50,
        debitAccount: '5005',
        creditAccount: '1020',
        receiptUrl: '#',
        status: 'Approved',
        createdBy: 'Dana Accountant'
    },
    {
        id: 'txn_125',
        date: '2025-11-08',
        description: 'Client payment - Invoice #INV-001',
        amount: 2500.00,
        debitAccount: '1020', // Cash in bank
        creditAccount: '4000', // Sales Revenue
        receiptUrl: null,
        status: 'Approved',
        createdBy: 'Dana Accountant'
    },
     {
        id: 'txn_126',
        date: '2025-11-07',
        description: 'Duplicate travel expense claim',
        amount: 350.00,
        debitAccount: '5020',
        creditAccount: '1010',
        receiptUrl: '#',
        status: 'Rejected',
        createdBy: 'Dana Accountant'
    },
];
