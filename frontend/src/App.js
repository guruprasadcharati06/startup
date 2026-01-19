import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Splash from './pages/Splash.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import ExploreMeals from './pages/ExploreMeals.jsx';
import WeeklySubscription from './pages/WeeklySubscription.jsx';
import SubscriptionStatus from './pages/SubscriptionStatus.jsx';
import ServiceDetails from './pages/ServiceDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute.jsx';
import AdminLayout from './admin/components/AdminLayout.jsx';
import AdminLogin from './admin/pages/AdminLogin.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import AdminSubscriptions from './admin/pages/AdminSubscriptions.jsx';
import AdminDeliveries from './admin/pages/AdminDeliveries.jsx';
import AdminCustomers from './admin/pages/AdminCustomers.jsx';
import AdminOrders from './admin/pages/AdminOrders.jsx';
import { useAuth } from './context/AuthContext.jsx';
import SplashProvider from './context/SplashContext.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const AnimatedRoute = ({ children }) => (
  <motion.div
    className="min-h-screen"
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={{ duration: 0.4, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={user ? <Navigate to="/home" replace /> : <AnimatedRoute><Splash /></AnimatedRoute>}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <AnimatedRoute><Login /></AnimatedRoute>}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/home" replace /> : <AnimatedRoute><Signup /></AnimatedRoute>}
        />
        <Route path="/admin/login" element={<AnimatedRoute><AdminLogin /></AnimatedRoute>} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminSubscriptions />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/deliveries"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminDeliveries />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminCustomers />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <Home />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <WeeklySubscription />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription/status"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <SubscriptionStatus />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meals"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <ExploreMeals />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/:id"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <ServiceDetails />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <Cart />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <Checkout />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <Orders />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <OrderConfirmation />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <Profile />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Navbar />
              <AnimatedRoute>
                <Settings />
              </AnimatedRoute>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <SplashProvider>
    <AppRoutes />
  </SplashProvider>
);

export default App;
