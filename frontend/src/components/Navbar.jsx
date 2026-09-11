/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUnreadCount } from '../services/api'
import { FreshRootsLogo } from './Icons'
import {
  LayoutDashboard,
  Calendar,
  Package,
  Handshake,
  User,
  ShoppingBag,
  Users,
  Bell,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount()
      setUnreadCount(res.data.count)
    } catch {
      // Keep navigation usable if notification count fails.
    }
  }

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

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  const farmerLinks = [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard, primary: true },
    { to: '/farmer/harvests', label: 'Harvests', icon: Calendar },
    { to: '/farmer/subscription-boxes', label: 'Boxes', icon: Package },
    { to: '/farmer/negotiations', label: 'Deals', icon: Handshake },
    { to: '/farmer/profile', label: 'Profile', icon: User },
  ]

  const buyerLinks = [
    { to: '/browse', label: 'Browse', icon: ShoppingBag, primary: true },
    { to: '/harvests', label: 'Harvests', icon: Calendar },
    { to: '/group-buys', label: 'Groups', icon: Users },
    { to: '/subscription-boxes', label: 'Boxes', icon: Package },
    { to: '/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/buyer/negotiations', label: 'Deals', icon: Handshake },
  ]

  const mobileFarmerLinks = [
    ...farmerLinks,
    { to: '/farmer/add-product', label: 'Add Product', icon: PlusCircle },
  ]

  const mobileBuyerLinks = [
    ...buyerLinks,
    { to: '/my-subscriptions', label: 'My Subscriptions', icon: Package },
    { to: '/my-group-buys', label: 'My Group Buys', icon: Users },
    { to: '/notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: Bell },
  ]

  const activeLinks = user?.role === 'farmer' ? farmerLinks : buyerLinks
  const mobileLinks = user?.role === 'farmer' ? mobileFarmerLinks : mobileBuyerLinks

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur-md'
          : 'border-b border-neutral-100 bg-white'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <FreshRootsLogo className="h-10 w-10 shrink-0" />
          <span>
            <span className="block text-xl font-bold leading-none tracking-tight text-primary-700 font-display">
              FreshRoots
            </span>
            <span className="block text-xs font-medium text-neutral-500">Soil to Soul</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full bg-neutral-100/80 px-3 py-1 text-xs font-medium text-neutral-700 border border-neutral-200/50">
                <span className="text-neutral-500">Welcome,</span>
                <span className="font-semibold text-neutral-900">{user.name}</span>
                <span className="badge badge-primary py-0.5 text-[10px] capitalize font-bold">
                  {user.role}
                </span>
              </div>

              <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-4">
                {activeLinks.map((link) => {
                  const IconComp = link.icon
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={
                        link.primary
                          ? 'btn-primary px-4 py-2 text-sm shadow-sm hover:shadow flex items-center gap-1.5'
                          : 'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-600 hover:bg-primary-50 hover:text-primary-700 transition-colors'
                      }
                    >
                      {IconComp && <IconComp className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  )
                })}

                <Link
                  to="/notifications"
                  className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span>Alerts</span>
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-xs font-bold text-white shadow-sm animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-500 hover:bg-accent-50 hover:text-accent-600 transition-colors border-l border-neutral-200 pl-4"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-neutral-700 hover:text-primary-700 px-3 py-2">
                Login
              </Link>
              <Link to="/register" className="btn-accent px-5 py-2.5 text-sm shadow-sm hover:shadow flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-xl p-2 text-neutral-800 hover:bg-neutral-100 md:hidden transition-colors"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-200 bg-white/95 backdrop-blur-lg px-4 py-4 md:hidden shadow-lg animate-reveal-up">
          {user ? (
            <>
              <div className="mb-3 border-b border-neutral-200/80 pb-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-800">{user.name}</div>
                  <div className="text-xs font-medium capitalize text-neutral-500">
                    {user.role} {user.location ? `• ${user.location}` : ''}
                  </div>
                </div>
                <span className="badge badge-primary py-1 px-3 text-xs capitalize">{user.role}</span>
              </div>
              <div className="flex flex-col gap-1">
                {mobileLinks.map((link) => {
                  const IconComp = link.icon
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeMenu}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      {IconComp && <IconComp className="h-4 w-4 text-primary-600" />}
                      {link.label}
                    </Link>
                  )
                })}
                <button
                  onClick={handleLogout}
                  className="mt-2 flex items-center gap-2.5 rounded-xl border-t border-neutral-200 px-3.5 py-3 text-left text-sm font-bold text-accent-600 hover:bg-accent-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="grid gap-3 pt-1">
              <Link to="/login" onClick={closeMenu} className="btn-outline py-3 text-sm justify-center">
                Login
              </Link>
              <Link to="/register" onClick={closeMenu} className="btn-accent py-3 text-sm justify-center">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
