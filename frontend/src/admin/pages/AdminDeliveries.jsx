import React from 'react';
import { motion } from 'framer-motion';

const AdminDeliveries = () => {
  return (
    <div className="space-y-10">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="font-display text-3xl font-semibold text-white"
        >
          Delivery Control
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
          className="mt-3 max-w-2xl text-slate-400"
        >
          Live delivery data isn’t wired yet—hook the admin delivery endpoint here to monitor drivers in real time.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
        className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-12 text-center"
      >
        <h2 className="font-display text-xl text-white">No delivery records yet</h2>
        <p className="max-w-md text-sm text-slate-400">
          Build the delivery tracking API to show route assignments, driver status, and ETA updates here. Once the
          endpoint is ready, plug it into this module to go live.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminDeliveries;
