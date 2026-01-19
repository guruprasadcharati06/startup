import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getOrders } from '../api/orders.js';
import useAsync from '../hooks/useAsync.js';
import Loader from '../components/Loader.jsx';

const statusColors = {
  paid: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  pending: 'bg-amber-500/20 text-amber-200 border border-amber-500/40',
  failed: 'bg-rose-500/20 text-rose-200 border border-rose-500/40',
};

const Orders = () => {
  const { execute, loading, error, value } = useAsync(getOrders, true);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  if (loading) {
    return <Loader />;
  }

  const orders = value || [];

  if (orders.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-dashed border-slate-800 p-10 text-center text-slate-400"
        >
          No orders found yet. Once you book a service or buy an item, it will appear here.
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold text-white">Order history</h1>
        <p className="text-sm text-slate-400">Review everything you’ve ordered, including any pending deliveries.</p>
      </div>
      <AnimatePresence>
        {orders.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs uppercase text-slate-400">Order ID</p>
              <p className="font-mono text-slate-200">{order._id}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white">{order.service?.title}</h2>
              <p className="text-sm text-slate-400">₹{order.amount.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
              {order.status !== 'pending' && (
                <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${statusColors[order.status] || ''}`}>
                  {order.status}
                </span>
              )}
              <div className="text-xs text-slate-500">
                {order.status === 'paid' && order.razorpayPaymentId && (
                  <p className="mt-1">Payment ID: {order.razorpayPaymentId}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
