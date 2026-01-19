import React from 'react';
import { motion } from 'framer-motion';

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

const SkeletonCard = () => (
  <motion.div
    className="flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
  >
    <motion.div
      className="mb-4 h-40 w-full rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
      variants={shimmer}
      animate="animate"
    />
    <motion.div
      className="mb-2 h-3 w-24 rounded-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
      variants={shimmer}
      animate="animate"
    />
    <motion.div
      className="mb-3 h-5 w-3/4 rounded-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
      variants={shimmer}
      animate="animate"
    />
    <motion.div
      className="mb-2 h-3 w-full rounded-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
      variants={shimmer}
      animate="animate"
    />
    <motion.div
      className="mb-10 h-3 w-5/6 rounded-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
      variants={shimmer}
      animate="animate"
    />
    <motion.div
      className="mt-auto h-10 w-32 rounded-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
      variants={shimmer}
      animate="animate"
    />
  </motion.div>
);

export default SkeletonCard;
