import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Button from './Button.jsx';

const Card = ({
  title,
  description,
  price,
  category,
  type,
  imageUrl,
  mealType,
  onAction,
  actionLabel = 'Book/Buy',
}) => (
  <motion.div
    whileHover={{ y: -8, boxShadow: '0 25px 45px -20px rgba(14, 116, 144, 0.65)' }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950/90 p-6 shadow-floating"
  >
    <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl bg-slate-800/60">
      {imageUrl ? (
        <motion.img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
          Image coming soon
        </div>
      )}
      <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase text-slate-900">
        {type}
      </span>
      {mealType && (
        <span className="absolute right-4 top-4 rounded-full bg-teal-500/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-100">
          {mealType}
        </span>
      )}
    </div>
    <div className="flex flex-1 flex-col">
      <div className="mb-2 text-xs uppercase tracking-wide text-teal-400">{category}</div>
      <h3 className="mb-3 font-display text-xl font-semibold text-white">{title}</h3>
      <p className="mb-6 flex-1 text-sm text-slate-300 line-clamp-3">{description}</p>
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="font-display text-2xl font-bold text-white">
          ₹{price?.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
        </span>
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    </div>
  </motion.div>
);

Card.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['service', 'item']).isRequired,
  imageUrl: PropTypes.string,
  mealType: PropTypes.oneOf(['breakfast', 'lunch', 'dinner']),
  onAction: PropTypes.func,
  actionLabel: PropTypes.string,
};

export default Card;
