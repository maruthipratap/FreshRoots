import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-green-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">🌱</span>
        <div>
          <div className="font-bold text-xl leading-none">FreshRoots</div>
          <div className="text-green-300 text-xs">Soil to Soul</div>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-green-200 text-sm hidden sm:block">
              👋 {user.name}
            </span>
            <span className="bg-green-600 text-xs px-3 py-1 rounded-full capitalize">
              {user.role}
            </span>
            {user.role === 'farmer' ? (
              <Link
                to="/farmer/dashboard"
                className="bg-white text-green-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/browse"
                className="bg-white text-green-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition"
              >
                Browse
              </Link>
            )}
            {user.role === 'buyer' && (
              <Link
                to="/orders"
                className="text-green-200 hover:text-white text-sm transition"
              >
                My Orders
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-green-300 hover:text-white text-sm transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-green-200 hover:text-white text-sm transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}