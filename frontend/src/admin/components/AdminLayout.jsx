import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Subscriptions', href: '/admin/subscriptions' },
  { label: 'Deliveries', href: '/admin/deliveries' },
  { label: 'Customers', href: '/admin/customers' },
];

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    logout?.();
    navigate('/admin/login', { replace: true });
  };

  const closeDrawer = () => setDrawerOpen(false);
  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const NavItems = ({ onNavigate }) => (
    <nav className="mt-10 space-y-2 text-sm uppercase tracking-[0.25em]">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            `block rounded-2xl px-4 py-3 transition ${
              isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`
          }
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-slate-900 px-6 py-10 lg:flex">
        <h1 className="font-display text-2xl font-semibold">HomeBite Admin</h1>
        <NavItems onNavigate={closeDrawer} />
      </aside>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 px-6 py-10 shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-semibold">HomeBite Admin</h1>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200"
              >
                Close
              </button>
            </div>
            <NavItems onNavigate={closeDrawer} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {drawerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-30 bg-slate-950/80 lg:hidden"
          onClick={closeDrawer}
        />
      )}

      <div className="flex-1">
        <header className="border-b border-white/5 bg-slate-900/70 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 lg:hidden"
                onClick={toggleDrawer}
                aria-label="Toggle navigation"
              >
                <span className="h-5 w-5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.75h16.5M3.75 12h16.5M3.75 18.25h16.5" />
                  </svg>
                </span>
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin Panel</p>
                <h2 className="font-display text-xl font-semibold">Daily Overview</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:bg-white/10 sm:px-4"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="px-4 py-10 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node,
};

AdminLayout.defaultProps = {
  children: null,
};

export default AdminLayout;
