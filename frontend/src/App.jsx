import FarmerDashboard from './pages/FarmerDashboard'
import AddProductPage from './pages/AddProductPage'
import BrowsePage from './pages/BrowsePage'
import OrderPage from './pages/OrderPage'
import OrderStatusPage from './pages/OrderStatusPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthPage from './pages/AuthPage'

const Home = () => <div className="p-8 text-2xl">🌱 FreshRoots Home</div>

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/farmer/dashboard" element={
          <ProtectedRoute>
            <FarmerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/farmer/add-product" element={
          <ProtectedRoute>
            <AddProductPage />
          </ProtectedRoute>
        } />
        <Route path="/browse" element={
          <ProtectedRoute>
            <BrowsePage />
          </ProtectedRoute>
        } />
        <Route path="/product/:id" element={
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrderStatusPage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  )
}