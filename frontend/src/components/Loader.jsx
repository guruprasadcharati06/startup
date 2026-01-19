import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <motion.div
      className="h-16 w-16 rounded-full border-4 border-teal-400 border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
    />
  </div>
);

export default Loader;
