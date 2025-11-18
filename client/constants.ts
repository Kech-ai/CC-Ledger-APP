

import { Account, User, JournalEntry } from './types';

// A simplified mock of the Ethiopian Chart of Accounts
export const CHART_OF_ACCOUNTS: Account[] = [
  // FIX: Added '_id' property to match the Account type.
  { _id: '1010', code: '1010', name: 'Petty Cash', type: 'Asset' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '1020', code: '1020', name: 'Cash in Bank', type: 'Asset' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '1200', code: '1200', name: 'Accounts Receivable', type: 'Asset' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '2010', code: '2010', name: 'Accounts Payable', type: 'Liability' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '3000', code: '3000', name: 'Owner\'s Equity', type: 'Equity' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '4000', code: '4000', name: 'Sales Revenue', type: 'Income' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '5005', code: '5005', name: 'Office Supplies', type: 'Expense' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '5010', code: '5010', name: 'Rent Expense', type: 'Expense' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '5015', code: '5015', name: 'Ground Transport', type: 'Expense' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '5020', code: '5020', name: 'Air Travel', type: 'Expense' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '5030', code: '5030', name: 'Utilities', type: 'Expense' },
  // FIX: Added '_id' property to match the Account type.
  { _id: '5040', code: '5040', name: 'Marketing Expense', type: 'Expense' },
];

export const MOCK_USERS: User[] = [
    // FIX: Changed 'id' to '_id' to match the User type.
    { _id: '1', name: 'Super Admin', email: 'admin@cctech.com', role: 'Super Admin' },
    // FIX: Changed 'id' to '_id' to match the User type.
    { _id: '2', name: 'Dana Accountant', email: 'dana@cctech.com', role: 'Accountant' },
    // FIX: Changed 'id' to '_id' to match the User type.
    { _id: '3', name: 'Alex Manager', email: 'alex@cctech.com', role: 'Finance Manager' },
    // FIX: Changed 'id' to '_id' to match the User type.
    { _id: '4', name: 'Sam Auditor', email: 'sam@cctech.com', role: 'Auditor' },
];

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
    {
        // FIX: Changed 'id' to '_id' and 'createdBy' to an object to match the JournalEntry type. Added missing fields.
        _id: 'txn_123',
        date: '2025-11-10',
        description: 'Taxi fare for client meeting',
        amount: 15.75,
        debitAccount: '5015',
        creditAccount: '1010',
        receiptUrl: null,
        status: 'Pending',
        createdBy: { _id: '2', name: 'Dana Accountant' },
        createdAt: '2025-11-10T10:00:00.000Z',
        updatedAt: '2025-11-10T10:00:00.000Z',
    },
    {
        // FIX: Changed 'id' to '_id' and 'createdBy' to an object to match the JournalEntry type. Added missing fields.
        _id: 'txn_124',
        date: '2025-11-09',
        description: 'Office supplies from Addis Stationery',
        amount: 120.50,
        debitAccount: '5005',
        creditAccount: '1020',
        receiptUrl: '#',
        status: 'Approved',
        createdBy: { _id: '2', name: 'Dana Accountant' },
        createdAt: '2025-11-09T10:00:00.000Z',
        updatedAt: '2025-11-09T10:00:00.000Z',
    },
    {
        // FIX: Changed 'id' to '_id' and 'createdBy' to an object to match the JournalEntry type. Added missing fields.
        _id: 'txn_125',
        date: '2025-11-08',
        description: 'Client payment - Invoice #INV-001',
        amount: 2500.00,
        debitAccount: '1020', // Cash in bank
        creditAccount: '4000', // Sales Revenue
        receiptUrl: null,
        status: 'Approved',
        createdBy: { _id: '2', name: 'Dana Accountant' },
        createdAt: '2025-11-08T10:00:00.000Z',
        updatedAt: '2025-11-08T10:00:00.000Z',
    },
     {
        // FIX: Changed 'id' to '_id' and 'createdBy' to an object to match the JournalEntry type. Added missing fields.
        _id: 'txn_126',
        date: '2025-11-07',
        description: 'Duplicate travel expense claim',
        amount: 350.00,
        debitAccount: '5020',
        creditAccount: '1010',
        receiptUrl: '#',
        status: 'Rejected',
        createdBy: { _id: '2', name: 'Dana Accountant' },
        createdAt: '2025-11-07T10:00:00.000Z',
        updatedAt: '2025-11-07T10:00:00.000Z',
    },
];