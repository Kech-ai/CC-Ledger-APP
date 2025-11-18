import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, JournalEntry, Account } from '../types';
import { api } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  loading: boolean;
  users: User[];
  journalEntries: JournalEntry[];
  chartOfAccounts: Account[];
  currency: string;
  setCurrency: (currency: string) => void;
  locale: string;
  setLocale: (locale: string) => void;
  login: (credentials: Pick<User, 'email' | 'password'>) => Promise<void>;
  logout: () => void;
  addJournalEntry: (entry: Omit<JournalEntry, '_id' | 'createdBy' | 'status' | 'createdAt' | 'updatedAt' | 'isPotentialDuplicate' | 'duplicateReason'>) => Promise<void>;
  updateJournalEntryStatus: (entryId: string, status: 'Approved' | 'Rejected') => Promise<void>;
  addUser: (user: Omit<User, '_id' | 'token'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>([]);
  const [currency, setCurrency] = useState<string>('USD');
  const [locale, setLocale] = useState<string>('en');
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
    setJournalEntries([]);
    setUsers([]);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [fetchedEntries, fetchedUsers, fetchedAccounts] = await Promise.all([
        api.getJournalEntries(),
        api.getUsers(),
        api.getAccounts(),
      ]);
      setJournalEntries(fetchedEntries);
      setUsers(fetchedUsers);
      setChartOfAccounts(fetchedAccounts);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
      // If token is invalid, log out
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      if (token && userInfo) {
        try {
          const user = JSON.parse(userInfo);
          setCurrentUser(user);
          await fetchData();
        } catch (e) {
            // clear invalid stored info
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            setCurrentUser(null);
        }
      }
      setLoading(false);
    };
    initialize();
  }, [fetchData]);

  const login = async (credentials: Pick<User, 'email' | 'password'>) => {
    const user = await api.login(credentials);
    localStorage.setItem('token', user.token!);
    localStorage.setItem('userInfo', JSON.stringify(user));
    setCurrentUser(user);
    await fetchData();
  };

  const addJournalEntry = async (entry: Omit<JournalEntry, '_id' | 'createdBy' | 'status' | 'createdAt' | 'updatedAt' | 'isPotentialDuplicate' | 'duplicateReason'>) => {
    const newEntry = await api.createJournalEntry(entry);
    setJournalEntries(prev => [newEntry, ...prev]);
  };
  
  const updateJournalEntryStatus = async (entryId: string, status: 'Approved' | 'Rejected') => {
      const updatedEntry = await api.updateJournalEntry(entryId, { status });
      setJournalEntries(prev => 
        prev.map(entry => 
            entry._id === entryId ? updatedEntry : entry
        )
      );
  };

  const addUser = async (user: Omit<User, '_id' | 'token'>) => {
    const newUser = await api.createUser(user);
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (updatedUser: User) => {
    const user = await api.updateUser(updatedUser._id, updatedUser);
    setUsers(prev => prev.map(u => u._id === user._id ? user : u));
    if (currentUser?._id === user._id) {
        const userWithToken = { ...user, token: currentUser.token };
        setCurrentUser(userWithToken);
        localStorage.setItem('userInfo', JSON.stringify(userWithToken));
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUser?._id) {
        alert("Cannot delete the current user.");
        return;
    }
    await api.deleteUser(userId);
    setUsers(prev => prev.filter(user => user._id !== userId));
  };


  const value = {
    currentUser,
    loading,
    users,
    journalEntries,
    chartOfAccounts,
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