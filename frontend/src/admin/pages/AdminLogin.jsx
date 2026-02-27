import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { decodeTokenPayload } from '../utils/tokenHelpers.js';
import apiClient from '../../api/client.js';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('credentials');
  const [pendingUserId, setPendingUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (stage === 'credentials') {
      if (!credentials.email || !credentials.password) {
        toast.error('Enter both email and password.');
        return;
      }

      setSubmitting(true);

      try {
        const response = await apiClient.post('/api/auth/login', credentials);
        const result = response.data;

        if (result?.data?.requiresOtp && result?.data?.userId) {
          setPendingUserId(result.data.userId);
          setStage('otp');
          toast.success('OTP sent to the registered email.');
          return;
        }

        toast(result?.message || 'Unexpected response. Please try again.', { icon: 'ℹ️' });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!otp.trim()) {
        toast.error('Enter the OTP sent to your email.');
        return;
      }

      setSubmitting(true);

      try {
        const response = await apiClient.post('/api/auth/verify-otp', {
          userId: pendingUserId,
          otp: otp.trim(),
        });

        const result = response.data;
        const token = result?.data?.token;

        if (!token) {
          throw new Error('Token missing in response.');
        }

        const payload = decodeTokenPayload(token);

        if (payload?.role !== 'admin') {
          toast.error('This account does not have admin privileges.');
          return;
        }

        localStorage.setItem('admin_token', token);
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard', { replace: true });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (!pendingUserId) return;

    try {
      await apiClient.post('/api/auth/resend-otp', {
        userId: pendingUserId,
        purpose: 'login',
      });
      toast.success('OTP resent to the registered email.');
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP. Please wait a moment and try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl"
      >
        <h1 className="mb-8 text-center font-display text-3xl font-semibold text-white">Admin Control Room</h1>
        {stage === 'credentials' ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              label="Admin Email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter secure password"
              required
            />
            <Button type="submit" disabled={submitting} className="mt-4 w-full justify-center">
              {submitting ? 'Sending OTP…' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <p className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
              Enter the 6-digit code mailed to <span className="font-medium text-white">{credentials.email}</span> to
              unlock the console.
            </p>
            <Input
              label="OTP"
              name="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              required
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-sky-300 transition hover:text-sky-200"
              >
                Resend OTP
              </button>
              <span>Expires in 5 minutes</span>
            </div>
            <Button type="submit" disabled={submitting} className="mt-4 w-full justify-center">
              {submitting ? 'Verifying…' : 'Verify & Enter'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
