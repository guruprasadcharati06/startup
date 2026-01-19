import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const initialState = {
  name: '',
  email: '',
  password: '',
  phone: '',
};

const Signup = () => {
  const [form, setForm] = useState(initialState);
  const [stage, setStage] = useState('form');
  const [otp, setOtp] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);
  const navigate = useNavigate();
  const { signup, verifyOtp, resendOtp, authLoading } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stage === 'form') {
      if (!form.name || !form.email || !form.password || !form.phone) {
        toast.error('All fields are required');
        return;
      }

      if (!/^\d{10}$/.test(form.phone.trim())) {
        toast.error('Enter a valid 10-digit phone number');
        return;
      }

      try {
        const response = await signup(form);

        if (response?.requiresOtp) {
          setPendingUserId(response.userId);
          setStage('otp');
          toast.success('OTP sent to your email. Please verify.');
        } else {
          toast.success('Welcome aboard!');
          navigate('/home', { replace: true });
        }
      } catch (error) {
        toast.error(error.message);
      }
    } else if (stage === 'otp') {
      if (!otp.trim()) {
        toast.error('Enter the OTP sent to your email');
        return;
      }

      try {
        const response = await verifyOtp({ userId: pendingUserId, otp: otp.trim() });
        if (response?.user && response?.token) {
          toast.success('Signup complete!');
          navigate('/home', { replace: true });
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleResend = async () => {
    if (!pendingUserId) return;

    try {
      await resendOtp({ userId: pendingUserId, purpose: 'signup' });
      toast.success('OTP resent to your email');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-floating"
      >
        <h1 className="mb-6 text-center font-display text-3xl font-semibold text-white">Create your account</h1>
        {stage === 'form' ? (
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit mobile"
              maxLength={10}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
            <Button type="submit" disabled={authLoading} className="mt-2 w-full justify-center">
              {authLoading ? 'Sending OTP...' : 'Sign up'}
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <p className="rounded-2xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-200">
              We’ve sent a one-time password to <span className="font-medium text-white">{form.email}</span>. Enter the
              6-digit code to complete your signup.
            </p>
            <Input
              label="OTP"
              name="otp"
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <button type="button" onClick={handleResend} className="text-teal-300 hover:text-teal-200">
                Resend OTP
              </button>
              <span>Expires in 5 minutes</span>
            </div>
            <Button type="submit" disabled={authLoading} className="mt-2 w-full justify-center">
              {authLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
