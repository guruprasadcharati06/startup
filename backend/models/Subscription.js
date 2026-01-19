import mongoose from 'mongoose';

const DAY_STATUSES = ['upcoming', 'scheduled', 'delivered', 'skipped', 'cancelled'];

const deliverySchema = new mongoose.Schema(
  {
    label: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: DAY_STATUSES,
      default: 'upcoming',
    },
    notes: String,
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    dietType: {
      type: String,
      enum: ['veg', 'non-veg'],
      required: true,
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'spicy'],
      required: true,
    },
    deliveryTime: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: true,
    },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['weekly'],
      required: true,
      default: 'weekly',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'scheduled', 'paused', 'cancelled', 'completed'],
      default: 'scheduled',
    },
    paymentMethod: {
      type: String,
      enum: ['cod'],
      default: 'cod',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    totalDays: {
      type: Number,
      default: 7,
    },
    deliveredDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    preferences: {
      type: preferencesSchema,
      required: true,
    },
    deliveries: [deliverySchema],
    cancellationReason: String,
    lastDeliveryDate: Date,
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1, status: 1 });

subscriptionSchema.pre('save', function preSave(next) {
  if (!this.isModified('startDate') && !this.isModified('totalDays') && this.deliveries?.length) {
    return next();
  }

  const start = new Date(this.startDate);
  const totalDays = Math.max(1, this.totalDays || 7);
  const computedDeliveries = [];

  for (let i = 0; i < totalDays; i += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    computedDeliveries.push({
      label: `Day ${i + 1}`,
      date: current,
      status: i === 0 ? 'scheduled' : 'upcoming',
    });
  }

  this.deliveries = computedDeliveries;
  this.endDate = computedDeliveries[computedDeliveries.length - 1]?.date;

  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
