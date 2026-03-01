# 🌱 FreshRoots

> **Soil to Soul — Direct from Farmers**

FreshRoots is a full-stack farmer-to-buyer marketplace where farmers sell their products directly to buyers — homes, restaurants, shops, and bulk buyers — with zero middlemen.

## 🌐 Live Demo

- **App:** https://fresh-roots-kappa.vercel.app
- **API:** https://freshroots-api.onrender.com

## 📸 Features

### For Farmers 👨‍🌾
- Register and login with phone OTP
- Add products with images, price, quantity and category
- Edit or deactivate products
- View and accept/decline incoming orders
- Mark orders as completed
- Profile page with revenue and sales stats

### For Buyers 🛒
- Browse all available farm products
- Search by name, description or farmer
- Filter by category, price range and sort order
- Place orders with pickup or delivery option
- Mock payment flow
- Track order status with progress bar

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Mock OTP |
| Images | Cloudinary |
| Deployment | Vercel (frontend) + Render (backend) |

## 📁 Project Structure

```
FreshRoots/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary setup
│   ├── controllers/
│   │   ├── authController.js  # Register, login, OTP
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT protect, role guards
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── uploadRoutes.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProductCard.jsx
        │   └── ImageUpload.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── AuthPage.jsx
        │   ├── FarmerDashboard.jsx
        │   ├── FarmerProfilePage.jsx
        │   ├── AddProductPage.jsx
        │   ├── EditProductPage.jsx
        │   ├── BrowsePage.jsx
        │   ├── OrderPage.jsx
        │   └── OrderStatusPage.jsx
        └── services/
            └── api.js
```

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally
- Git

### 1. Clone the repo
```bash
git clone https://github.com/maruthipratap/FreshRoots.git
cd FreshRoots
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/freshroots
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/send-otp | Send OTP to phone |
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login with OTP |
| GET | /api/auth/me | Get current user |
| PATCH | /api/auth/profile | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products (with filters) |
| GET | /api/products/:id | Get single product |
| GET | /api/products/farmer/:id | Get farmer's products |
| POST | /api/products | Add product (farmer only) |
| PATCH | /api/products/:id | Update product (farmer only) |
| DELETE | /api/products/:id | Delete product (farmer only) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place order (buyer only) |
| GET | /api/orders/buyer/:id | Get buyer's orders |
| GET | /api/orders/farmer/:id | Get farmer's orders |
| PATCH | /api/orders/:id/status | Update order status |
| PATCH | /api/orders/:id/payment | Mock payment |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | Upload image to Cloudinary |

## 🔐 Auth Flow

1. Enter phone number → OTP sent (mock OTP: **1234**)
2. Enter OTP → receive JWT token
3. Token stored in localStorage
4. Token auto-attached to every API request

## 🗂 Git Workflow

```bash
# Daily development
git checkout dev
# ... make changes ...
git add .
git commit -m "feat: description"
git push origin dev

# Release to production
git push origin dev:main
```

### Commit Format
```
feat: add new feature
fix: fix a bug
refactor: improve code
docs: update documentation
chore: setup or config changes
```

## 🏆 Milestones

| Version | Description | Status |
|---------|-------------|--------|
| v0.1 | Project setup + Express server | ✅ |
| v0.2 | Auth API (OTP + JWT) | ✅ |
| v0.3 | Product CRUD | ✅ |
| v0.4 | Browse + Order placement | ✅ |
| v0.5 | Farmer dashboard + Order management | ✅ |
| v0.6 | Mock payment + Order status | ✅ |
| v1.0 | Homepage + Full MVP | ✅ |
| v1.1 | Edit product + Image upload | ✅ |
| v1.2 | Advanced search + Farmer profile | ✅ |
| v1.3 | Deployed on Render + Vercel | ✅ |

## 🌿 Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| PORT | Server port (default 5000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT signing |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |

### Frontend
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API base URL |

## 🛣 Roadmap

- [ ] Product ratings and reviews
- [ ] Farmer-buyer chat
- [ ] Real payment (Razorpay)
- [ ] Location-based filtering
- [ ] Sales analytics dashboard
- [ ] Push notifications
- [ ] Mobile app (React Native)

## 👨‍💻 Built By

**Maruthi Pratap** — Built from scratch while learning full-stack web development.

- GitHub: [@maruthipratap](https://github.com/maruthipratap)
- Project: [FreshRoots](https://github.com/maruthipratap/FreshRoots)

---

> Built with ❤️ for farmers. Zero middlemen. Full price. Fair trade.