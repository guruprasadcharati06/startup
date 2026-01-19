import React, { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const CartContext = createContext();

const initialState = {
  items: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find((item) => item._id === action.payload._id);
      if (exists) {
        const updatedItems = state.items.map((item) =>
          item._id === action.payload._id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
        toast.success(`Updated ${action.payload.title} quantity to ${(exists.quantity || 1) + 1}`);
        return { ...state, items: updatedItems };
      }
      toast.success('Added to cart');
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      const normalizedQuantity = Math.max(1, quantity);
      const updatedItems = state.items.map((item) =>
        item._id === id ? { ...item, quantity: normalizedQuantity } : item
      );
      return { ...state, items: updatedItems };
    }
    case 'REMOVE_ITEM': {
      toast.success('Removed from cart');
      return { ...state, items: state.items.filter((item) => item._id !== action.payload) };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addToCart = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });

  const total = state.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const value = useMemo(
    () => ({
      items: state.items,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      total,
    }),
    [state.items, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCart = () => useContext(CartContext);
