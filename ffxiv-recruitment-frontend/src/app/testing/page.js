import Link from 'next/link'
import { Search, Users, TrendingUp, MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="h-lvh">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-test_home-400 to-test_home-900 text-white py-20">
        <div className="container mx-auto h-screen px-4 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center mt-[-10rem]">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Perfect FFXIV Static
            </h1>
            <p className="text-xl mb-8 text-test_home-100">
              Connect with players, form static groups, and conquer the hardest content in Eorzea
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/listings" 
                className="bg-white text-test_home-600 px-8 py-3 rounded-lg font-semibold hover:bg-test_home-50 transition"
              >
                Browse Listings
              </Link>
              <Link 
                href="/register" 
                className="bg-test_home-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-test_home-800 transition border-2 border-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    )
  }