# Local Services + Item Selling Backend

A fully functional Node.js + Express backend for a local services and item-selling application. Includes user authentication (JWT), service/item CRUD, order creation, Razorpay sandbox integration, and MongoDB support.

## Project Structure

```
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── serviceController.js
│   └── orderController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   ├── Service.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── service.js
│   └── order.js
├── seed/
│   └── seedServices.js
├── utils/
│   ├── asyncHandler.js
│   └── response.js
├── .env
├── package.json
└── server.js
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB running locally or accessible via connection string
- Razorpay sandbox account for API keys

### Installation

1. Navigate to the project directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (copy from `.env` template provided):
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/local_services_db
   JWT_SECRET=your_jwt_secret_here
   RAZORPAY_KEY_ID=rzp_test_yourkeyid
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

### Running the Server

- Development mode with auto-restart:
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  npm start
  ```

Server will start at `http://localhost:5000` by default.

### Seeding Services/Items

Populate sample services/items:
```bash
npm run seed
```

## API Documentation

### Authentication

- **POST** `/api/auth/signup`
  - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "password123" }`
  - Response: JWT token and user info

- **POST** `/api/auth/login`
  - Body: `{ "email": "john@example.com", "password": "password123" }`
  - Response: JWT token and user info

### Services

- **GET** `/api/services`
  - Public endpoint to list active services/items.

- **POST** `/api/services`
  - Protected (Admin): Create a new service/item.

- **PUT** `/api/services/:id`
  - Protected (Admin): Update a service/item by ID.

- **DELETE** `/api/services/:id`
  - Protected (Admin): Delete a service/item by ID.

### Orders

- **POST** `/api/orders`
  - Protected: Create a Razorpay order for a selected service/item.

- **POST** `/api/orders/verify`
  - Protected: Verify payment signature and update order status.

- **GET** `/api/orders`
  - Protected: Fetch logged-in user orders.

## Testing with Postman

1. **Authentication**
   - Signup to create a user.
   - Login to receive JWT token (store token in Postman environment variable like `{{token}}`).
2. **Authenticated Requests**
   - Set `Authorization` header: `Bearer {{token}}`.
3. **Create Order**
   - Call `POST /api/orders` with `serviceId` from `/api/services` list.
   - Use Razorpay sandbox checkout with returned order details.
4. **Verify Payment**
   - Call `/api/orders/verify` with Razorpay `order_id`, `payment_id`, and `signature` from checkout.

## Connecting a Frontend Later

- You can pair this backend with a React frontend.
- Set a frontend `.env` with `REACT_APP_API_URL=http://localhost:5000` (or your hosted URL).
- Use `fetch` or `axios` to interact with endpoints, including sending JWT in headers for protected routes.

## License

MIT License.
