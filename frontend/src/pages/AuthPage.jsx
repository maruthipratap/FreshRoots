import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { sendOTP, registerUser, loginUser } from '../services/api'

export default function AuthPage({ mode }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  const defaultRole = searchParams.get('role') || 'buyer'
  const isRegister = mode === 'register'

  const [step, setStep] = useState(1) // step 1 = form, step 2 = otp
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    role: defaultRole,
    location: '',
    otp: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSendOTP = async () => {
    if (!form.phoneNumber || form.phoneNumber.length < 10) {
      toast.error('Enter a valid 10-digit phone number')
      return
    }
    if (isRegister && !form.name.trim()) {
      toast.error('Enter your name')
      return
    }
    setLoading(true)
    try {
      await sendOTP(form.phoneNumber)
      setStep(2)
      toast.success('OTP sent! Use 1234 for now')
    } catch (err) {
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.otp || form.otp.length < 4) {
      toast.error('Enter the 4-digit OTP')
      return
    }
    setLoading(true)
    try {
      let res
      if (isRegister) {
        res = await registerUser(form)
      } else {
        res = await loginUser({
          phoneNumber: form.phoneNumber,
          otp: form.otp
        })
      }
      const { token, ...userData } = res.data
      login(userData, token)
      toast.success(`Welcome, ${userData.name}! 🌱`)
      navigate(userData.role === 'farmer' ? '/farmer/dashboard' : '/browse')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-2xl font-bold text-green-800">
            {isRegister ? 'Join FreshRoots' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRegister ? 'Create your account' : 'Login to continue'}
          </p>
        </div>

        <div className="space-y-4">

          {step === 1 && (
            <>
              {/* Register only fields */}
              {isRegister && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full name"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['farmer', 'buyer'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`py-3 rounded-xl border-2 font-semibold capitalize transition ${
                            form.role === r
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-500'
                          }`}
                        >
                          {r === 'farmer' ? '👨‍🌾' : '🛒'} {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="City or Village"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </>
              )}

              {/* Phone number - both login and register */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  type="tel"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition"
              >
                {loading ? '⏳ Sending...' : '📱 Send OTP'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                OTP sent to <strong>{form.phoneNumber}</strong>
                <br />
                <span className="font-bold">Mock OTP: 1234</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition"
              >
                {loading ? '⏳ Verifying...' : isRegister ? '✅ Create Account' : '✅ Login'}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-400 hover:text-gray-600"
              >
                ← Change number
              </button>
            </>
          )}
        </div>

        {/* Switch between login and register */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {isRegister ? (
            <>Already have an account?{' '}
              <Link to="/login" className="text-green-600 font-semibold hover:underline">
                Login
              </Link>
            </>
          ) : (
            <>New here?{' '}
              <Link to="/register" className="text-green-600 font-semibold hover:underline">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}