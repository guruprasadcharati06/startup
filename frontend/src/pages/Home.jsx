import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { getServices } from '../api/services.js';
import useAsync from '../hooks/useAsync.js';
import Card from '../components/Card.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import { useCart } from '../context/CartContext.jsx';

const Home = ({
  initialMealType = 'all',
  initialDinnerPreference = 'veg',
  focusOnMount = false,
  showLanding = true,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const location = useLocation();
  const [selectedMealType, setSelectedMealType] = useState(initialMealType);
  const [dinnerPreference, setDinnerPreference] = useState(initialDinnerPreference);
  const menuSectionRef = useRef(null);

  const fetchServices = useMemo(
    () => () => getServices({ mealType: selectedMealType === 'all' ? undefined : selectedMealType }),
    [selectedMealType]
  );

  const { execute, loading, error, value } = useAsync(fetchServices, false);

  const excludedTitles = useMemo(
    () => new Set(['sunrise smoothie bowl', 'hearty grain bowl', 'gourmet pasta platter']),
    []
  );

  const curatedMealItems = useMemo(() => {
    const breakfastItems = [
        {
          _id: 'static-breakfast-idli-steamed',
          title: 'Single Idli',
          description: 'Soft, fluffy idli served with coconut chutney and a ladle of sambar.',
          price: 20,
          category: 'Breakfast classic',
          type: 'item',
          mealType: 'breakfast',
          imageUrl: '/images/breakfast/idli.jpg',
        },
        {
          _id: 'static-breakfast-vada-crisp',
          title: 'Single Vada',
          description: 'Golden lentil fritter with a crunchy crust and soft centre, paired with chutney.',
          price: 15,
          category: 'Breakfast classic',
          type: 'item',
          mealType: 'breakfast',
          imageUrl: '/images/breakfast/vada.jpg',
        },
        {
          _id: 'static-breakfast-masala-dosa',
          title: 'Masala Dosa Supreme',
          description: 'Crisp dosa filled with spiced potato palya, served with chutneys and sambar.',
          price: 70,
          category: 'Breakfast classic',
          type: 'item',
          mealType: 'breakfast',
          imageUrl: '/images/breakfast/dosa.jpg',
        },
        {
          _id: 'static-breakfast-puri',
          title: 'Puri Bhaji Combo',
          description: 'Fluffy puris paired with a mildly spiced potato bhaji and pickle.',
          price: 75,
          category: 'Breakfast classic',
          type: 'item',
          mealType: 'breakfast',
          imageUrl: '/images/breakfast/puri.jpg',
        },
        {
          _id: 'static-breakfast-upma',
          title: 'Vegetable Upma Bowl',
          description: 'Roasted semolina cooked with vegetables, curry leaves, and cashews.',
          price: 30,
          category: 'Breakfast classic',
          type: 'item',
          mealType: 'breakfast',
          imageUrl: '/images/breakfast/upma.jpg',
        },
        {
          _id: 'static-breakfast-avalakki',
          title: 'Masala Avalakki',
          description: 'Flattened rice tossed with onions, peanuts, mustard, and turmeric.',
          price: 30,
          category: 'Breakfast classic',
          type: 'item',
          mealType: 'breakfast',
          imageUrl: '/images/breakfast/avalakki.jpg',
        },
        {
          _id: 'static-breakfast-benne-dosa',
          title: 'Benne Dose Splendor',
          description: 'Mysuru-style benne dosa, golden and crisp with a luscious butter finish.',
          price: 80,
          category: 'Breakfast classic',
          type: 'item',
          mealType: 'breakfast',
          imageUrl: '/images/breakfast/benne-dosa.jpg',
        },
        {
          _id: 'static-breakfast-mangalore-buns',
          title: 'Mangalore Buns Platter',
          description: 'Sweet banana-infused buns served warm with coconut chutney and sambar.',
          price: 50,
          category: 'Breakfast classic',
          type: 'item',
          mealType: 'breakfast',
          imageUrl: '/images/breakfast/mangalore-buns.webp',
        },
        {
          _id: 'static-breakfast-set-dosa',
          title: 'Soft Set Dosa Stack',
          description: 'Fluffy set dosas accompanied by vegetable sagu and coconut chutney.',
          price: 80,
          category: 'Breakfast classic',
          type: 'item',
          mealType: 'breakfast',
          imageUrl: '/images/breakfast/set-dosa.jpg',
        },
      ];

    const lunchItems = [
        {
          _id: 'static-lunch-chapati-thali',
          title: 'Chapati Comfort Plate',
          description: 'Soft chapatis served with seasonal vegetable curry and a drizzle of ghee.',
          price: 10,
          category: 'Lunch special',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/chapati.jpg',
        },
        {
          _id: 'static-lunch-roti-stack',
          title: 'Tandoori Roti Stack',
          description: 'Hand-tossed rotis straight from the tandoor with a side of dal tadka.',
          price: 12,
          category: 'Lunch special',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/roti.jpg',
        },
        {
          _id: 'static-lunch-veg-melody',
          title: 'Market Fresh Veggies',
          description: 'A colourful sauté of farm vegetables tempered with mustard and curry leaves.',
          price: 30,
          category: 'Lunch special',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/vegetables.jpg',
        },
        {
          _id: 'static-lunch-curd-salad',
          title: 'Curd & Cucumber Salad',
          description: 'Cooling curd tossed with cucumbers, carrots, and a tempering of spices.',
          price: 20,
          category: 'Lunch special',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/curd-salad.jpg',
        },
        {
          _id: 'static-lunch-curd-bowl',
          title: 'Earthen Pot Curd',
          description: 'Thick, home-set curd served chilled in a traditional clay pot.',
          price: 10,
          category: 'Lunch special',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/curd.jpg',
        },
        {
          _id: 'static-lunch-masala-rice',
          title: 'Masala Rice Bowl',
          description: 'Fragrant spiced rice topped with roasted peanuts and crunchy papad.',
          price: 50,
          category: 'Lunch special',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/masala-rice.jpg',
        },
        {
          _id: 'static-lunch-white-rice',
          title: 'Steamed White Rice',
          description: 'Single-serve portion of fluffy steamed rice to pair with your favourite sides.',
          price: 30,
          category: 'Lunch special',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/white-rice.jpg',
        },
        {
          _id: 'static-lunch-sambar',
          title: 'Homestyle Vegetable Sambar',
          description: 'Aromatic lentil stew simmered with drumsticks, gourds, and house masala.',
          price: 20,
          category: 'Lunch special',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/sambar.jpg',
        },
        {
          _id: 'static-lunch-jamun',
          title: 'Gulab Jamun Duo',
          description: 'Warm, syrupy gulab jamun made fresh by our home chefs.',
          price: 20,
          category: 'Lunch sweet',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/ice-cream.jpg',
        },
        {
          _id: 'static-lunch-papad',
          title: 'Roasted Papad',
          description: 'Crisp papad toasted with a sprinkle of chaat masala.',
          price: 10,
          category: 'Lunch side',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/papad.jpg',
        },
        {
          _id: 'static-lunch-full-thali',
          title: 'Homestyle Full Thali',
          description: 'Complete thali with chapati, rice, sambar, seasonal sabzi, salad, curd, and dessert.',
          price: 180,
          category: 'Lunch combo',
          type: 'item',
          mealType: 'lunch',
          imageUrl: '/images/lunch/thalis-and-combos-by-treat-mumbai-north-indian-delivery-restaurants-kopls6wbq4.avif',
        },
      ];

    const dinnerItems = [
        {
          _id: 'static-dinner-chapati-platter',
          title: 'Chapati Evening Platter',
          description: 'Soft chapatis with rich vegetable curry and slow-simmered dal for dinner.',
          price: 10,
          category: 'Dinner special',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/chapati.jpg',
        },
        {
          _id: 'static-dinner-roti-basket',
          title: 'Butter Roti Basket',
          description: 'Tandoor rotis brushed with ghee, served alongside dal makhani.',
          price: 12,
          category: 'Dinner special',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/roti.jpg',
        },
        {
          _id: 'static-dinner-veg-thali',
          title: 'Evening Veg Thali',
          description: 'Full thali spread with chapati, rice, sabzi, sambar, salad, curd, and dessert.',
          price: 220,
          category: 'Dinner combo',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/lunch/thalis-and-combos-by-treat-mumbai-north-indian-delivery-restaurants-kopls6wbq4.avif',
        },
        {
          _id: 'static-dinner-masala-rice',
          title: 'Masala Rice Pot',
          description: 'Fragrant masala rice loaded with vegetables and crispy toppings.',
          price: 50,
          category: 'Dinner special',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/masala-rice.jpg',
        },
        {
          _id: 'static-dinner-veg-medley',
          title: 'Stir-Fried Veg Medley',
          description: 'Seasonal vegetables tossed with mustard seeds, curry leaves, and coconut.',
          price: 30,
          category: 'Dinner special',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/vegetables.jpg',
        },
        {
          _id: 'static-dinner-curd-salad',
          title: 'Dinner Curd Salad',
          description: 'Cooling curd, cucumber, and carrot salad with a tempered seasoning.',
          price: 20,
          category: 'Dinner side',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/curd-salad.jpg',
        },
        {
          _id: 'static-dinner-curd-bowl',
          title: 'Earthen Curd Bowl',
          description: 'Thick, home-set curd chilled in a clay pot for a soothing finish.',
          price: 10,
          category: 'Dinner side',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/curd.jpg',
        },
        {
          _id: 'static-dinner-white-rice',
          title: 'Steamed Rice Bowl',
          description: 'Single-serve portion of fluffy steamed rice for pairing with curries.',
          price: 30,
          category: 'Dinner side',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/white-rice.jpg',
        },
        {
          _id: 'static-dinner-papad',
          title: 'Roasted Papad',
          description: 'Papad roasted crisp with a sprinkle of chaat masala.',
          price: 10,
          category: 'Dinner side',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/papad.jpg',
        },
        {
          _id: 'static-dinner-sambar',
          title: 'Slow-Simmered Sambar',
          description: 'Aromatic lentil stew simmered with garden vegetables and house masala.',
          price: 20,
          category: 'Dinner side',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/sambar.jpg',
        },
        {
          _id: 'static-dinner-dessert',
          title: 'Saffron Kulfi Slice',
          description: 'Silky kulfi-style dessert infused with saffron and pistachio.',
          price: 20,
          category: 'Dinner sweet',
          type: 'item',
          mealType: 'dinner',
          imageUrl: '/images/dinner/ice-cream.jpg',
        },
      ];

    return {
      breakfast: breakfastItems,
      lunch: lunchItems,
      dinner: dinnerItems,
    };
  }, []);

  const offerHighlights = useMemo(
    () => [
      'Fresh breakfast, lunch, and dinner',
      'Daily meal combos',
      'Special homemade dishes',
      'Healthy and affordable food options',
      'Custom spice and oil levels',
    ],
    []
  );

  const howItWorksSteps = useMemo(
    () => [
      'Choose your favorite homemade dish',
      'Home chef prepares it fresh',
      'Safe and quick delivery',
      'Enjoy warm, healthy food',
    ],
    []
  );

  const whyChooseUs = useMemo(
    () => [
      'Freshly cooked after order',
      'Hygienic home kitchens',
      'Affordable prices',
      'Secure online payments',
      'On-time delivery',
    ],
    []
  );

  const promisePillars = useMemo(
    () => ['Fresh', 'Healthy', 'Hygienic', 'Honest', 'Made with love'],
    []
  );

  const taglineChips = useMemo(
    () => ['Order fresh food', 'Eat healthy', 'Feel at home'],
    []
  );

  const quickLinks = useMemo(
    () => [
      { label: 'Home', anchor: 'hero' },
      { label: 'Chef Picks', anchor: 'chef-picks' },
      { label: 'About Us', anchor: 'about' },
      { label: 'How It Works', anchor: 'how-it-works' },
      { label: 'Contact', anchor: 'contact' },
    ],
    []
  );

  const quickLinksToRender = useMemo(() => {
    if (showLanding) {
      return quickLinks;
    }

    const allowedAnchors = new Set(['hero', 'chef-picks']);
    return quickLinks.filter((link) => allowedAnchors.has(link.anchor));
  }, [showLanding, quickLinks]);

  const legalLinks = useMemo(
    () => [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ],
    []
  );

  const baseSectionProps = useMemo(
    () => ({
      initial: { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.45, ease: 'easeOut' },
      viewport: { once: true, amount: 0.2 },
    }),
    []
  );

  const advertisementCards = useMemo(() => {
    const breakfastHighlight =
      curatedMealItems.breakfast.find((item) => item._id === 'static-breakfast-pav-bhaji') ??
      curatedMealItems.breakfast[0];

    const lunchHighlight =
      curatedMealItems.lunch.find((item) => item._id === 'static-lunch-veg-melody') ??
      curatedMealItems.lunch[0];

    const dinnerHighlight =
      curatedMealItems.dinner.find((item) => item._id === 'static-dinner-ice-cream') ??
      curatedMealItems.dinner.find((item) => item.mealType === 'dinner');

    return [breakfastHighlight, lunchHighlight, dinnerHighlight].filter(Boolean);
  }, [curatedMealItems]);

  const mealFilterOptions = useMemo(
    () => (showLanding ? ['all', 'breakfast', 'lunch', 'dinner'] : ['breakfast', 'lunch', 'dinner']),
    [showLanding]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focus = params.get('focus');
    const meal = params.get('meal');
    const preference = params.get('preference');

    if (meal) {
      const allowedMeals = new Set(['all', 'breakfast', 'lunch', 'dinner']);
      if (allowedMeals.has(meal)) {
        setSelectedMealType((prev) => (prev === meal ? prev : meal));
      }

      if (meal === 'dinner') {
        const normalizedPreference = preference === 'non-veg' ? 'non-veg' : 'veg';
        setDinnerPreference((prev) => (prev === normalizedPreference ? prev : normalizedPreference));
      } else {
        setDinnerPreference((prev) => (prev === 'veg' ? prev : 'veg'));
      }
    }

    if (focus === 'meals') {
      window.requestAnimationFrame(() => {
        if (menuSectionRef.current) {
          menuSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }, [location.search]);

  useEffect(() => {
    if (!focusOnMount) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (menuSectionRef.current) {
        menuSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, [focusOnMount]);

  useEffect(() => {
    if (!showLanding && selectedMealType === 'all') {
      setSelectedMealType('breakfast');
    }
  }, [showLanding, selectedMealType]);

  const itemsToRender = useMemo(() => {
    const fetchedItems = Array.isArray(value) ? value : [];
    const sanitizedFetched = fetchedItems.filter((item) =>
      item?.title ? !excludedTitles.has(item.title.toLowerCase()) : true
    );

    if (selectedMealType === 'all') {
      return showLanding ? advertisementCards : sanitizedFetched;
    }

    if (selectedMealType === 'dinner' && dinnerPreference === 'non-veg') {
      return [];
    }

    const mealKey = selectedMealType !== 'all' ? selectedMealType : null;

    if (mealKey && curatedMealItems[mealKey]) {
      const existingIds = new Set(sanitizedFetched.map((item) => item._id));
      const curated = curatedMealItems[mealKey].filter((item) => !existingIds.has(item._id));
      return [...sanitizedFetched, ...curated];
    }

    return sanitizedFetched;
  }, [
    value,
    selectedMealType,
    dinnerPreference,
    curatedMealItems,
    excludedTitles,
    advertisementCards,
    showLanding,
  ]);

  useEffect(() => {
    execute();
  }, [execute, selectedMealType]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const handleAction = (item) => {
    addToCart(item);
    toast.success(`${item.title} added to cart`);
  };

  const handleExploreMeals = () => {
    navigate('/meals');
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-12">
      {showLanding ? (
        <motion.section
          id="hero"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="overflow-hidden rounded-4xl bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950/95 p-10 sm:p-14"
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Fresh &amp; Homemade
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold text-white sm:text-5xl">
                Fresh Homemade Food, Made With Love
              </h1>
              <p className="mt-4 text-lg text-slate-200/90">
                Enjoy healthy, hygienic, and freshly cooked homemade meals prepared by trusted home chefs near you.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {taglineChips.map((chip) => (
                  <motion.span
                    key={chip}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200"
                  >
                    {chip}
                  </motion.span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleExploreMeals}
                  className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow-[0_20px_40px_-20px_rgba(16,185,129,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-20px_rgba(16,185,129,0.75)]"
                >
                  Explore Meals
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="rounded-full border border-emerald-400/60 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
                >
                  View Order History
                </button>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              className="relative flex flex-col gap-3 rounded-3xl border border-emerald-400/10 bg-slate-900/80 p-6 text-slate-100 shadow-[0_40px_80px_-40px_rgba(2,44,34,0.6)]"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-300">Our Promise</h3>
              <p className="text-base text-slate-200/80">
                We bring you real home-style food made with fresh ingredients, cooked only after you place your order.
                No preservatives, no frozen items — just honest food that feels like home.
              </p>
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                {promisePillars.map((pillar, index) => (
                  <motion.div
                    key={pillar}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3, ease: 'easeOut' }}
                    className="rounded-2xl border border-emerald-500/10 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-emerald-200"
                  >
                    {pillar}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          id="hero"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-4xl border border-emerald-400/20 bg-slate-900/70 p-10 text-center text-slate-200"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Explore meals</span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">
            Chef-crafted picks for every craving
          </h1>
          <p className="mt-3 text-base text-slate-300/90">
            Browse curated breakfasts, hearty lunches, and comforting dinners from verified home chefs. Use the filters
            below to find the meal that feels like home today.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {taglineChips.map((chip) => (
              <motion.span
                key={chip}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200"
              >
                {chip}
              </motion.span>
            ))}
          </div>
        </motion.section>
      )}

      {showLanding && (
        <>
          <motion.section id="about" {...baseSectionProps} className="space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">About our food</span>
              <h2 className="font-display text-3xl font-semibold text-white">Real kitchens. Real people.</h2>
              <p className="max-w-3xl text-base text-slate-300/95">
                We bring you real home-style food made with fresh ingredients and cooked only after you place your order.
                No preservatives, no frozen items — just honest food that feels like home.
              </p>
            </div>
          </motion.section>

          <motion.section {...baseSectionProps} className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">What we offer</span>
              <h2 className="font-display text-3xl font-semibold text-white">Food for every mood</h2>
              <p className="text-base text-slate-400">
                Freshly curated meals, wholesome combos, and thoughtful specials that follow your taste and dietary
                preferences.
              </p>
              <ul className="grid gap-3">
                {offerHighlights.map((item) => (
                  <li
                    key={item}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200 group-hover:bg-emerald-500/25">★</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <motion.div
              {...baseSectionProps}
              className="rounded-3xl border border-emerald-400/10 bg-slate-900/80 p-8"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Trusted home chefs</span>
              <h3 className="mt-3 font-display text-2xl font-semibold text-white">Cooked with care</h3>
              <p className="mt-3 text-base text-slate-300/90">
                All our dishes are prepared by verified home cooks who follow clean kitchen practices and quality
                standards. Every meal is cooked with care and attention.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {['Clean kitchens', 'Verified chefs', 'Quality checks', 'Handmade flavours'].map((badge) => (
                  <div key={badge} className="rounded-2xl border border-emerald-400/20 bg-slate-900/60 px-4 py-3 text-sm text-emerald-200">
                    {badge}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.section>

          <motion.section id="how-it-works" {...baseSectionProps} className="space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">How it works</span>
              <h2 className="font-display text-3xl font-semibold text-white">Dinner plans made easy</h2>
              <p className="max-w-3xl text-base text-slate-300/95">
                From the moment you tap order to the time your meal arrives, we keep things clear, quick, and delicious.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={step}
                  {...baseSectionProps}
                  transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-5 py-6"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Step {index + 1}</span>
                  <p className="text-sm text-slate-200/90">{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section {...baseSectionProps} className="grid gap-10 rounded-4xl border border-emerald-400/10 bg-slate-900/70 p-10 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Why choose us</span>
              <h2 className="font-display text-3xl font-semibold text-white">Made for everyday comfort</h2>
              <p className="text-base text-slate-300/90">
                Thousands of customers trust us because our food tastes like home and arrives right when you need it.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {whyChooseUs.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-sm text-slate-100"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <motion.div
              {...baseSectionProps}
              className="flex flex-col justify-between space-y-4 rounded-3xl border border-emerald-400/20 bg-slate-900/60 p-8 text-slate-200"
            >
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Customer happiness</span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-white">Meals loved by thousands</h3>
                <p className="mt-3 text-sm text-slate-300/90">
                  Thousands of customers trust us for their daily meals because we serve food that tastes like home.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Happy diners', value: '10+' },
                  { label: 'Meals served', value: '10+' },
                  { label: 'City coverage', value: '1' },
                  { label: 'Chef partners', value: '5+' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-emerald-400/15 bg-slate-900/50 px-4 py-4 text-center">
                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.section>

          <motion.section {...baseSectionProps} className="space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Our promise</span>
            <h2 className="font-display text-3xl font-semibold text-white">Every bite feels like home</h2>
            <p className="max-w-3xl text-base text-slate-300/90">
              Fresh ingredients, mindful cooking, and heartfelt service — that&apos;s our everyday commitment.
            </p>
            <div className="flex flex-wrap gap-3">
              {promisePillars.map((pillar) => (
                <span
                  key={pillar}
                  className="rounded-full border border-emerald-400/20 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200"
                >
                  {pillar}
                </span>
              ))}
            </div>
          </motion.section>

          <motion.section
            {...baseSectionProps}
            className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-10 text-center text-slate-200"
          >
            <h3 className="font-display text-2xl font-semibold text-white">Fresh homemade meals, delivered daily.</h3>
            <p className="mt-3 text-sm text-slate-300/90">
              Tap into curated menus from trusted home chefs. We keep it fresh, clean, and ready when you are.
            </p>
          </motion.section>
        </>
      )}

      <motion.section {...baseSectionProps} ref={menuSectionRef} id="chef-picks">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-white">Chef-crafted picks for you</h2>
            <p className="text-sm text-slate-400">Handpicked meals curated with seasonal produce and homely flavours.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
          >
            View order history →
          </button>
        </div>

        {showLanding ? (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate('/meals')}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
            >
              Explore meals &rarr;
            </button>
          </div>
        ) : (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {mealFilterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedMealType(option)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  selectedMealType === option
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-slate-700 text-slate-400 hover:border-teal-500 hover:text-teal-300'
                }`}
              >
                {option === 'all' ? 'All meals' : `${option} options`}
              </button>
            ))}
          </div>
        )}

        {selectedMealType === 'dinner' && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {['veg', 'non-veg'].map((preference) => (
              <button
                key={preference}
                type="button"
                onClick={() => setDinnerPreference(preference)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  dinnerPreference === preference
                    ? 'border-teal-400 bg-teal-500/10 text-teal-300'
                    : 'border-slate-700 text-slate-400 hover:border-teal-500 hover:text-teal-300'
                }`}
              >
                {preference === 'veg' ? 'Veg Plates' : 'Non-veg Plates'}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {!loading && selectedMealType !== 'dinner' && itemsToRender.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
            No services available yet. Check back soon!
          </div>
        )}

        {!loading && selectedMealType === 'dinner' && dinnerPreference === 'non-veg' && (
          <div className="rounded-3xl border border-dashed border-slate-700 p-10 text-center">
            <h3 className="font-display text-xl font-semibold text-white">Non-veg dinner drops soon</h3>
            <p className="mt-2 text-sm text-slate-400">
              We&apos;re plating something special. Check back shortly for our non-veg lineup!
            </p>
          </div>
        )}

        {!loading && itemsToRender.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {itemsToRender.map((item) => (
              <Card
                key={item._id}
                title={item.title}
                description={item.description}
                price={item.price}
                category={item.category}
                type={item.type}
                imageUrl={item.imageUrl}
                mealType={item.mealType}
                onAction={() => handleAction(item)}
                actionLabel={item.type === 'service' ? 'Book now' : 'Add to cart'}
              />
            ))}
          </div>
        )}
      </motion.section>

      {showLanding && (
        <motion.section id="contact" {...baseSectionProps} className="grid gap-10 rounded-4xl border border-emerald-400/10 bg-slate-900/70 p-10 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="space-y-5">
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Contact us</span>
            <h2 className="font-display text-3xl font-semibold text-white">We&apos;re here for you</h2>
            <p className="text-base text-slate-300/90">
              Have questions or feedback? We&apos;re happy to help with your orders, chef preferences, or delivery queries.
            </p>
            <div className="space-y-3 text-sm text-slate-200/90">
              <p>
                <span className="font-semibold text-emerald-200">Email:</span> support@yourapp.com
              </p>
              <p>
                <span className="font-semibold text-emerald-200">Phone:</span> +91-XXXXXXXXXX
              </p>
            </div>
          </div>
          <motion.div
            {...baseSectionProps}
            className="rounded-3xl border border-emerald-400/20 bg-slate-900/60 p-8"
          >
            <h3 className="font-display text-2xl font-semibold text-white">Stay connected</h3>
            <p className="mt-3 text-sm text-slate-300/90">
              Follow us for chef stories, community events, and seasonal menus straight from our home kitchens.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Instagram', 'Facebook', 'YouTube', 'X'].map((network) => (
                <button
                  key={network}
                  type="button"
                  className="rounded-full border border-emerald-400/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
                >
                  {network}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.section>
      )}

      <motion.footer
        {...baseSectionProps}
        className="mt-4 flex flex-col gap-10 rounded-4xl border border-emerald-400/10 bg-gradient-to-br from-slate-950 via-slate-950/95 to-slate-900/60 p-10"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="max-w-sm space-y-3">
            <h3 className="font-display text-2xl font-semibold text-white">Homely meals, delivered daily.</h3>
            <p className="text-sm text-slate-300/80">
              Stay connected for updates and new dishes curated by our community of passionate home chefs.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Quick links</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
                {quickLinksToRender.map((link) => (
                  <li key={link.label}>
                    <a href={`#${link.anchor}`} className="transition hover:text-emerald-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="transition hover:text-emerald-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Follow us</h4>
              <p className="mt-3 text-sm text-slate-300/80">Stay connected for updates and new dishes.</p>
              <div className="mt-3 flex gap-2">
                {['IG', 'FB', 'YT', 'X'].map((token) => (
                  <span
                    key={token}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/70 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800/80 pt-6 text-xs uppercase tracking-[0.2em] text-slate-500">
          © {new Date().getFullYear()} YourApp. All rights reserved.
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
