import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { useSplash } from '../context/SplashContext.jsx';

const Splash = () => {
  const navigate = useNavigate();
  const { showSplash } = useSplash();

  useEffect(() => {
    if (!showSplash) {
      navigate('/login', { replace: true });
    }
  }, [showSplash, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ duration: 1 }}
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(20,184,166,0.25), transparent 50%), radial-gradient(circle at 80% 10%, rgba(249,115,22,0.2), transparent 55%), radial-gradient(circle at 50% 80%, rgba(14,116,144,0.25), transparent 50%)',
        }}
      />
      <motion.div
        className="relative flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900/70 shadow-floating"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          <h1 className="font-display text-3xl font-semibold text-white">HomeBite</h1>
        </motion.div>
        <motion.h1
          className="mb-4 max-w-3xl font-display text-4xl font-semibold text-white sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Local Services & Items, Crafted For You
        </motion.h1>
        <motion.p
          className="mb-10 max-w-xl text-base text-slate-300 sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          Make your life easier with HomeBite. Discover home services, order daily essentials, and track everything from your neighbourhood.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        >
          <Button onClick={() => navigate('/login')} className="px-8 py-3 text-base">
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Splash;
