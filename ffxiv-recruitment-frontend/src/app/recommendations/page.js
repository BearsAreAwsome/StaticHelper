'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Zap, TrendingUp, MapPin, Users, Clock, BookOpen } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'

export default function RecommendedListingsPage() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState('all')
  const router = useRouter()
  const { error: showError } = useNotification()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchRecommendations()
    }
  }, [user, authLoading, router])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/search/recommended')
      setRecommendations(response.data.recommendations || [])
    } catch (error) {
      showError('Failed to fetch recommendations')
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (filterTab === 'perfect') return rec.matchScore >= 80
    if (filterTab === 'good') return rec.matchScore >= 60 && rec.matchScore < 80
    if (filterTab === 'explore') return rec.matchScore < 60
    return true
  })

  const stats = {
    perfect: recommendations.filter(r => r.matchScore >= 80).length,
    good: recommendations.filter(r => r.matchScore >= 60 && r.matchScore < 80).length,
    explore: recommendations.filter(r => r.matchScore < 60).length
  }

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getMatchLabel = (score) => {
    if (score >= 80) return 'Perfect Match'
    if (score >= 60) return 'Good Match'
    return 'Explore'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recommended for You
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Listings matched to your profile, data center, and roles
          </p>
        </div>

        {/* Recommendation Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="Perfect Matches"
            value={stats.perfect}
            color="bg-green-500"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Good Matches"
            value={stats.good}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="Explore"
            value={stats.explore}
            color="bg-blue-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <TabButton
              label="All Recommendations"
              count={recommendations.length}
              active={filterTab === 'all'}
              onClick={() => setFilterTab('all')}
            />
            <TabButton
              label="Perfect Matches"
              count={stats.perfect}
              active={filterTab === 'perfect'}
              onClick={() => setFilterTab('perfect')}
              color="text-green-600"
            />
            <TabButton
              label="Good Matches"
              count={stats.good}
              active={filterTab === 'good'}
              onClick={() => setFilterTab('good')}
              color="text-yellow-600"
            />
            <TabButton
              label="Explore"
              count={stats.explore}
              active={filterTab === 'explore'}
              onClick={() => setFilterTab('explore')}
              color="text-blue-600"
            />
          </div>
        </div>

        {/* Recommendations List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filterTab === 'all' ? 'No Recommendations Yet' : `No ${getMatchLabel(filterTab === 'perfect' ? 80 : 60)} Listings`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filterTab === 'all' 
                ? 'Complete your profile to see recommendations'
                : 'Try adjusting your filters'}
            </p>
            {filterTab !== 'all' && (
              <button
                onClick={() => setFilterTab('all')}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                View all recommendations
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => (
              <RecommendedListingCard
                key={recommendation.listing.id}
                recommendation={recommendation}
                userRoles={user.roles}
              />
            ))}
          </div>
        )}

        {/* Profile Completion Hint */}
        {recommendations.length === 0 && !loading && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Improve Your Recommendations
            </h3>
            <p className="text-blue-800 dark:text-blue-300 mb-4">
              Complete your profile to get better recommendations:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2 mb-4">
              <li>✓ Add your character name and server</li>
              <li>✓ Select your preferred roles</li>
              <li>✓ Write a bio about your experience</li>
              <li>✓ Set your availability schedule</li>
            </ul>
            <Link
              href="/profile/edit"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Complete Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`${color} p-4 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function TabButton({ label, count, active, onClick, color = 'text-gray-600' }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-medium transition border-b-2 flex-1 ${
        active
          ? `border-primary-600 text-primary-600 dark:text-primary-400`
          : `border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`
      }`}
    >
      {label} <span className="ml-2 text-sm">({count})</span>
    </button>
  )
}

function RecommendedListingCard({ recommendation, userRoles }) {
  const listing = recommendation.listing
  const matchScore = recommendation.matchScore
  const reasons = recommendation.reasons || []

  const getMatchBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          {/* Left side - Listing info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getMatchBadgeColor(matchScore)}`}>
                <Star className="w-3 h-3 mr-1" />
                {matchScore}% {matchScore >= 80 ? 'Perfect' : matchScore >= 60 ? 'Good' : 'Explore'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                {listing.content_type.toUpperCase()}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {listing.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {listing.description}
            </p>

            {/* Key Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{listing.data_center} {listing.server && `- ${listing.server}`}</span>
              </div>

              {listing.roles_needed && Object.keys(listing.roles_needed).length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {Object.entries(listing.roles_needed)
                      .filter(([_, count]) => count > 0)
                      .map(([role, count]) => `${count} ${role}`)
                      .join(', ')}
                  </span>
                </div>
              )}

              {listing.schedule && listing.schedule.length > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{listing.schedule[0]}</span>
                </div>
              )}
            </div>

            {/* Match Reasons */}
            {reasons.length > 0 && (
              <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">Why matched:</p>
                <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  {reasons.slice(0, 3).map((reason, idx) => (
                    <li key={idx}>✓ {reason}</li>
                  ))}
                  {reasons.length > 3 && <li>+ {reasons.length - 3} more</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Right side - Recruiter info */}
          <div className="ml-6 text-right">
            {listing.owner && (
              <div className="mb-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white text-lg font-semibold mx-auto mb-2">
                  {listing.owner.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {listing.owner.username}
                </p>
                {listing.owner.character_name && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {listing.owner.character_name}
                  </p>
                )}
              </div>
            )}

            <div className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition">
              View & Apply →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}