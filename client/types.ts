export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Accountant' | 'Finance Manager' | 'Super Admin' | 'Auditor';
  password?: string;
  token?: string;
}

export interface Account {
  _id: string;
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
  _id:string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  receiptUrl: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdBy: {
    _id: string;
    name: string;
  };
  isPotentialDuplicate?: boolean;
  duplicateReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OcrResult {
  vendorName: string;
  transactionDate: string;
  totalAmount: number;
}