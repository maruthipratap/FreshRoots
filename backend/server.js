const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

// Load environment variables
dotenv.config()
connectDB()

// Create the express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

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

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🌱 Server running on port ${PORT}`)
})