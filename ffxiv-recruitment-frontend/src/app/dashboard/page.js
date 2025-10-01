'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { User, FileText, MessageCircle, Search } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user.character_name && user.server && (
              <>Playing as {user.character_name} on {user.server}</>
            )}
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            href="/listings"
            icon={<Search className="w-8 h-8" />}
            title="Browse Listings"
            description="Find static groups recruiting"
            color="bg-blue-500"
          />
          <QuickActionCard
            href="/listings/create"
            icon={<FileText className="w-8 h-8" />}
            title="Create Listing"
            description="Recruit for your static"
            color="bg-green-500"
          />
          <QuickActionCard
            href="/applications"
            icon={<MessageCircle className="w-8 h-8" />}
            title="My Applications"
            description="View your applications"
            color="bg-purple-500"
          />
          <QuickActionCard
            href="/profile/edit"
            icon={<User className="w-8 h-8" />}
            title="Edit Profile"
            description="Update your information"
            color="bg-orange-500"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="My Listings"
            value="0"
            subtext="Active recruitment posts"
          />
          <StatCard
            label="Applications"
            value="0"
            subtext="Pending applications"
          />
          <StatCard
            label="Messages"
            value="0"
            subtext="Unread messages"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No recent activity yet. Start by browsing listings or creating your own!
          </p>
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ href, icon, title, description, color }) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer h-full">
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {description}
        </p>
      </div>
    </Link>
  )
}

function StatCard({ label, value, subtext }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-gray-500 dark:text-gray-500 text-xs">{subtext}</p>
    </div>
  )
}