import { User, JournalEntry, Account, OcrResult } from '../types';

const API_URL = '/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
};

export const api = {
    // Auth
    login: (credentials: Pick<User, 'email' | 'password'>): Promise<User> =>
        fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        }).then(handleResponse),

    // Users
    getUsers: (): Promise<User[]> =>
        fetch(`${API_URL}/users`, { headers: getAuthHeaders() }).then(handleResponse),
    createUser: (userData: Omit<User, '_id' | 'token'>): Promise<User> =>
        fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData),
        }).then(handleResponse),
    updateUser: (userId: string, userData: Partial<User>): Promise<User> =>
        fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData),
        }).then(handleResponse),
    deleteUser: (userId: string): Promise<{ message: string }> =>
        fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        }).then(handleResponse),

    // Journal Entries
    getJournalEntries: (): Promise<JournalEntry[]> =>
        fetch(`${API_URL}/journal`, { headers: getAuthHeaders() }).then(handleResponse),
    createJournalEntry: (entryData: Omit<JournalEntry, '_id' | 'createdBy' | 'status' | 'createdAt' | 'updatedAt'| 'isPotentialDuplicate' | 'duplicateReason'>): Promise<JournalEntry> =>
        fetch(`${API_URL}/journal`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(entryData),
        }).then(handleResponse),
    updateJournalEntry: (entryId: string, updateData: { status: 'Approved' | 'Rejected' }): Promise<JournalEntry> =>
        fetch(`${API_URL}/journal/${entryId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData),
        }).then(handleResponse),

    // Chart of Accounts
    getAccounts: (): Promise<Account[]> =>
        fetch(`${API_URL}/journal/accounts`, { headers: getAuthHeaders() }).then(handleResponse),
        
    // Uploads
    uploadReceipt: async (formData: FormData): Promise<{ path: string }> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/uploads`, {
            method: 'POST',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            body: formData,
        });
        return await handleResponse(response);
    },

    // AI Services
    scanReceipt: (imagePath: string): Promise<OcrResult> =>
        fetch(`${API_URL}/ai/scan-receipt`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ imagePath }),
        }).then(handleResponse),
    suggestAccount: (description: string): Promise<Account | null> =>
        fetch(`${API_URL}/ai/suggest-account`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ description }),
        }).then(handleResponse),
    summarizeReport: (reportName: string, reportData: any): Promise<string> =>
        fetch(`${API_URL}/ai/summarize-report`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ reportName, reportData }),
        }).then(res => res.text()), // Summary is plain text
};