const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')

//Load environment variables from .env file
dotenv.config()
connectDB()

//Create the express app
const app =express()

//Middleware - runs on every request
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

//test route
app.get('/', (req,res)=>{
    res.json({message : '🌱 FreshRoots API is running!'})
})

//Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () =>{
    console.log(`🌱 Server running on port ${PORT}`)
})
