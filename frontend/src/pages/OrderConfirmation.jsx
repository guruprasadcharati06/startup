import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    navigate('/orders', { replace: true });
    return null;
  }

  const isCod = order.paymentMethod === 'cod';
  const amountLabel = isCod ? 'Amount due on delivery' : 'Amount paid';

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-slate-900/80 p-8 shadow-[0_0_40px_rgb(16,185,129,0.15)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 text-emerald-100">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.01 7.035a1 1 0 0 1-1.425.005L3.29 8.76A1 1 0 0 1 4.71 7.342l3.16 3.138 6.295-6.318a1 1 0 0 1 1.418.006Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm uppercase tracking-wide text-emerald-200/80">Order confirmed</p>
              <h1 className="font-display text-3xl font-semibold text-white">
                {isCod ? 'Cash on Delivery confirmed' : 'Payment received successfully'}
              </h1>
              <p className="mt-2 text-sm text-emerald-200/80">{order.message}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-slate-900/70 p-6 text-white">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-emerald-200/60">Order ID</span>
              <span className="font-mono text-sm text-emerald-100">{order.orderId}</span>
            </div>
            {order.serviceTitle && (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-emerald-200/60">Service</span>
                <span className="font-medium text-white">{order.serviceTitle}</span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-emerald-200/60">Payment method</span>
              <span className="font-medium capitalize text-white">{order.paymentMethod}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-emerald-200/60">Delivery location</span>
              <span className="text-white/90">{order.deliveryLocation}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-emerald-200/60">Recipient</span>
              <span className="text-white/90">{order.recipientName}</span>
              <span className="text-emerald-200/80">{order.contactNumber}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-emerald-200/60">{amountLabel}</span>
              <span className="text-lg font-semibold text-white">₹{order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-emerald-500/10 p-6 text-sm text-emerald-100">
            <p>
              Need help or want to modify this order? Reach out to us at{' '}
              <a href="mailto:support@homebite.local" className="font-medium text-emerald-200 underline decoration-dotted underline-offset-2">
                support@homebite.local
              </a>
              .
            </p>
            <p>We’ll keep you updated via SMS and email as your order progresses.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="inline-flex items-center justify-center rounded-full border border-emerald-500/60 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
            >
              View order history
            </button>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              Continue browsing services
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderConfirmation;
