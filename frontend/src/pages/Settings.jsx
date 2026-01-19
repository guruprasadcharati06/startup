import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/users.js';
import useAsync from '../hooks/useAsync.js';
import Modal from '../components/Modal.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const { execute, loading, error, value } = useAsync(getProfile, true);

  const profileData = useMemo(() => value || user, [value, user]);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  useEffect(() => {
    if (profileData) {
      setProfileForm({ name: profileData.name || '', phone: profileData.phone || '' });
    }
  }, [profileData]);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateProfile(profileForm);
      setUser((prev) => ({ ...prev, ...updated }));
      toast.success('Profile updated successfully');
      setProfileModalOpen(false);
      execute();
    } catch (updateError) {
      toast.error(updateError.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPasswordModalOpen(false);
    } catch (updateError) {
      toast.error(updateError.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Manage your account details, security, and preferences.</p>
      </div>

      {loading && !profileData ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <motion.div
              key={`settings-skeleton-${index}`}
              className="h-56 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
              variants={shimmer}
              animate="animate"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8"
          >
            <div>
              <p className="text-xs uppercase text-slate-500">Account</p>
              <h2 className="font-display text-2xl font-semibold text-white">Profile information</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <span className="text-slate-500">Name:</span> {profileData?.name || 'N/A'}
              </li>
              <li>
                <span className="text-slate-500">Email:</span> {profileData?.email || 'N/A'}
              </li>
              <li>
                <span className="text-slate-500">Phone:</span> {profileData?.phone || 'Add your phone number'}
              </li>
            </ul>
            <div className="mt-auto">
              <Button onClick={() => setProfileModalOpen(true)} className="w-full justify-center md:w-auto">
                Edit profile
              </Button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
            className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8"
          >
            <div>
              <p className="text-xs uppercase text-slate-500">Security</p>
              <h2 className="font-display text-2xl font-semibold text-white">Password & sessions</h2>
            </div>
            <p className="text-sm text-slate-300">
              Update your password frequently to keep your account safe. Active sessions will stay valid.
            </p>
            <div className="mt-auto space-y-3">
              <Button onClick={() => setPasswordModalOpen(true)} className="w-full justify-center md:w-auto">
                Change password
              </Button>
              <Button
                onClick={() => logout()}
                className="w-full justify-center bg-red-500/20 text-red-200 hover:bg-red-500/30 md:w-auto"
              >
                Logout
              </Button>
            </div>
          </motion.section>
        </div>
      )}

      <Modal open={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} title="Edit profile">
        <form className="space-y-4" onSubmit={submitProfile}>
          <Input
            label="Full name"
            name="name"
            value={profileForm.name}
            onChange={handleProfileChange}
            placeholder="Jane Doe"
            required
          />
          <Input
            label="Phone number"
            name="phone"
            value={profileForm.phone}
            onChange={handleProfileChange}
            placeholder="Enter phone number"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setProfileModalOpen(false)} className="bg-slate-700 text-slate-300 hover:bg-slate-600">
              Cancel
            </Button>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Update password">
        <form className="space-y-4" onSubmit={submitPassword}>
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Enter current password"
            required
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            placeholder="Create new password"
            required
          />
          <Input
            label="Confirm new password"
            name="confirm"
            type="password"
            value={passwordForm.confirm}
            onChange={handlePasswordChange}
            placeholder="Re-enter new password"
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setPasswordModalOpen(false)} className="bg-slate-700 text-slate-300 hover:bg-slate-600">
              Cancel
            </Button>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update password'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;
