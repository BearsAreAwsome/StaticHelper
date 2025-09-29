import Link from 'next/link'
import { Search, Users, TrendingUp, MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Perfect FFXIV Static
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Connect with players, form static groups, and conquer the hardest content in Eorzea
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/listings" 
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Browse Listings
              </Link>
              <Link 
                href="/register" 
                className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition border-2 border-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Use Our Platform?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Search className="w-12 h-12 text-primary-600" />}
              title="Advanced Search"
              description="Find players by progression, data center, and availability"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-primary-600" />}
              title="Easy Recruiting"
              description="Create detailed listings and manage applications in one place"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12 text-primary-600" />}
              title="FFLogs Integration"
              description="View player progression and performance automatically"
            />
            <FeatureCard
              icon={<MessageCircle className="w-12 h-12 text-primary-600" />}
              title="Direct Messaging"
              description="Contact recruiters and applicants directly through the platform"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="1000+" label="Active Players" />
            <StatCard number="250+" label="Static Groups" />
            <StatCard number="4" label="Data Centers" />
          </div>
        </div>
      </section>

      {/* Data Centers Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Available Data Centers
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <DataCenterCard name="Aether" color="bg-blue-500" />
            <DataCenterCard name="Crystal" color="bg-purple-500" />
            <DataCenterCard name="Primal" color="bg-red-500" />
            <DataCenterCard name="Dynamis" color="bg-orange-500" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Find Your Static?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join hundreds of players already using our platform
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

function StatCard({ number, label }) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary-600 mb-2">{number}</div>
      <div className="text-gray-600 dark:text-gray-300">{label}</div>
    </div>
  )
}

function DataCenterCard({ name, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-lg text-center font-semibold text-xl shadow-md hover:shadow-lg transition transform hover:scale-105`}>
      {name}
    </div>
  )
}