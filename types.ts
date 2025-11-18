export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Accountant' | 'Finance Manager' | 'Super Admin' | 'Auditor';
}

export interface Account {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
}

export interface JournalLine {
  accountId: string;
  type: 'Debit' | 'Credit';
  amount: number;
}

export interface JournalEntry {
  id:string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  receiptUrl: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdBy: string; // User's name
  isPotentialDuplicate?: boolean;
  duplicateReason?: string | null;
}

export interface OcrResult {
  vendorName: string;
  transactionDate: string;
  totalAmount: number;
}