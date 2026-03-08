import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <div>
            <div className="font-bold text-lg leading-none">FreshRoots</div>
            <div className="text-green-300 text-xs">Soil to Soul</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-green-200 text-sm">👋 {user.name}</span>
              <span className="bg-green-600 text-xs px-3 py-1 rounded-full capitalize">
                {user.role}
              </span>
              {user.role === 'farmer' ? (
                <>
                  <Link to="/farmer/dashboard" className="bg-white text-green-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition">
                    Dashboard
                  </Link>
                  <Link to="/farmer/profile" className="text-green-200 hover:text-white text-sm transition">
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/browse" className="bg-white text-green-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition">
                    Browse
                  </Link>
                  <Link to="/orders" className="text-green-200 hover:text-white text-sm transition">
                    My Orders
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="text-green-300 hover:text-white text-sm transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-green-200 hover:text-white text-sm transition">
                Login
              </Link>
              <Link to="/register" className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-900 px-4 py-4 flex flex-col gap-3 border-t border-green-700">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-green-700">
                <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-xl">
                  {user.role === 'farmer' ? '👨‍🌾' : '🛒'}
                </div>
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-green-300 text-xs capitalize">{user.role} · {user.location || 'No location'}</div>
                </div>
              </div>

              {user.role === 'farmer' ? (
                <>
                  <Link to="/farmer/dashboard" onClick={closeMenu}
                    className="flex items-center gap-3 py-2 text-white hover:text-green-300 transition">
                    📦 Dashboard
                  </Link>
                  <Link to="/farmer/profile" onClick={closeMenu}
                    className="flex items-center gap-3 py-2 text-white hover:text-green-300 transition">
                    👨‍🌾 My Profile
                  </Link>
                  <Link to="/farmer/add-product" onClick={closeMenu}
                    className="flex items-center gap-3 py-2 text-white hover:text-green-300 transition">
                    ➕ Add Product
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/browse" onClick={closeMenu}
                    className="flex items-center gap-3 py-2 text-white hover:text-green-300 transition">
                    🌿 Browse Products
                  </Link>
                  <Link to="/orders" onClick={closeMenu}
                    className="flex items-center gap-3 py-2 text-white hover:text-green-300 transition">
                    📋 My Orders
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 py-2 text-red-300 hover:text-red-200 transition mt-2 border-t border-green-700 pt-3"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}
                className="py-3 text-center text-white border border-green-600 rounded-xl hover:bg-green-800 transition">
                Login
              </Link>
              <Link to="/register" onClick={closeMenu}
                className="py-3 text-center bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}