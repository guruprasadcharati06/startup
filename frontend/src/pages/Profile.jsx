import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getProfile } from '../api/users.js';
import useAsync from '../hooks/useAsync.js';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { execute, loading, error, value } = useAsync(getProfile, true);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  useEffect(() => {
    if (value) {
      setUser((prev) => ({ ...prev, ...value }));
    }
  }, [value, setUser]);

  if (loading && !value && !user) {
    return <Loader />;
  }

  const profile = value || user;

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-10 text-center text-slate-400">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70"
      >
        <div className="h-32 bg-gradient-to-r from-teal-500/20 via-slate-900 to-slate-900" />
        <div className="-mt-12 flex flex-col items-center gap-6 px-8 pb-10 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-900 bg-slate-800 text-3xl font-semibold text-teal-300">
            {profile.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold text-white">{profile.name}</h1>
            <p className="text-sm text-slate-400">{profile.email}</p>
            {profile.phone && <p className="text-sm text-slate-400">📞 {profile.phone}</p>}
          </div>
          <div className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-8 text-left sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-500">Member since</p>
              <p className="text-sm text-slate-200">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently joined'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Role</p>
              <p className="text-sm text-slate-200">{profile.role || 'user'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase text-slate-500">About</p>
              <p className="text-sm text-slate-300">
                Keep exploring local services and handcrafted items. Manage your bookings, payments, and personal details all in one place.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
