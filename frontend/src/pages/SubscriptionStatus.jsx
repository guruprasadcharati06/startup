import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import Button from '../components/Button.jsx';
import useAsync from '../hooks/useAsync.js';
import { getMySubscription } from '../api/subscriptions.js';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDisplayDate = (dateLike) => {
  if (!dateLike) return '—';
  const date = new Date(dateLike);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const resolveDeliveredCount = (subscription) => {
  if (!subscription) return 0;
  if (typeof subscription.deliveredDays === 'number') {
    return Math.max(0, subscription.deliveredDays);
  }
  if (Array.isArray(subscription.deliveries)) {
    return subscription.deliveries.filter((day) => (day?.status || '').toLowerCase() === 'delivered').length;
  }
  return 0;
};

const SubscriptionStatus = () => {
  const navigate = useNavigate();
  const { value, loading, error, execute } = useAsync(getMySubscription, true);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const meta = useMemo(() => {
    if (!value) {
      return {
        totalDays: 7,
        deliveredDays: 0,
        startDate: null,
        endDate: null,
        progress: [],
        statusLabel: 'No subscription',
      };
    }

    const totalDays = Math.max(1, Number(value.totalDays ?? 7));
    const deliveredDays = Math.min(totalDays, resolveDeliveredCount(value));
    const startDate = value.startDate ? new Date(value.startDate) : new Date();
    const endDate = addDays(startDate, totalDays - 1);

    const progress = Array.from({ length: totalDays }, (_, index) => {
      if (Array.isArray(value.deliveries) && value.deliveries[index]) {
        const delivery = value.deliveries[index];
        const status = (delivery.status || '').toLowerCase();
        return {
          label: delivery.label || `Day ${index + 1}`,
          date: delivery.date ? new Date(delivery.date) : addDays(startDate, index),
          status,
          notes: delivery.notes,
        };
      }

      const date = addDays(startDate, index);
      const status = index < deliveredDays ? 'delivered' : index === deliveredDays ? 'scheduled' : 'upcoming';

      return {
        label: `Day ${index + 1}`,
        date,
        status,
        notes: null,
      };
    });

    const status = (value.status || '').toLowerCase();
    let statusLabel = 'Scheduled';
    if (status === 'completed') {
      statusLabel = 'Completed';
    } else if (status === 'active') {
      statusLabel = 'Ongoing';
    } else if (status === 'paused') {
      statusLabel = 'Paused';
    } else if (status === 'cancelled') {
      statusLabel = 'Cancelled';
    }

    return {
      totalDays,
      deliveredDays,
      startDate,
      endDate,
      progress,
      statusLabel,
      rawStatus: status,
    };
  }, [value]);

  const progressPercent = useMemo(() => {
    if (!meta.totalDays) return 0;
    return Math.round((meta.deliveredDays / meta.totalDays) * 100);
  }, [meta.deliveredDays, meta.totalDays]);

  if (loading && !value) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!value && !loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-4"
        >
          <h1 className="font-display text-3xl font-semibold text-white">No weekly subscription yet</h1>
          <p className="text-sm text-slate-400">
            Start a 7-day home-chef plan tailored to your taste buds. We&apos;ll handle the cooking and deliver daily at your
            preferred slot.
          </p>
        </motion.div>
        <Button onClick={() => navigate('/subscription')} className="px-6">
          Explore weekly plan
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="overflow-hidden rounded-4xl border border-indigo-400/20 bg-slate-900/80"
      >
        <div className="relative overflow-hidden px-6 py-10 sm:px-10">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/15 via-slate-900/40 to-slate-950" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">Weekly subscription</p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">Progress overview</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Track each day&apos;s delivery, remaining meals, and plan status in real time.
              </p>
            </div>
            <div className="rounded-3xl border border-indigo-400/30 bg-slate-900/70 px-6 py-5 text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
              <p className="mt-1 font-display text-3xl font-semibold text-indigo-200">{meta.statusLabel}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-indigo-300/80">
                {formatDisplayDate(meta.startDate)} – {formatDisplayDate(meta.endDate)}
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            className="mt-10 space-y-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-8 text-sm text-slate-300">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Delivered</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{meta.deliveredDays}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Remaining</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{Math.max(meta.totalDays - meta.deliveredDays, 0)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total days</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{meta.totalDays}</p>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Progress</div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-400 via-emerald-400 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <p className="mt-2 text-right text-xs text-slate-400">{progressPercent}% complete</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {meta.progress.map((day, index) => {
                const statusColorMap = {
                  delivered: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
                  scheduled: 'border-indigo-400/40 bg-indigo-500/10 text-indigo-100',
                  upcoming: 'border-slate-700 bg-slate-900/70 text-slate-300',
                  skipped: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
                  cancelled: 'border-rose-400/40 bg-rose-500/10 text-rose-100',
                };
                const statusLabelMap = {
                  delivered: 'Delivered',
                  scheduled: 'Today',
                  upcoming: 'Upcoming',
                  skipped: 'Skipped',
                  cancelled: 'Cancelled',
                  paused: 'Paused',
                };
                const statusKey = day.status || 'upcoming';
                return (
                  <motion.div
                    key={`${day.label}-${index}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05, duration: 0.35, ease: 'easeOut' }}
                    className={`rounded-3xl border px-5 py-4 shadow-lg shadow-black/20 ${
                      statusColorMap[statusKey] || statusColorMap.upcoming
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em]">
                      <span>{day.label}</span>
                      <span>{DAY_NAMES[day.date.getDay()]}</span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">{formatDisplayDate(day.date)}</p>
                    <p className="mt-2 text-sm text-slate-200">
                      {statusLabelMap[statusKey] || statusLabelMap.upcoming}
                    </p>
                    {day.notes && <p className="mt-3 text-xs text-slate-200/80">{day.notes}</p>}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.section>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-400">
          Need to pause or reschedule a day? Reach out at least 24 hours before delivery and we&apos;ll adjust the plan.
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={execute} disabled={loading} className="px-5">
            {loading ? 'Refreshing…' : 'Refresh status'}
          </Button>
          <button
            type="button"
            onClick={() => navigate('/subscription')}
            className="rounded-full border border-slate-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-indigo-300 hover:text-indigo-200"
          >
            Manage plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
