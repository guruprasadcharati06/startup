import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Button from './Button.jsx';

const CartItem = ({ item, onRemove, onView, onUpdateQuantity }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:flex-row md:items-center"
  >
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/50">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">Image TBD</div>
        )}
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-white">{item.title}</h3>
        <p className="text-sm text-slate-400 capitalize">{item.type}</p>
        <p className="text-sm text-slate-400">
          ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')} total • ₹{item.price.toLocaleString('en-IN')} each
        </p>
      </div>
    </div>
    <div className="flex flex-1 items-center justify-end gap-3">
      <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2 text-white">
        <button
          type="button"
          className="text-lg leading-none text-slate-300 transition hover:text-white"
          onClick={() => onUpdateQuantity(item._id, (item.quantity || 1) - 1)}
          aria-label={`Decrease ${item.title} quantity`}
        >
          −
        </button>
        <span className="min-w-[2ch] text-center font-medium">{item.quantity || 1}</span>
        <button
          type="button"
          className="text-lg leading-none text-slate-300 transition hover:text-white"
          onClick={() => onUpdateQuantity(item._id, (item.quantity || 1) + 1)}
          aria-label={`Increase ${item.title} quantity`}
        >
          +
        </button>
      </div>
      <Button onClick={() => onView(item)} className="bg-teal-500/20 text-teal-200 hover:bg-teal-500/30">
        View
      </Button>
      <Button onClick={() => onRemove(item._id)} className="bg-red-500/20 text-red-200 hover:bg-red-500/30">
        Remove
      </Button>
    </div>
  </motion.div>
);

CartItem.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    type: PropTypes.string,
    imageUrl: PropTypes.string,
    quantity: PropTypes.number,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
};

export default CartItem;
