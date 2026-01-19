import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Home from './Home.jsx';

const ExploreMeals = () => {
  const location = useLocation();

  const { initialMealType, initialDinnerPreference, focusOnMount } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const rawMeal = params.get('meal');
    const rawPreference = params.get('preference');
    const allowedMeals = new Set(['all', 'breakfast', 'lunch', 'dinner']);

    const normalizedMeal = allowedMeals.has(rawMeal) ? rawMeal : 'all';
    const normalizedPreference = rawPreference === 'non-veg' ? 'non-veg' : 'veg';
    const shouldFocus = params.get('focus') === 'meals';

    return {
      initialMealType: normalizedMeal,
      initialDinnerPreference: normalizedPreference,
      focusOnMount: shouldFocus,
    };
  }, [location.search]);

  return (
    <Home
      initialMealType={initialMealType}
      initialDinnerPreference={initialDinnerPreference}
      focusOnMount={focusOnMount}
      showLanding={false}
    />
  );
};

export default ExploreMeals;
