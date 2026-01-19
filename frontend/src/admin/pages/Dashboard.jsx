import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getRecentSignups } from '../services/userAdminService.js';

const baseMetrics = [
  { key: 'active', label: 'Active Subscriptions', accent: 'from-emerald-400 to-green-500' },
  { key: 'pending', label: 'Pending Deliveries', accent: 'from-sky-400 to-blue-500' },
];

const Dashboard = () => {
  const [signupData, setSignupData] = useState({ count: null, users: [], since: null });
  const [loadingSignups, setLoadingSignups] = useState(false);

  const fetchSignups = async () => {
    setLoadingSignups(true);
    try {
      const data = await getRecentSignups({ limit: 6, days: 7 });
      setSignupData({
        count: data?.count ?? 0,
        users: Array.isArray(data?.users) ? data.users : [],
        since: data?.since ?? null,
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load signups');
      setSignupData((prev) => ({ ...prev, count: prev.count ?? 0 }));
    } finally {
      setLoadingSignups(false);
    }
  };

  useEffect(() => {
    fetchSignups();
  }, []);

  const formattedSince = useMemo(() => {
    if (!signupData.since) return null;
    const date = new Date(signupData.since);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }, [signupData.since]);

  const signupMetric = {
    key: 'signups',
    label: 'New Signups (7d)',
    accent: 'from-amber-400 to-orange-500',
  };

  const metrics = useMemo(() => [...baseMetrics, signupMetric], [signupMetric]);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="font-display text-4xl font-semibold"
          >
            Admin Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
            className="mt-3 max-w-2xl text-slate-400"
          >
            Monitor subscriptions, deliveries, and user activity in real time. This is a placeholder view—replace the
            widgets below with live data once the admin APIs are ready.
          </motion.p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {metrics.map((metric, index) => {
            const isSignups = metric.key === 'signups';
            const headlineValue = isSignups
              ? loadingSignups && signupData.count === null
                ? '…'
                : signupData.count ?? 0
              : '—';

            return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 * index }}
              className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.accent} text-lg font-semibold text-slate-950`}>
                {isSignups ? signupData.count ?? 0 : '—'}
              </div>
              <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">{metric.label}</h3>
              <p className="mt-2 text-2xl font-semibold text-white">{headlineValue}</p>
              {isSignups && (
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  {loadingSignups ? (
                    <p className="text-slate-400">Loading recent signups…</p>
                  ) : signupData.users.length === 0 ? (
                    <p className="text-slate-500">
                      No new users have signed up in the last {formattedSince ? 'few days' : '7 days'} yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {signupData.users.map((user) => (
                        <li key={user._id || user.email} className="flex flex-col rounded-2xl bg-slate-900/70 px-3 py-2">
                          <span className="font-semibold text-white">{user.name || 'Unnamed user'}</span>
                          <span className="text-xs text-slate-500">{user.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                    <span>{formattedSince ? `Since ${formattedSince}` : 'Past 7 days'}</span>
                    <button
                      type="button"
                      onClick={fetchSignups}
                      className="rounded-full border border-amber-400/30 px-3 py-1 text-[11px] font-semibold text-amber-200 transition hover:border-amber-300 hover:text-amber-100"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
            );
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          className="mt-12 rounded-3xl border border-white/5 bg-slate-900/70 p-8"
        >
          <h2 className="font-display text-2xl font-semibold text-white">Next Steps</h2>
          <p className="mt-3 text-slate-400">
            Hook this dashboard into your admin APIs to track KPIs, approve subscriptions, and manage deliveries. Add
            cards, tables, and filtering controls as the backend evolves.
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;
