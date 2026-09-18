import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../styles/settings.css';

const Settings = () => {
  const { user, login, token } = useAuth();
  const [name, setName] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    api.get('/profile').then(res => setName(res.data.name)).catch(() => {});
  }, []);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setProfileLoading(true);
    try {
      const res = await api.put('/profile', { name });
      login({ token, user: { ...user, name: res.data.name } });
      toast.success('Name updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    setPassLoading(true);
    try {
      await api.put('/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Settings</h1>

        <div className="settings-card card">
          <h2 className="settings-section-title">Profile Information</h2>
          <form onSubmit={handleNameUpdate}>
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                className="settings-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="settings-input" value={user?.email || ''} disabled />
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="settings-card card">
          <h2 className="settings-section-title">Change Password</h2>
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                className="settings-input"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="settings-input"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="settings-input"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={passLoading}>
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;

