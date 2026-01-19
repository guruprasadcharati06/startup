import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Service from '../models/Service.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

const services = [
  {
    title: 'Home Deep Cleaning',
    description: 'Comprehensive deep cleaning for apartments including kitchen and bathrooms.',
    category: 'Home Services',
    type: 'service',
    price: 2499,
    duration: '4-6 hours',
    imageUrl: 'https://example.com/images/home-cleaning.jpg',
  },
  {
    title: 'Air Conditioner Repair',
    description: 'On-site diagnosis and repair for split and window AC units.',
    category: 'Appliance Repair',
    type: 'service',
    price: 799,
    duration: '1-2 hours',
    imageUrl: 'https://example.com/images/ac-repair.jpg',
  },
  {
    title: 'Premium Dog Grooming',
    description: 'Full grooming package including bath, haircut, and nail trimming for dogs.',
    category: 'Pet Services',
    type: 'service',
    price: 1599,
    duration: '2 hours',
    imageUrl: 'https://example.com/images/dog-grooming.jpg',
  },
  {
    title: 'Hearty Grain Bowl',
    description: 'Quinoa, roasted veggies, grilled paneer, and citrus dressing for a mid-day boost.',
    category: 'Food & Beverage',
    type: 'item',
    price: 449,
    mealType: 'lunch',
    duration: 'Ready in 20 mins',
    imageUrl: 'https://images.unsplash.com/photo-1604908177035-5c1462d09ef0?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Yoga at Home - 5 Sessions',
    description: 'Certified yoga instructor conducting five personalized sessions at your home.',
    category: 'Wellness',
    type: 'service',
    price: 3499,
    duration: '5 sessions',
    imageUrl: 'https://example.com/images/yoga-home.jpg',
  },
  {
    title: 'Gourmet Pasta Platter',
    description: 'Slow-cooked tomato basil sauce with handcrafted fettuccine and garlic bread.',
    category: 'Food & Beverage',
    type: 'item',
    price: 549,
    mealType: 'dinner',
    duration: 'Ready in 25 mins',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Garden Maintenance Visit',
    description: 'Monthly garden maintenance including trimming, fertilizing, and cleanup.',
    category: 'Home Services',
    type: 'service',
    price: 1899,
    duration: '3 hours',
    imageUrl: 'https://example.com/images/garden-maintenance.jpg',
  },
];

const seedServices = async () => {
  try {
    await connectDB();
    await Service.deleteMany();
    await Service.insertMany(services);

    console.log('Services seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedServices();
