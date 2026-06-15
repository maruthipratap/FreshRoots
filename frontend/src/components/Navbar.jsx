import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUnreadCount } from '../services/api'
import { FreshRootsLogo } from './Icons'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!user) return
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount()
      setUnreadCount(res.data.count)
    } catch {
      // Keep navigation usable if notification count fails.
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  const farmerLinks = [
    { to: '/farmer/dashboard', label: 'Dashboard', primary: true },
    { to: '/farmer/harvests', label: 'Harvests' },
    { to: '/farmer/subscription-boxes', label: 'Boxes' },
    { to: '/farmer/negotiations', label: 'Deals' },
    { to: '/farmer/profile', label: 'Profile' },
  ]

  const buyerLinks = [
    { to: '/browse', label: 'Browse', primary: true },
    { to: '/harvests', label: 'Harvests' },
    { to: '/group-buys', label: 'Groups' },
    { to: '/subscription-boxes', label: 'Boxes' },
    { to: '/orders', label: 'Orders' },
    { to: '/buyer/negotiations', label: 'Deals' },
  ]

  const mobileFarmerLinks = [
    ...farmerLinks,
    { to: '/farmer/add-product', label: 'Add Product' },
  ]

  const mobileBuyerLinks = [
    ...buyerLinks,
    { to: '/my-subscriptions', label: 'My Subscriptions' },
    { to: '/my-group-buys', label: 'My Group Buys' },
    { to: '/notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
  ]

  const activeLinks = user?.role === 'farmer' ? farmerLinks : buyerLinks
  const mobileLinks = user?.role === 'farmer' ? mobileFarmerLinks : mobileBuyerLinks

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-neutral-200 bg-white/90 shadow-sm backdrop-blur-md'
          : 'border-neutral-100 bg-white'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 hover:opacity-85">
          <FreshRootsLogo className="h-10 w-10 shrink-0" />
          <span>
            <span className="block text-lg font-bold leading-none text-primary-700">FreshRoots</span>
            <span className="block text-xs text-neutral-500">Soil to Soul</span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-neutral-600">
                Welcome, <span className="font-semibold text-neutral-800">{user.name}</span>
              </span>
              <span className="badge badge-primary capitalize">{user.role}</span>

              {activeLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={
                    link.primary
                      ? 'btn-primary px-4 py-2 text-sm'
                      : 'text-sm font-medium text-neutral-600 hover:text-primary-700'
                  }
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/notifications"
                className="relative rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-primary-700"
                aria-label="Notifications"
              >
                Alerts
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-neutral-500 hover:text-accent-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-primary-700">
                Login
              </Link>
              <Link to="/register" className="btn-accent px-4 py-2 text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-neutral-800 hover:bg-neutral-100 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="sr-only">Toggle menu</span>
          <span className={`block h-0.5 w-6 bg-current transition-transform ${menuOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
          <span className={`my-1 block h-0.5 w-6 bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-current transition-transform ${menuOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-4 md:hidden">
          {user ? (
            <>
              <div className="mb-3 border-b border-neutral-200 pb-3">
                <div className="font-semibold text-neutral-800">{user.name}</div>
                <div className="text-xs capitalize text-neutral-500">
                  {user.role} {user.location ? `- ${user.location}` : ''}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {mobileLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-white hover:text-primary-700"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-lg border-t border-neutral-200 px-3 py-3 text-left text-sm font-semibold text-accent-600 hover:bg-white"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="grid gap-3">
              <Link to="/login" onClick={closeMenu} className="btn-outline py-3 text-sm">
                Login
              </Link>
              <Link to="/register" onClick={closeMenu} className="btn-accent py-3 text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
