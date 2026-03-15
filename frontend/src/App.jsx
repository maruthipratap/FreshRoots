import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import FarmerDashboard from './pages/FarmerDashboard'
import AddProductPage from './pages/AddProductPage'
import BrowsePage from './pages/BrowsePage'
import OrderPage from './pages/OrderPage'
import OrderStatusPage from './pages/OrderStatusPage'
import EditProductPage from './pages/EditProductPage'
import FarmerProfilePage from './pages/FarmerProfilePage'
import FarmStoryPage from './pages/FarmStoryPage'
import FarmStoryViewPage from './pages/FarmStoryViewPage'
import NotificationsPage from './pages/NotificationsPage'
import HarvestCalendarPage from './pages/HarvestCalendarPage'
import AddHarvestPage from './pages/AddHarvestPage'
import HarvestBrowsePage from './pages/HarvestBrowsePage'

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
        <Route path="/" element={<HomePage />} />
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
        <Route path="/farmer/edit-product/:id" element={
          <ProtectedRoute>
            <EditProductPage />
          </ProtectedRoute>
        } />
        <Route path="/farmer/profile" element={
          <ProtectedRoute>
            <FarmerProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/farmer/farm-story" element={<FarmStoryPage />} />
        <Route path="/farm/:farmerId" element={<FarmStoryViewPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/farmer/harvests" element={<HarvestCalendarPage />} />
        <Route path="/farmer/add-harvest" element={<AddHarvestPage />} />
        <Route path="/harvests" element={<HarvestBrowsePage />} />
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