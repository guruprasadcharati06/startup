import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { decodeTokenPayload, resolveToken, isTokenValid } from '../utils/tokenHelpers.js';

const REDIRECT_PATH = '/admin/login';

const ProtectedAdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const tokenData = useMemo(() => resolveToken(), [location.key]);
  const token = tokenData?.token;

  useEffect(() => {
    let mounted = true;

    const verifyAccess = async () => {
      if (!token) {
        setAuthorized(false);
        setChecking(false);
        setTimeout(() => {
          if (mounted) {
            navigate(REDIRECT_PATH, {
              replace: true,
              state: { from: location.pathname },
            });
          }
        }, 200);
        return;
      }

      const payload = decodeTokenPayload(token);

      if (!isTokenValid(payload) || payload?.role !== 'admin') {
        setAuthorized(false);
        setChecking(false);
        setTimeout(() => {
          if (mounted) {
            navigate(REDIRECT_PATH, {
              replace: true,
              state: { from: location.pathname },
            });
          }
        }, 200);
        return;
      }

      if (mounted) {
        setAuthorized(true);
        setChecking(false);
      }
    };

    verifyAccess();

    return () => {
      mounted = false;
    };
  }, [location.pathname, navigate, token]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950/90">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col items-center gap-3"
        >
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-500 border-t-sky-400" />
          <p className="text-sm uppercase tracking-[0.3em] text-slate-200">Verifying access</p>
        </motion.div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <AnimatePresence>
        <motion.div
          key="redirect"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex min-h-screen items-center justify-center bg-slate-950"
        >
          <p className="text-slate-200">Redirecting to admin login…</p>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="min-h-screen bg-slate-900"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

ProtectedAdminRoute.propTypes = {
  children: PropTypes.node,
};

ProtectedAdminRoute.defaultProps = {
  children: null,
};

export default ProtectedAdminRoute;
