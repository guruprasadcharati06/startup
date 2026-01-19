import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const Button = ({ children, className = '', onClick, type = 'button', disabled = false }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.03, boxShadow: disabled ? 'none' : '0 15px 35px -15px rgba(249, 115, 22, 0.6)' }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    transition={{ duration: 0.15 }}
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`rounded-full px-5 py-2 font-semibold tracking-wide text-sm uppercase transition-colors ${
      disabled
        ? 'cursor-not-allowed bg-slate-700 text-slate-400'
        : 'bg-accent text-slate-900 hover:bg-orange-500'
    } ${className}`}
  >
    {children}
  </motion.button>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
};

export default Button;
