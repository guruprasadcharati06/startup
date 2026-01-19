import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod', 'phonepe'],
      default: 'cod',
    },
    deliveryLocation: {
      type: String,
    },
    deliveryDetails: {
      recipientName: {
        type: String,
        trim: true,
      },
      contactNumber: {
        type: String,
        trim: true,
      },
      addressLine1: {
        type: String,
        trim: true,
      },
      addressLine2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      area: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
        },
        lng: {
          type: Number,
        },
      },
      distanceKm: {
        type: Number,
        min: [0, 'Delivery distance cannot be negative'],
      },
      distanceText: {
        type: String,
      },
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative'],
    },
    itemsTotal: {
      type: Number,
      default: 0,
      min: [0, 'Items total cannot be negative'],
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'mixed', 'custom'],
      lowercase: true,
      trim: true,
    },
    customItemName: {
      type: String,
      trim: true,
    },
    cartItems: [
      {
        itemId: {
          type: String,
        },
        title: {
          type: String,
        },
        mealType: {
          type: String,
          lowercase: true,
          trim: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          min: [0, 'Price cannot be negative'],
        },
        type: {
          type: String,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    codSettledAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
