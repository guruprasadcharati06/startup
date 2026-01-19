import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { getAllSubscriptions, markDeliveryComplete } from '../services/subscriptionAdminService.js';

const statusClasses = {
  active: 'text-emerald-300 bg-emerald-500/10',
  scheduled: 'text-sky-300 bg-sky-500/10',
  pending: 'text-amber-300 bg-amber-500/10',
  paused: 'text-amber-300 bg-amber-500/10',
  cancelled: 'text-rose-300 bg-rose-500/10',
  completed: 'text-slate-200 bg-slate-700/40',
};

const ProgressPill = ({ delivered, total }) => {
  const percent = total > 0 ? Math.round((delivered / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span className="text-white">Day {Math.min(delivered + 1, total)}</span>
        <span className="text-xs text-slate-500">of {total}</span>
      </div>
      <div className="relative h-2 w-32 overflow-hidden rounded-full bg-slate-800">
        <span className="absolute inset-y-0 left-0 rounded-full bg-sky-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

ProgressPill.propTypes = {
  delivered: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await getAllSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleMarkDayDelivered = async (subscriptionId, dayIndex) => {
    setUpdatingId(subscriptionId);
    try {
      await markDeliveryComplete(subscriptionId, dayIndex);
      toast.success(`Marked Day ${dayIndex + 1} delivered`);
      await fetchSubscriptions();
    } catch (error) {
      toast.error(error.message || 'Failed to update delivery');
    } finally {
      setUpdatingId(null);
    }
  };

  const tableRows = useMemo(() => subscriptions || [], [subscriptions]);

  return (
    <div className="space-y-10">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="font-display text-3xl font-semibold text-white"
        >
          Weekly Subscriptions
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
          className="mt-3 max-w-2xl text-slate-400"
        >
          Review live subscription data straight from the customer platform. Mark deliveries as complete to keep the
          progress timeline in sync.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
        className="overflow-hidden rounded-3xl border border-white/5 bg-slate-900/70 shadow-xl"
      >
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.3em] text-slate-500">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Meal slot</th>
              <th className="px-6 py-4">Start</th>
              <th className="px-6 py-4">End</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-slate-400" colSpan={7}>
                  Loading subscriptions…
                </td>
              </tr>
            ) : tableRows.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-slate-400" colSpan={7}>
                  No subscriptions yet.
                </td>
              </tr>
            ) : (
              tableRows.map((row, index) => {
                const delivered = row.deliveredDays || 0;
                const total = row.totalDays || 7;
                const nextPending = row.deliveries?.findIndex((delivery) => delivery.status !== 'delivered');
                const mealChoice = (row.preferences?.deliveryTime || row.deliveryTime || '').toLowerCase();
                const mealLabel =
                  mealChoice === 'breakfast'
                    ? 'Breakfast'
                    : mealChoice === 'dinner'
                    ? 'Dinner'
                    : mealChoice === 'lunch'
                    ? 'Lunch'
                    : '—';

                return (
                  <motion.tr
                    key={row._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut', delay: 0.15 + index * 0.03 }}
                    className="hover:bg-white/5"
                  >
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div className="flex flex-col">
                        <span>{row.user?.name || 'Unknown user'}</span>
                        <span className="text-xs text-slate-500">{row.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClasses[row.status] || 'text-slate-300 bg-slate-700/40'
                        }`}
                      >
                        {row.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-teal-400/40 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
                        {mealLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {row.startDate ? new Date(row.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {row.endDate ? new Date(row.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <ProgressPill delivered={delivered} total={total} />
                    </td>
                    <td className="px-6 py-4">
                      {nextPending === -1 ? (
                        <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Completed</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMarkDayDelivered(row._id, nextPending)}
                          disabled={updatingId === row._id}
                          className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:bg-sky-500/20 disabled:opacity-60"
                        >
                          {updatingId === row._id ? 'Updating…' : `Mark Day ${nextPending + 1} delivered`}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AdminSubscriptions;
