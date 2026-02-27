import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/Button.jsx';
import useAsync from '../hooks/useAsync.js';
import { createSubscription, getMySubscription } from '../api/subscriptions.js';
import { useAuth } from '../context/AuthContext.jsx';

const formatDateForInput = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
const getDefaultStartDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForInput(tomorrow);
};

const WeeklySubscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { value: subscription, loading, error, execute, setValue } = useAsync(getMySubscription, true);

  const [form, setForm] = useState({
    startDate: getDefaultStartDate(),
    dietType: 'veg',
    spiceLevel: 'medium',
    deliveryTime: 'lunch',
  });
  const [saving, setSaving] = useState(false);

  const minDate = useMemo(() => getDefaultStartDate(), []);
  const planDetails = useMemo(
    () => ({
      breakfast: {
        priceLabel: '₹500',
        priceCaption: 'Weekly plan',
        description: 'Daily different breakfast will be provided throughout the subscription week.',
        highlight: 'Chef-curated breakfast rotation every morning',
      },
      lunch: {
        priceLabel: '₹700',
        priceCaption: 'Weekly plan',
        description: 'Fresh veg thali delivered every day with changing mains and sides.',
        highlight: 'Daily homestyle thali with rotating sabzi, dal, and accompaniments',
      },
      dinner: {
        priceLabel: '₹800',
        priceCaption: 'Weekly plan',
        description: 'Comforting dinner thali each night with chef-selected dishes.',
        highlight: 'Evening thali service with daily menu variations',
      },
    }),
    []
  );
  const selectedPlan = planDetails[form.deliveryTime];
  const isVerified = Boolean(
    user?.phoneVerified ?? user?.emailVerified ?? user?.isEmailVerified ?? user?.isPhoneVerified ?? false
  );

  const hasActiveSubscription = useMemo(() => {
    if (!subscription) return false;
    const status = (subscription.status || '').toLowerCase();
    return ['active', 'pending', 'scheduled'].includes(status);
  }, [subscription]);

  useEffect(() => {
    if (error && !/not\sfound/i.test(error.message)) {
      toast.error(error.message);
    }
  }, [error]);

  const handlePreferenceChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isVerified) {
      toast.error('Please verify your email before starting a subscription.');
      return;
    }
    if (hasActiveSubscription) {
      toast.error('You already have a running subscription. View its status instead.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        plan: 'weekly',
        startDate: form.startDate,
        preferences: {
          dietType: form.dietType,
          spiceLevel: form.spiceLevel,
          deliveryTime: form.deliveryTime,
        },
        paymentMethod: 'cod',
      };

      const created = await createSubscription(payload);
      toast.success('Weekly subscription activated! We will collect payment on delivery.');
      setValue(created);
      await execute();
      navigate('/subscription/status', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="overflow-hidden rounded-4xl border border-teal-400/20 bg-slate-900/80"
      >
        <div className="relative overflow-hidden px-6 py-10 sm:px-10">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/10 via-slate-900/40 to-slate-950" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Weekly Plan</p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
                Homemade goodness, delivered daily
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Get a curated 7-day menu prepared by verified home chefs. Pay on delivery, cancel anytime after the cycle,
                and tailor every plate to your taste.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-transparent px-6 py-5 text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {selectedPlan?.priceCaption ?? 'Weekly plan price'}
              </p>
              <p className="mt-1 font-display text-4xl font-semibold text-emerald-200">
                {selectedPlan?.priceLabel ?? '—'}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-emerald-300/80">
                Free doorstep delivery
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            className="mt-10 grid gap-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 sm:grid-cols-2"
          >
            {[
              selectedPlan?.highlight || 'Freshly cooked every morning',
              'Veg & non-veg chef options',
              'Flexible spice levels',
              'COD – pay only when delivered',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                  ✓
                </span>
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
        className="mt-10 space-y-8 rounded-4xl border border-slate-800 bg-slate-950/70 p-6 sm:p-10"
      >
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">Personalize your week</h2>
          <p className="mt-2 text-sm text-slate-400">
            Choose your start date and daily preferences. We&apos;ll confirm the curated menu over WhatsApp before your first
            delivery.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Start date</span>
            <input
              type="date"
              required
              min={minDate}
              value={form.startDate}
              onChange={handlePreferenceChange('startDate')}
              className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Diet preference</span>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'veg', label: 'Vegetarian' },
                { value: 'non-veg', label: 'Non-Veg' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, dietType: option.value }))}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${form.dietType === option.value
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-emerald-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedPlan && (
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm text-emerald-100">
            {selectedPlan.description}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Spice level</span>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'mild', label: 'Mild & soothing' },
                { value: 'medium', label: 'Balanced heat' },
                { value: 'spicy', label: 'Fiery & bold' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, spiceLevel: option.value }))}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${form.spiceLevel === option.value
                      ? 'border-orange-400 bg-orange-500/10 text-orange-200 shadow-lg shadow-orange-500/10'
                      : 'border-slate-700 text-slate-300 hover:border-orange-400 hover:text-orange-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Delivery time</span>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'breakfast', label: 'Breakfast (7–9 AM)' },
                { value: 'lunch', label: 'Lunch (12–2 PM)' },
                { value: 'dinner', label: 'Dinner (7–9 PM)' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, deliveryTime: option.value }))}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${form.deliveryTime === option.value
                      ? 'border-indigo-400 bg-indigo-500/10 text-indigo-200 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-indigo-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
          <p>
            <strong className="text-emerald-200">Cash on Delivery only.</strong> Our delivery partner collects the weekly payment
            during the first drop-off. Pause or tweak future deliveries by contacting support 24 hours in advance.
          </p>
        </div>

        {!isVerified && (
          <div className="rounded-3xl border border-amber-400/40 bg-amber-500/10 p-5 text-sm text-amber-200">
            Verify your email/phone to enable subscriptions. Use the OTP flow from login or profile settings.
          </div>
        )}

        {hasActiveSubscription && (
          <div className="flex flex-col gap-3 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100 sm:flex-row sm:items-center sm:justify-between">
            <span>You already have an active weekly subscription.</span>
            <button
              type="button"
              onClick={() => navigate('/subscription/status')}
              className="rounded-full border border-emerald-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:border-emerald-200 hover:text-emerald-50"
            >
              View status →
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">
            Need custom calories or allergen tweaks? Drop us a note after subscribing and your dedicated chef will adjust the menu.
          </div>
          <Button type="submit" disabled={saving || loading || !isVerified || hasActiveSubscription} className="sm:w-auto">
            {saving ? 'Scheduling your week…' : 'Subscribe · Pay on delivery'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default WeeklySubscription;
