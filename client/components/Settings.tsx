
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';
import { useTranslation } from '../i18n/useTranslation';

const emptyUser: Omit<User, '_id' | 'token'> = { name: '', email: '', role: 'Accountant', password: '' };

const UserForm: React.FC<{ user: User | null, onSave: (user: any) => void, onCancel: () => void }> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState(user || emptyUser);
    const { t } = useTranslation();
    const isEditing = !!user;

    useEffect(() => {
        setFormData(user || emptyUser);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    return (
        <div className="bg-cctech-gray p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-cctech-dark mb-4">{isEditing ? t('editUser') : t('addNewUser')}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('name')}</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm" />
                </div>
                <div className="md:col-span-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('email')}</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm" />
                </div>
                {!isEditing && (
                     <div className="md:col-span-1">
                        {/* FIX: Corrected typo `cclassName` to `className` */}
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm" />
                    </div>
                )}
                 <div className="md:col-span-1">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">{t('role')}</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cctech-primary focus:ring-cctech-primary sm:text-sm">
                        <option>Accountant</option>
                        <option>Finance Manager</option>
                        <option>Auditor</option>
                        <option>Super Admin</option>
                    </select>
                </div>
                <div className="md:col-span-1 flex gap-2">
                    <button type="submit" className="w-full bg-cctech-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-cctech-dark transition-colors">{isEditing ? t('saveChanges') : t('addUser')}</button>
                    <button type="button" onClick={onCancel} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">{t('cancel')}</button>
                </div>
            </form>
        </div>
    );
};

const Settings: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useAppContext();
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddNew = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };
  
  const handleDelete = (userId: string) => {
    if(window.confirm('Are you sure you want to delete this user?')) {
        deleteUser(userId);
    }
  }

  const handleSave = async (user: User | Omit<User, '_id'>) => {
    try {
        if ('_id' in user) {
            await updateUser(user);
        } else {
            await addUser(user);
        }
        setIsFormOpen(false);
        setEditingUser(null);
    } catch (error) {
        alert(`Failed to save user: ${error instanceof Error ? error.message: 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-cctech-dark mb-6">{t('settings')}</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cctech-dark">{t('userManagement')}</h2>
          {!isFormOpen && (
            <button onClick={handleAddNew} className="bg-cctech-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-cctech-dark transition-colors">
                {t('addNewUser')}
            </button>
          )}
        </div>
        
        {isFormOpen && <UserForm user={editingUser} onSave={handleSave} onCancel={handleCancel} />}
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t('name')}</th>
                        <th scope="col" className="px-6 py-3">{t('email')}</th>
                        <th scope="col" className="px-6 py-3">{t('role')}</th>
                        <th scope="col" className="px-6 py-3 text-center">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">{user.role}</td>
                            <td className="px-6 py-4 text-center">
                               <button onClick={() => handleEdit(user)} className="font-medium text-cctech-primary hover:underline mr-4">{t('editUser')}</button>
                               <button onClick={() => handleDelete(user._id)} disabled={user.role === 'Super Admin'} className="font-medium text-red-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed">{t('delete')}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;