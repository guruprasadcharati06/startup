import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import { createOrder } from '../api/orders.js';

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [items]
  );

  const deliveryFee = 50;
  const finalTotal = useMemo(() => total + deliveryFee, [total]);

  const handlePlaceOrder = async () => {
    if (processing) return;
    try {
      setProcessing(true);

      if (items.length === 0) {
        toast.error('Your cart is empty. Add meals before checking out.');
        setProcessing(false);
        return;
      }

      if (!recipientName.trim()) {
        toast.error('Please enter the receiver name');
        setProcessing(false);
        return;
      }

      if (!contactNumber.trim()) {
        toast.error('Please enter a contact number');
        setProcessing(false);
        return;
      }

      if (!area.trim()) {
        toast.error('Please enter the delivery area');
        setProcessing(false);
        return;
      }

      if (!deliveryLocation.trim()) {
        toast.error('Please provide the delivery address or instructions');
        setProcessing(false);
        return;
      }

      const cartSnapshot = items.map((cartItem) => ({
        id: cartItem._id,
        title: cartItem.title,
        quantity: Math.max(1, Number(cartItem.quantity) || 1),
        price: Number(cartItem.price) || 0,
        type: cartItem.type,
        mealType:
          (cartItem.mealType ||
            (typeof cartItem._id === 'string' && cartItem._id.startsWith('static-')
              ? cartItem._id.split('-')[1]
              : '') ||
            '')
            .toLowerCase(),
        isStatic: typeof cartItem._id === 'string' && cartItem._id.startsWith('static-'),
      }));

      const cartItemsPayload = cartSnapshot.map((cartItem) => {
        const payloadItem = {
          itemId: cartItem.id,
          title: cartItem.title,
          quantity: cartItem.quantity,
          price: cartItem.price,
          type: cartItem.type,
        };
        if (cartItem.mealType) {
          payloadItem.mealType = cartItem.mealType;
        }
        return payloadItem;
      });

      const hasStaticItems = cartSnapshot.some((cartItem) => cartItem.isStatic);
      const singleServiceOrder =
        cartSnapshot.length === 1 && !hasStaticItems && typeof cartSnapshot[0].id === 'string';

      const mealTypeSet = new Set(cartSnapshot.map((cartItem) => cartItem.mealType).filter(Boolean));
      let resolvedMealType;
      if (mealTypeSet.size === 1) {
        [resolvedMealType] = mealTypeSet;
      } else if (mealTypeSet.size > 1) {
        resolvedMealType = 'mixed';
      } else {
        resolvedMealType = hasStaticItems ? 'custom' : undefined;
      }

      const customName =
        cartSnapshot.length === 1
          ? cartSnapshot[0].title
          : `${cartSnapshot.length} items order`;

      const payload = {
        deliveryLocation: deliveryLocation.trim(),
        itemsTotal: total,
        amount: finalTotal,
        deliveryDetails: {
          recipientName: recipientName.trim(),
          contactNumber: contactNumber.trim(),
          area: area.trim(),
          landmark: landmark.trim(),
        },
        cartItems: cartItemsPayload,
        ...(resolvedMealType && { mealType: resolvedMealType }),
        customItemName: customName,
      };

      if (singleServiceOrder) {
        payload.serviceId = cartSnapshot[0].id;
      }

      if (!payload.mealType && singleServiceOrder && cartSnapshot[0].mealType) {
        payload.mealType = cartSnapshot[0].mealType;
      }

      const orderPayload = await createOrder(payload);
      const amountDue = Number(orderPayload.order?.amount ?? finalTotal);
      toast.success('Order placed! We will collect cash on delivery.');
      clearCart();
      const confirmationOrder = {
        orderId: orderPayload.orderId || orderPayload.order?._id,
        paymentMethod: 'cod',
        amount: amountDue,
        message: 'Thank you for choosing us! Kindly keep the billed amount ready for a smooth handoff.',
        serviceTitle: customName,
        deliveryLocation: deliveryLocation.trim(),
        recipientName: recipientName.trim(),
        contactNumber: contactNumber.trim(),
        items: cartSnapshot,
      };

      navigate('/order-confirmation', {
        replace: true,
        state: { order: confirmationOrder },
      });
      setProcessing(false);
    } catch (error) {
      toast.error(error.message);
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Checkout</h1>
        <p className="text-sm text-slate-400">
          Complete your booking with a secure payment. Review your cart and place one order for everything.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-center text-slate-400">
          Your cart is empty. Add services or items to proceed.
        </div>
      ) : (
        <motion.div layout className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-300" htmlFor="recipientName">
                  Receiver name
                </label>
                <input
                  id="recipientName"
                  type="text"
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  placeholder="Person receiving the delivery"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300" htmlFor="contactNumber">
                  Phone number
                </label>
                <input
                  id="contactNumber"
                  type="tel"
                  value={contactNumber}
                  onChange={(event) => setContactNumber(event.target.value)}
                  placeholder="10-digit mobile"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-300" htmlFor="area">
                  Area / Locality
                </label>
                <input
                  id="area"
                  type="text"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="e.g., Indiranagar"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300" htmlFor="landmark">
                  Landmark (optional)
                </label>
                <input
                  id="landmark"
                  type="text"
                  value={landmark}
                  onChange={(event) => setLandmark(event.target.value)}
                  placeholder="Near park, tower name, etc."
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="deliveryLocation">
                Delivery location / instructions
              </label>
              <textarea
                id="deliveryLocation"
                value={deliveryLocation}
                onChange={(event) => setDeliveryLocation(event.target.value)}
                placeholder="Full address, landmark, floor details, etc."
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                rows={3}
              />
            </div>

            <div className="mt-4 space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-emerald-100">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.01 7.035a1 1 0 0 1-1.425.005L3.29 8.76A1 1 0 0 1 4.71 7.342l3.16 3.138 6.295-6.318a1 1 0 0 1 1.418.006Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Cash on delivery</p>
                  <p className="text-sm text-emerald-200/80">Thank you for choosing us! Kindly keep the billed amount ready for a smooth handoff.</p>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Items total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Delivery charge</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-emerald-500/30 pt-3 text-base font-semibold">
                  <span>Amount to pay on delivery</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="text-xs uppercase tracking-wide text-emerald-200/70">Our rider will collect payment when the order reaches you.</p>
            </div>
          </div>

          {items.map((item) => (
            <motion.div
              key={item._id}
              layout
              className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:flex-row md:items-center md:justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-white">{item.title}</h2>
                <p className="text-sm text-slate-400 capitalize">{item.type}</p>
                <p className="text-sm text-slate-500">
                  Qty {Math.max(1, Number(item.quantity) || 1)} • ₹{item.price.toLocaleString('en-IN')}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
              </p>
            </motion.div>
          ))}

          <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400">Grand total</p>
              <p className="font-display text-2xl font-semibold text-white">₹{finalTotal.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-xs text-slate-500">Items: ₹{total.toLocaleString('en-IN')} • Delivery charge: ₹{deliveryFee.toFixed(2)}</p>
            </div>
            <Button onClick={handlePlaceOrder} disabled={processing} className="w-full justify-center md:w-auto">
              {processing
                ? 'Placing order...'
                : `Confirm COD Order • ₹${finalTotal.toLocaleString('en-IN')}`}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Checkout;
