import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const Input = ({ label, type = 'text', value, onChange, placeholder, name, required = false, maxLength }) => (
  <label className="flex w-full flex-col gap-2">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">{label}</span>
    <motion.input
      whileFocus={{ scale: 1.01, boxShadow: '0 15px 45px -25px rgba(20, 184, 166, 0.65)' }}
      transition={{ duration: 0.2 }}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
    />
  </label>
);

Input.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
};

export default Input;
