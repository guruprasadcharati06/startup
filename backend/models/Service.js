import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['service', 'item'],
      default: 'service',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      lowercase: true,
      trim: true,
    },
    duration: {
      type: String,
      default: 'Flexible',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;
