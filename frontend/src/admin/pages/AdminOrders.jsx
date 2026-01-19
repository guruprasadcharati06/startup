import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { getAdminOrders, markOrderCodPaid } from '../services/orderAdminService.js';

const paymentChips = [
  { label: 'All payments', value: '' },
  { label: 'Cash on delivery', value: 'cod' },
  { label: 'Online', value: 'online' },
  { label: 'PhonePe', value: 'phonepe' },
];

const statusAccent = {
  pending: 'bg-amber-500/10 text-amber-300',
  paid: 'bg-emerald-500/10 text-emerald-300',
  failed: 'bg-rose-500/10 text-rose-300',
};

const PaymentChip = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
      active ? 'border-sky-400/60 bg-sky-500/10 text-sky-200' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

PaymentChip.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

PaymentChip.defaultProps = {
  active: false,
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ paymentMethod: '' });
  const [markingId, setMarkingId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const loadOrders = async (params = {}) => {
    setLoading(true);
    try {
      const data = await getAdminOrders({ limit: 50, ...params });
      setOrders(data ?? []);
    } catch (error) {
      toast.error(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCodPaid = async (orderId) => {
    setMarkingId(orderId);
    try {
      const updated = await markOrderCodPaid(orderId);
      setOrders((prev) => prev.map((order) => (order._id === updated._id ? { ...order, ...updated } : order)));
      toast.success('Payment recorded as received.');
    } catch (error) {
      toast.error(error.message || 'Unable to update payment status');
    } finally {
      setMarkingId(null);
    }
  };

  useEffect(() => {
    loadOrders({ paymentMethod: filters.paymentMethod });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.paymentMethod]);

  const rows = useMemo(() => orders, [orders]);
  const codOrders = useMemo(() => rows.filter((order) => order.paymentMethod === 'cod'), [rows]);
  const pendingCodOrders = useMemo(() => codOrders.filter((order) => order.status !== 'paid'), [codOrders]);
  const settledCodOrders = useMemo(() => codOrders.filter((order) => order.status === 'paid'), [codOrders]);
  const selectedOrder = useMemo(() => rows.find((order) => order._id === selectedOrderId), [rows, selectedOrderId]);

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="font-display text-3xl font-semibold text-white"
        >
          Meal Orders
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
          className="mt-3 max-w-3xl text-slate-400"
        >
          Review every order placed through Explore Meals. Filter by payment method to triage COD pickups versus online
          payments.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.06 }}
        className="flex flex-wrap gap-3"
      >
        {paymentChips.map((chip) => (
          <PaymentChip
            key={chip.value || 'all'}
            label={chip.label}
            active={filters.paymentMethod === chip.value}
            onClick={() => setFilters((prev) => ({ ...prev, paymentMethod: chip.value }))}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.08 }}
        className="overflow-hidden rounded-3xl border border-white/5 bg-slate-900/70 shadow-xl"
      >
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.3em] text-slate-500">
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">Order Ref</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-slate-400">
                  Loading orders…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-slate-400">
                  No orders found for the selected filters.
                </td>
              </tr>
            ) : (
              rows.map((order) => {
                const orderId = order._id ?? '—';
                const shortId = orderId !== '—' ? orderId.slice(-6) : '—';
                const user = order.user || {};
                const delivery = order.deliveryDetails || {};
                const service = order.service || {};
                const cartItems = Array.isArray(order.cartItems) ? order.cartItems : [];
                const hasCartItems = cartItems.length > 0;

                const customerName = user.name || delivery.recipientName || '—';
                const customerEmail = user.email || '—';
                const customerPhone = user.phone || delivery.contactNumber || '—';
                const addressParts = [delivery.area, delivery.landmark, order.deliveryLocation]
                  .filter(Boolean)
                  .map((part) => part.trim())
                  .filter((part) => part.length > 0);
                const customerAddress = addressParts.length > 0 ? addressParts.join(', ') : '—';

                let mealLabel = service.title;
                if (hasCartItems) {
                  const firstItem = cartItems[0];
                  const remaining = cartItems.length > 1 ? ` + ${cartItems.length - 1} more` : '';
                  mealLabel = `${firstItem.title || 'Meal'}${remaining}`;
                }

                if (!mealLabel) {
                  const base = order.mealType ? order.mealType.charAt(0).toUpperCase() + order.mealType.slice(1) : 'Meal';
                  mealLabel = order.customItemName ? `${base} • ${order.customItemName}` : base;
                }

                const paymentLabel = order.paymentMethod ? order.paymentMethod.toUpperCase() : '—';
                const amount = Number(order.amount || 0).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                });
                const placedOn = order.createdAt ? new Date(order.createdAt).toLocaleString() : '—';

                return (
                  <tr
                    key={orderId}
                    className="cursor-pointer hover:bg-white/5"
                    onClick={() => setSelectedOrderId(orderId)}
                  >
                    <td className="px-6 py-4 text-slate-200">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-white">{mealLabel}</span>
                        {hasCartItems ? (
                          <span className="text-xs text-slate-500">
                            {cartItems.map((item, index) => {
                              const suffix = index === cartItems.length - 1 ? '' : ' • ';
                              const quantity = Math.max(1, Number(item.quantity) || 1);
                              return `${quantity} × ${item.title || 'Meal'}${suffix}`;
                            })}
                          </span>
                        ) : order.customItemName ? (
                          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Custom order</span>
                        ) : null}
                        {hasCartItems && cartItems.length > 1 && (
                          <span className="text-[11px] uppercase tracking-[0.25em] text-slate-600">{cartItems.length} items</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div className="flex flex-col">
                        <span>#{shortId}</span>
                        <span className="text-xs text-slate-500">{orderId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-200">{customerName}</span>
                        <span className="text-xs text-slate-500">{customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-200">{customerPhone}</span>
                        <span className="text-xs text-slate-500">{customerAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusAccent[order.status] || 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">{paymentLabel}</p>
                      {order.paymentMethod === 'cod' && order.status !== 'paid' && (
                        <button
                          type="button"
                          onClick={() => handleMarkCodPaid(orderId)}
                          disabled={markingId === orderId}
                          className="mt-3 inline-flex items-center justify-center rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {markingId === orderId ? 'Saving…' : 'Mark Payment Received'}
                        </button>
                      )}
                      {order.paymentMethod === 'cod' && order.status === 'paid' && order.codSettledAt && (
                        <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">
                          Settled {new Date(order.codSettledAt).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-200">{amount}</td>
                    <td className="px-6 py-4 text-slate-300">{placedOn}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.12 }}
        className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 shadow-xl"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">COD Settlement</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Track who still owes cash on delivery versus customers who already paid. Use the button above or the quick
              actions here to keep this list up to date.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">Awaiting cash</h3>
            <div className="mt-4 space-y-4">
              {pendingCodOrders.length === 0 ? (
                <p className="rounded-2xl border border-white/5 bg-slate-900/60 px-4 py-6 text-sm text-slate-500">
                  No pending COD payments. Great job!
                </p>
              ) : (
                pendingCodOrders.map((order) => {
                  const orderId = order._id ?? '—';
                  const customerName = order.user?.name || order.deliveryDetails?.recipientName || '—';
                  const amount = Number(order.amount || 0).toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2,
                  });

                  return (
                    <div
                      key={orderId}
                      className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4 text-sm text-amber-100"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{customerName}</p>
                          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">#{orderId.slice(-6)}</p>
                        </div>
                        <span className="text-base font-semibold text-amber-200">{amount}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMarkCodPaid(orderId)}
                        disabled={markingId === orderId}
                        className="mt-4 w-full rounded-full bg-emerald-400/20 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {markingId === orderId ? 'Saving…' : 'Log Payment Received'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">Collected cash</h3>
            <div className="mt-4 space-y-4">
              {settledCodOrders.length === 0 ? (
                <p className="rounded-2xl border border-white/5 bg-slate-900/60 px-4 py-6 text-sm text-slate-500">
                  No COD payments marked as received yet.
                </p>
              ) : (
                settledCodOrders.map((order) => {
                  const orderId = order._id ?? '—';
                  const customerName = order.user?.name || order.deliveryDetails?.recipientName || '—';
                  const amount = Number(order.amount || 0).toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2,
                  });
                  const settledOn = order.codSettledAt
                    ? new Date(order.codSettledAt).toLocaleString()
                    : new Date(order.updatedAt || order.createdAt).toLocaleString();

                  return (
                    <div
                      key={orderId}
                      className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-sm text-emerald-100"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{customerName}</p>
                          <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">#{orderId.slice(-6)}</p>
                        </div>
                        <span className="text-base font-semibold text-emerald-200">{amount}</span>
                      </div>
                      <p className="mt-3 text-[11px] uppercase tracking-[0.35em] text-emerald-200/70">Settled {settledOn}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            key="order-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-end bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setSelectedOrderId(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="relative h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-slate-900/95 p-8 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="absolute right-6 top-6 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200 hover:bg-white/20"
              >
                Close
              </button>

              <div className="pr-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Order</p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-white">#{selectedOrder._id.slice(-6)}</h2>
                <p className="mt-2 text-sm text-slate-400">Placed {new Date(selectedOrder.createdAt).toLocaleString()}</p>

                <div className="mt-8 space-y-6">
                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Meal details</h3>
                    <div className="mt-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-sm text-slate-200">
                      <p className="text-lg font-semibold text-white">
                        {selectedOrder.service?.title ||
                          (selectedOrder.mealType
                            ? `${selectedOrder.mealType.charAt(0).toUpperCase()}${selectedOrder.mealType.slice(1)}`
                            : 'Meal')}
                      </p>
                      {selectedOrder.customItemName && (
                        <p className="mt-1 text-xs uppercase tracking-[0.35em] text-slate-500">
                          Custom item: {selectedOrder.customItemName}
                        </p>
                      )}
                      {selectedOrder.notes && <p className="mt-2 text-sm text-slate-400">Notes: {selectedOrder.notes}</p>}
                    </div>
                  </section>

                  {Array.isArray(selectedOrder.cartItems) && selectedOrder.cartItems.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-300">Order items</h3>
                      <div className="mt-3 space-y-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-sm text-slate-200">
                        {selectedOrder.cartItems.map((item, index) => {
                          const quantity = Math.max(1, Number(item.quantity) || 1);
                          const lineTotal = (Number(item.price) || 0) * quantity;
                          return (
                            <div key={`${item.itemId || item.title || index}`} className="flex items-center justify-between gap-3">
                              <div className="flex flex-col">
                                <span className="font-semibold text-white">{item.title || 'Meal item'}</span>
                                <span className="text-xs text-slate-500">
                                  {quantity} × ₹{Number(item.price || 0).toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-slate-200">
                                ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">Bill summary</h3>
                    <div className="mt-3 space-y-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-sm text-slate-200">
                      <div className="flex items-center justify-between">
                        <span>Items total</span>
                        <span>
                          ₹{Number(selectedOrder.itemsTotal || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Delivery fee</span>
                        <span>
                          ₹{Number(selectedOrder.deliveryFee || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-500">
                        <span>Payment Method</span>
                        <span>{selectedOrder.paymentMethod?.toUpperCase() || '—'}</span>
                      </div>
                      <hr className="border-white/10" />
                      <div className="flex items-center justify-between text-lg font-semibold text-white">
                        <span>Total due</span>
                        <span>
                          ₹{Number(selectedOrder.amount || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">Customer</h3>
                    <div className="mt-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-sm text-slate-200">
                      <p className="font-semibold text-white">
                        {selectedOrder.user?.name || selectedOrder.deliveryDetails?.recipientName || '—'}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.35em] text-slate-500">
                        {selectedOrder.user?.email || 'No email'}
                      </p>
                      <p className="mt-3 text-sm text-slate-300">
                        Phone: {selectedOrder.user?.phone || selectedOrder.deliveryDetails?.contactNumber || '—'}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {[
                          selectedOrder.deliveryDetails?.area,
                          selectedOrder.deliveryDetails?.landmark,
                          selectedOrder.deliveryLocation,
                        ]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </p>
                    </div>
                  </section>
                </div>

                {selectedOrder.paymentMethod === 'cod' && selectedOrder.status !== 'paid' && (
                  <button
                    type="button"
                    onClick={() => handleMarkCodPaid(selectedOrder._id)}
                    disabled={markingId === selectedOrder._id}
                    className="mt-8 w-full rounded-full bg-emerald-500/20 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {markingId === selectedOrder._id ? 'Saving…' : 'Mark COD Payment Received'}
                  </button>
                )}

                {selectedOrder.status === 'paid' && (
                  <p className="mt-6 text-xs uppercase tracking-[0.35em] text-emerald-300">
                    Payment marked as {selectedOrder.paymentMethod?.toUpperCase()} on{' '}
                    {selectedOrder.codSettledAt
                      ? new Date(selectedOrder.codSettledAt).toLocaleString()
                      : new Date(selectedOrder.updatedAt || selectedOrder.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
