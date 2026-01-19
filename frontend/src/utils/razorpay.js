import toast from 'react-hot-toast';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => {
      toast.error('Unable to load Razorpay SDK');
      reject(new Error('Razorpay SDK failed to load'));
    };

    document.body.appendChild(script);
  });

export const openRazorpayCheckout = ({ order, onSuccess, onFailure }) => {
  if (!window.Razorpay) {
    toast.error('Razorpay SDK not available');
    return;
  }

  const options = {
    key: process.env.RAZORPAY_KEY_ID,
    amount: order.razorpayOrder.amount,
    currency: order.razorpayOrder.currency,
    name: 'HomeBite',
    description: order.razorpayOrder.notes?.serviceTitle || 'Service / Item Purchase',
    order_id: order.razorpayOrder.id,
    handler: onSuccess,
    prefill: {
      name: order.user?.name || 'HomeBite User',
      email: order.user?.email || 'user@example.com',
    },
    notes: order.razorpayOrder.notes,
    theme: {
      color: '#0E7490',
    },
  };

  const rzpay = new window.Razorpay(options);
  rzpay.on('payment.failed', onFailure);
  rzpay.open();
};
