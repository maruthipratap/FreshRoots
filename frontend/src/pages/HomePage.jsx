import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const categories = [
  { emoji: '🌾', name: 'Crops' },
  { emoji: '🥦', name: 'Vegetables' },
  { emoji: '🍎', name: 'Fruits' },
  { emoji: '🥛', name: 'Milk & Dairy' },
  { emoji: '🥩', name: 'Meat' },
  { emoji: '🥚', name: 'Eggs' },
  { emoji: '🫙', name: 'Farm-Made' },
]

const steps = [
  { icon: '👨‍🌾', title: 'Farmer Lists Products', desc: 'Farmers add their products with price and quantity directly.' },
  { icon: '🛒', title: 'Buyer Browses & Orders', desc: 'Buyers find nearby farms and order directly. No middlemen.' },
  { icon: '✅', title: 'Farmer Confirms', desc: 'The farmer receives and accepts the order.' },
  { icon: '💸', title: 'Fair Payment', desc: 'Buyers pay directly. Farmers get the full price.' },
]

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="bg-green-800 text-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-green-700 text-green-200 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            🌱 Direct from Farmers
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Fresh Food.<br />
            <span className="text-orange-400">Fair Trade.</span><br />
            No Middlemen.
          </h1>
          <p className="text-green-200 text-xl mb-4 leading-relaxed">
            FreshRoots is a direct farmer-to-buyer platform where farmers sell
            their products straight to buyers — homes, restaurants, shops, and
            bulk buyers — without middlemen.
          </p>
          <p className="text-green-300 text-lg mb-10">
            🧑‍🌾 Farmers decide the price. &nbsp;
            🛒 Buyers get fresh products. &nbsp;
            🤝 Trade stays fair.
          </p>

          {user ? (
            <div className="flex gap-4 justify-center flex-wrap">
              {user.role === 'farmer' ? (
                <Link
                  to="/farmer/dashboard"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <Link
                  to="/browse"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition"
                >
                  Browse Products →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/register?role=farmer"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition"
              >
                🌾 I'm a Farmer
              </Link>
              <Link
                to="/register?role=buyer"
                className="bg-white text-green-800 hover:bg-green-50 font-bold text-lg px-8 py-4 rounded-xl transition"
              >
                🛒 I'm a Buyer
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-orange-500 text-white py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '500+', label: 'Farmers' },
            { num: '50+', label: 'Product Types' },
            { num: '0', label: 'Middlemen' },
            { num: '100%', label: 'Fair Price' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold">{s.num}</div>
              <div className="text-orange-100 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOR FARMERS & BUYERS */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-green-500">
          <div className="text-4xl mb-4">👨‍🌾</div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">For Farmers</h2>
          <ul className="space-y-3 text-gray-600 mb-6">
            {[
              'Set your own price — no negotiation pressure',
              'List any quantity, big or small',
              'Receive orders directly on your phone',
              'Get paid instantly, no delays',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>
          <Link
            to="/register?role=farmer"
            className="inline-block bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Join as Farmer →
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-orange-400">
          <div className="text-4xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-orange-700 mb-4">For Buyers</h2>
          <ul className="space-y-3 text-gray-600 mb-6">
            {[
              'Buy directly from the source',
              'Know exactly who grew your food',
              'Fresh products at honest prices',
              'Pickup or delivery options',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>
          <Link
            to="/register?role=buyer"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Join as Buyer →
          </Link>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
            What's on FreshRoots?
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Everything that comes from a farm, directly to you.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                to={`/browse?category=${c.name.toLowerCase()}`}
                key={c.name}
                className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition hover:-translate-y-1 border border-gray-100"
              >
                <div className="text-4xl mb-2">{c.emoji}</div>
                <div className="font-semibold text-gray-700 text-sm">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
          How It Works
        </h2>
        <p className="text-center text-gray-500 mb-12">
          Four steps. Zero complexity.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="font-semibold text-gray-800 mb-2">{s.title}</div>
              <div className="text-sm text-gray-500">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-800 text-white py-16 text-center px-6">
        <h2 className="text-4xl font-bold mb-4">Ready to go middleman-free?</h2>
        <p className="text-green-200 mb-8 text-lg">
          Join hundreds of farmers and buyers already on FreshRoots.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/register?role=farmer"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition"
          >
            🌾 Start Selling
          </Link>
          <Link
            to="/register?role=buyer"
            className="bg-white text-green-800 hover:bg-green-50 font-bold text-lg px-8 py-4 rounded-xl transition"
          >
            🛒 Start Buying
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <div className="text-2xl mb-2">🌱</div>
        <div className="text-white font-bold text-lg">FreshRoots</div>
        <div className="text-gray-500 text-xs mt-1">Soil to Soul · Direct from Farmers</div>
        <div className="mt-4">© 2024 FreshRoots. Built with ❤️ for farmers.</div>
      </footer>
    </div>
  )
}