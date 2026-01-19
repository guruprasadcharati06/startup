# Local Services + Items Frontend

Modern React + Tailwind CSS + Framer Motion frontend for the Local Services & Item Selling platform. This frontend pairs with the provided Express + MongoDB backend and delivers a smooth, animated experience for customers browsing services, managing their cart, and completing Razorpay payments.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── auth.js
│   │   ├── client.js
│   │   ├── orders.js
│   │   ├── services.js
│   │   └── users.js
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── CartItem.jsx
│   │   ├── Input.jsx
│   │   ├── Loader.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── SkeletonCard.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── SplashContext.jsx
│   ├── hooks/
│   │   └── useAsync.js
│   ├── pages/
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Orders.jsx
│   │   ├── Profile.jsx
│   │   ├── ServiceDetails.jsx
│   │   ├── Settings.jsx
│   │   └── Signup.jsx
│   ├── utils/
│   │   ├── razorpay.js
│   │   └── storage.js
│   ├── App.js
│   ├── index.js
│   └── tailwind.css
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── webpack.config.js
```

## Prerequisites

- Node.js v18+
- The backend running locally (default: `http://localhost:5000`)
- Razorpay sandbox key ID exposed to the frontend (`process.env.RAZORPAY_KEY_ID`)

## Getting Started

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server (Tailwind + Webpack dev server with proxy to backend):
   ```bash
   npm start
   ```
   The app runs at `http://localhost:3000` and proxies API calls to `http://localhost:5000`.
3. For production build:
   ```bash
   npm run build
   ```

### Environment Configuration

- `webpack.config.js` injects `process.env.API_BASE_URL` and `process.env.RAZORPAY_KEY_ID` for runtime configuration.
- Optionally set these when starting the dev server:
  ```bash
  API_BASE_URL=https://your-backend-url RAZORPAY_KEY_ID=rzp_test_xxxx npm start
  ```

### Tailwind CSS Notes

The `@tailwind` and `@apply` directives inside `src/tailwind.css` are handled by PostCSS + Tailwind during the build step. IDE linters may warn about unknown at-rules; these are expected and can be ignored so long as Tailwind processing is enabled via `postcss.config.js`.

## Feature Highlights

- Splash screen with animated logo and transition to auth flow
- JWT authentication (login/signup) integrated with backend `/api/auth`
- Services listing with animated cards, skeleton loaders, and hover effects
- Service detail view with add-to-cart interactions
- Cart and Razorpay checkout flow using backend `/api/orders`
- Order history with animated timeline cards
- Profile and Settings pages with modals for editing details and password changes
- Toast notifications, modals, and responsive layout built with Tailwind

## Backend Endpoints Used

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/services`
- `GET /api/services/:id` *(optional; falls back to list filtering if absent)*
- `POST /api/orders`
- `POST /api/orders/verify`
- `GET /api/orders`
- `GET /api/users/profile`
- `PUT /api/users/profile`

> ⚠️ Ensure your backend exposes profile endpoints (`GET/PUT /api/users/profile`) returning and updating the authenticated user's data. If you are using the earlier backend scaffolding, you'll need to add these routes/controllers before profile edits work.

## Razorpay Integration

- The checkout page loads the Razorpay SDK on demand.
- After receiving an order payload from `/api/orders`, the app opens the Razorpay Checkout.
- The success handler invokes `/api/orders/verify` to finalize the order and update status.

## Connecting to a React Frontend Later

This repository already provides the frontend. To integrate with any custom frontend stack, reuse the API modules under `src/api/` as a reference for how to authenticate, fetch services, create orders, and update user profiles.

## Testing Tips

- Use the backend seed script to populate services.
- Use Postman or the in-app login form to create an account, then browse services.
- Razorpay sandbox will simulate payments; use their test card credentials.
- Inspect Redux-like context states via React DevTools (contexts: AuthContext, CartContext).

Happy building! ✨
