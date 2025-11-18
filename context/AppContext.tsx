
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, JournalEntry } from '../types';
import { MOCK_USERS, MOCK_JOURNAL_ENTRIES } from '../constants';
import { checkForDuplicateEntry } from '../services/geminiService';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  journalEntries: JournalEntry[];
  currency: string;
  setCurrency: (currency: string) => void;
  locale: string;
  setLocale: (locale: string) => void;
  login: (userId: string) => void;
  logout: () => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdBy' | 'status'>) => Promise<void>;
  updateJournalEntryStatus: (entryId: string, status: 'Approved' | 'Rejected') => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(MOCK_JOURNAL_ENTRIES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currency, setCurrency] = useState<string>('USD');
  const [locale, setLocale] = useState<string>('en');

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdBy'| 'status'>) => {
    if (!currentUser) return;

    const { isDuplicate, reason } = await checkForDuplicateEntry(entry, journalEntries);

    const newEntry: JournalEntry = {
      ...entry,
      id: `txn_${Date.now()}`,
      createdBy: currentUser.name,
      status: 'Pending',
      isPotentialDuplicate: isDuplicate,
      duplicateReason: reason,
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  };
  
  const updateJournalEntryStatus = (entryId: string, status: 'Approved' | 'Rejected') => {
      setJournalEntries(prev => 
        prev.map(entry => 
            entry.id === entryId ? { ...entry, status } : entry
        )
      );
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: `user_${Date.now()}` };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const deleteUser = (userId: string) => {
    // Prevent deleting the Super Admin or the currently logged-in user
    if (userId === '1' || userId === currentUser?.id) {
        alert("Cannot delete the Super Admin or the current user.");
        return;
    }
    setUsers(prev => prev.filter(user => user.id !== userId));
  };


  const value = {
    currentUser,
    users,
    journalEntries,
    currency,
    setCurrency,
    locale,
    setLocale,
    login,
    logout,
    addJournalEntry,
    updateJournalEntryStatus,
    addUser,
    updateUser,
    deleteUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
