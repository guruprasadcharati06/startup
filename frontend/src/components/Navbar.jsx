import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/subscription', label: 'Subscription' },
  { to: '/orders', label: 'Orders' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
];

const Navbar = () => {
  const { logout, user } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavSelection = (callback) => {
    if (typeof callback === 'function') {
      callback();
    }
    setMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-0 z-40 backdrop-blur border-b border-slate-800/60 bg-slate-950/60"
    >
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-4">
        <motion.div
          initial={{ y: 0 }}
          animate={{
            y: [0, -3, 0, 3, 0],
            x: [0, 2, 0, -2, 0],
            rotate: [0, 1.5, 0, -1.5, 0],
          }}
          transition={{ duration: 3.8, ease: 'easeInOut', repeat: Infinity }}
          className="relative flex items-center gap-3"
        >
          <div className="absolute inset-0 -left-4 -right-4 -top-1 -bottom-1 rounded-full bg-gradient-to-r from-teal-500/20 via-cyan-400/10 to-emerald-500/20 blur-lg" />
          <div className="absolute inset-0 -left-4 -right-4 -top-1 -bottom-1 rounded-full border border-teal-400/40" />
          <Link
            to="/home"
            className="relative inline-flex items-center justify-center rounded-full px-5 py-2 font-display text-2xl font-semibold tracking-tight text-teal-200 shadow-[0_0_25px_rgba(45,212,191,0.25)] transition-transform hover:scale-[1.02]"
          >
            HomeBite
          </Link>
        </motion.div>
        <nav className="hidden gap-6 md:ml-12 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium uppercase tracking-wide transition-colors ${isActive ? 'text-accent' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-200 transition hover:border-teal-400 hover:text-teal-200 md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="sr-only">Menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5" />
            )}
          </svg>
        </button>
        <div className="ml-2 flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate('/meals')}
            className="hidden rounded-full border border-teal-400/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-teal-200 transition hover:border-teal-300 hover:text-teal-100 lg:inline-flex"
          >
            Click me to explore meals
          </button>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="relative rounded-full bg-slate-800/60 px-4 py-2 text-sm font-semibold tracking-wide text-slate-200 transition hover:bg-slate-700"
          >
            Cart
            {items.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-slate-900">
                {items.length}
              </span>
            )}
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-xs uppercase text-slate-400">Welcome back</p>
            <p className="font-semibold text-slate-200">{user?.name}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-300 transition hover:border-accent hover:text-accent"
          >
            Logout
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-6 right-6 top-full mt-3 rounded-3xl border border-slate-800/80 bg-slate-950/95 p-4 shadow-xl md:hidden"
            >
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => handleNavSelection()}
                    className={({ isActive }) =>
                      `rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition ${isActive
                        ? 'bg-teal-500/10 text-teal-200 shadow-[0_0_12px_rgba(45,212,191,0.25)]'
                        : 'text-slate-200 hover:bg-slate-900/80 hover:text-teal-200'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/meals"
                  onClick={() => handleNavSelection()}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition ${isActive
                      ? 'bg-teal-500/10 text-teal-200 shadow-[0_0_12px_rgba(45,212,191,0.25)]'
                      : 'text-slate-200 hover:bg-slate-900/80 hover:text-teal-200'
                    }`
                  }
                >
                  Click me to explore meals
                </NavLink>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Navbar;
