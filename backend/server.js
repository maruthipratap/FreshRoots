const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorMiddleware')

// Load environment variables
dotenv.config()

// Create the express app
const app = express()

// Security Headers
app.use(helmet())

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true)
      } else {
        return callback(new Error('Not allowed by CORS'), false)
      }
    },
    credentials: true
  })
)

// Rate limiting for auth and OTP endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api/auth/send-otp', authLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Body parser with size limit to prevent DoS
app.use(express.json({ limit: '10mb' }))

// Routes
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const harvestRoutes = require('./routes/harvestRoutes')
const negotiationRoutes = require('./routes/negotiationRoutes')
const subscriptionRoutes = require('./routes/subscriptionRoutes')
const groupBuyRoutes = require('./routes/groupBuyRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/harvest', harvestRoutes)
app.use('/api/negotiations', negotiationRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/groupbuy', groupBuyRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🌱 FreshRoots API is running!' })
})

// Global Error Handler Middleware
app.use(errorHandler)

// Start the server after DB connection is confirmed
const startServer = async () => {
  await connectDB()
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`🌱 Server running on port ${PORT}`)
  })
}

startServer()