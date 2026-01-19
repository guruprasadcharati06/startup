import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const SplashContext = createContext();

const SplashProvider = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SplashContext.Provider value={{ showSplash, setShowSplash }}>
      {children}
    </SplashContext.Provider>
  );
};

SplashProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSplash = () => useContext(SplashContext);

export default SplashProvider;
