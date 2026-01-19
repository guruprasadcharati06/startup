import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import CartItem from '../components/CartItem.jsx';
import Button from '../components/Button.jsx';

const Cart = () => {
  const { items, removeFromCart, clearCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  const handleProceed = () => {
    if (items.length === 0) {
      toast.error('Add items to cart before checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Your cart</h1>
          <p className="text-sm text-slate-400">Review your selections before completing the booking.</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-sm font-semibold text-red-300 transition hover:text-red-400"
          >
            Clear cart
          </button>
        )}
      </div>

      <AnimatePresence>
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-400"
          >
            Your cart is empty. Explore services to add them here.
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout className="space-y-4">
        <AnimatePresence>
          {items.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              onRemove={removeFromCart}
              onView={() => navigate(`/services/${item._id}`)}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p className="text-xs uppercase text-slate-400">Total</p>
          <p className="font-display text-3xl font-semibold text-white">₹{total.toLocaleString('en-IN')}</p>
        </div>
        <Button onClick={handleProceed} className="w-full justify-center md:w-auto">
          Proceed to checkout
        </Button>
      </motion.div>
    </div>
  );
};

export default Cart;
