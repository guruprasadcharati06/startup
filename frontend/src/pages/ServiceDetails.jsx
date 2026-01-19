import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getServiceById } from '../api/services.js';
import Button from '../components/Button.jsx';
import Loader from '../components/Loader.jsx';
import useAsync from '../hooks/useAsync.js';
import { useCart } from '../context/CartContext.jsx';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { execute, loading, error, value } = useAsync(() => getServiceById(id), true);

  useEffect(() => {
    if (error) {
      toast.error('Unable to fetch service details');
    }
  }, [error]);

  const handleAction = () => {
    addToCart(value);
    toast.success(`${value.title} added to cart`);
    navigate('/cart');
  };

  if (loading) {
    return <Loader />;
  }

  if (!value) {
    return (
      <div className="mx-auto w-full max-w-4xl p-10 text-center">
        <p className="text-lg text-slate-400">Service not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10 lg:flex-row">
      <motion.div
        className="flex-1 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {value.imageUrl ? (
          <img src={value.imageUrl} alt={value.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full min-h-[340px] items-center justify-center text-slate-500">
            Image coming soon
          </div>
        )}
      </motion.div>
      <motion.div
        className="flex-1 space-y-5 rounded-3xl border border-slate-800 bg-slate-900/70 p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      >
        <div className="space-y-3">
          <span className="rounded-full bg-teal-900/60 px-3 py-1 text-xs uppercase tracking-wide text-teal-200">
            {value.category}
          </span>
          <h1 className="font-display text-4xl font-semibold text-white">{value.title}</h1>
          <p className="text-sm uppercase tracking-wide text-slate-400">{value.type}</p>
        </div>
        <p className="text-base text-slate-300">{value.description}</p>
        {value.duration && <p className="text-sm text-slate-400">Duration: {value.duration}</p>}
        <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
          <div>
            <p className="text-xs uppercase text-slate-400">Price</p>
            <p className="font-display text-3xl font-semibold text-white">
              ₹{value.price.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <Button onClick={handleAction} className="px-8 py-3 text-base">
            {value.type === 'service' ? 'Book service' : 'Add to cart'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ServiceDetails;
