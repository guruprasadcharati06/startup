import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modal = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur"
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          variants={modal}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-floating"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-lg text-slate-400 transition hover:text-white"
            aria-label="Close modal"
          >
            ×
          </button>
          {title && <h2 className="mb-4 font-display text-2xl text-white">{title}</h2>}
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Modal;
