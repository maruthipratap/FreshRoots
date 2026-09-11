import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { sendOTP, registerUser, loginUser } from '../services/api'
import { FreshRootsLogo } from '../components/Icons'
import {
  User,
  Tractor,
  ShoppingBag,
  Phone,
  ShieldCheck,
  MapPin,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

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
      toast.error('Enter your full name')
      return
    }
    setLoading(true)
    try {
      await sendOTP(form.phoneNumber)
      setStep(2)
      toast.success('OTP sent successfully! Use 1234')
    } catch {
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
      const { token, user } = res.data
      login(user, token)
      toast.success(`Welcome to FreshRoots, ${user.name}! 🌱`)
      navigate(user.role === 'farmer' ? '/farmer/dashboard' : '/browse')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-primary-50 via-neutral-50 to-primary-100/40 flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-xl reveal-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 mb-4 shadow-sm">
            <FreshRootsLogo className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 font-display">
            {isRegister ? 'Join FreshRoots' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            {isRegister ? 'Direct farm marketplace connection' : 'Log in with your verified phone number'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-neutral-100/80 p-1 mb-6 border border-neutral-200/50">
          <Link
            to="/login"
            className={`rounded-xl py-2 text-center text-xs font-bold transition-all ${
              !isRegister
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`rounded-xl py-2 text-center text-xs font-bold transition-all ${
              isRegister
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Create Account
          </Link>
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <>
              {isRegister && (
                <>
                  <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Farmer or Sarah Buyer"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">I am joining as a...</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, role: 'farmer' })}
                        className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 font-semibold text-xs transition-all ${
                          form.role === 'farmer'
                            ? 'border-primary-600 bg-primary-50/80 text-primary-800 shadow-sm'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <Tractor className="h-6 w-6 text-primary-600" />
                        <span>Farmer / Grower</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, role: 'buyer' })}
                        className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 font-semibold text-xs transition-all ${
                          form.role === 'buyer'
                            ? 'border-accent-500 bg-accent-50/80 text-accent-700 shadow-sm'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <ShoppingBag className="h-6 w-6 text-accent-500" />
                        <span>Buyer / Consumer</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">City / Village Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Pune, Maharashtra"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="label">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    type="tel"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base shadow-sm hover:shadow flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="rounded-2xl border border-primary-200 bg-primary-50/80 p-4 text-xs text-primary-800 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <div>Code sent to <strong>+91 {form.phoneNumber}</strong></div>
                  <div className="font-semibold text-primary-900 mt-1">Dev Test OTP Code: <span className="font-mono bg-white px-2 py-0.5 rounded border border-primary-200">1234</span></div>
                </div>
              </div>

              <div>
                <label className="label text-center">Enter 4-Digit OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-neutral-400" />
                  <input
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    placeholder="1234"
                    maxLength={4}
                    className="input-field pl-12 text-center text-2xl tracking-[0.5em] font-bold font-mono text-primary-700"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-accent w-full py-3.5 text-base shadow-sm hover:shadow flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{isRegister ? 'Complete Registration' : 'Log In Now'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full text-center text-xs font-semibold text-neutral-500 hover:text-neutral-800 pt-2"
              >
                ← Change Phone Number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}