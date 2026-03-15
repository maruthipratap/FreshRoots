import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api'
})

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fr_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const sendOTP = (phoneNumber) => api.post('/auth/send-otp', { phoneNumber })
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')

// Products
export const getProducts = (params) => api.get('/products', { params })
export const getProductById = (id) => api.get(`/products/${id}`)
export const getProductsByFarmer = (farmerId) => api.get(`/products/farmer/${farmerId}`)
export const addProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// Orders
export const placeOrder = (data) => api.post('/orders', data)
export const getFarmerOrders = (farmerId) => api.get(`/orders/farmer/${farmerId}`)
export const getBuyerOrders = (buyerId) => api.get(`/orders/buyer/${buyerId}`)
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status })
export const updatePaymentStatus = (id) => api.patch(`/orders/${id}/payment`)
export const requestVerification = () => api.patch('/auth/request-verification')
export const adminVerifyFarmer = (userId, status) => api.patch(`/auth/admin/verify/${userId}`, { status })
export const setSeasonalDeal = (id, data) => api.patch(`/products/${id}/seasonal`, data)
export const updateFarmStory = (data) => api.patch('/auth/farm-story', data)
export const getFarmStory = (farmerId) => api.get(`/auth/farm-story/${farmerId}`)
export const geocodeLocation = (city) => 
  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`)
    .then(res => res.json())
export default api