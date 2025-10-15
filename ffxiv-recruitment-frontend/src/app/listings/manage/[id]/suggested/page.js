'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, MapPin, Star, Mail } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'

export default function SuggestedPlayersPage() {
  const [listing, setListing] = useState(null)
  const [suggestedPlayers, setSuggestedPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const { error: showError } = useNotification()
  const { user } = useAuth()

  useEffect(() => {
    if (params.id) {
      fetchListing()
      fetchSuggestedPlayers()
    }
  }, [params.id])

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${params.id}`)
      setListing(response.data)
    } catch (error) {
      showError('Failed to fetch listing')
      console.error('Error fetching listing:', error)
    }
  }

  const fetchSuggestedPlayers = async () => {
    try {
      setLoading(true)
      // Get listing first to use its data center
      const listingResponse = await api.get(`/listings/${params.id}`)
      const listingData = listingResponse.data
      
      // Search for players in the same data center
      const params_obj = new URLSearchParams()
      if (listingData.data_center) {
        params_obj.append('data_center', listingData.data_center)
      }
      
      const response = await api.get(`/search/players?${params_obj.toString()}`)
      setSuggestedPlayers(response.data.players || [])
    } catch (error) {
      showError('Failed to fetch suggested players')
      console.error('Error fetching suggested players:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Calculate match score (simple algorithm)
  const getMatchScore = (player) => {
    let score = 0
    
    // Data center match (most important)
    if (player.data_center === listing.data_center) score += 50
    
    // Server match (bonus)
    if (player.server === listing.server) score += 20
    
    // Role match
    if (listing.roles_needed && player.roles) {
      const neededRoles = Object.keys(listing.roles_needed).filter(role => listing.roles_needed[role] > 0)
      const matchingRoles = player.roles.filter(role => neededRoles.includes(role.toLowerCase()))
      score += matchingRoles.length * 15
    }
    
    // Has bio (shows engagement)
    if (player.bio) score += 5
    
    // Has progression data
    if (player.progression && Object.keys(player.progression).length > 0) score += 10
    
    return Math.min(score, 100) // Cap at 100
  }

  const playersWithScores = suggestedPlayers
    .map(player => ({
      ...player,
      matchScore: getMatchScore(player)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/listings/manage/${params.id}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to manage listing
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Suggested Players
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Players that match your listing: <span className="font-medium">{listing.title}</span>
          </p>
        </div>

        {/* Listing Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Looking for:
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {listing.data_center}
                {listing.server && ` - ${listing.server}`}
              </p>
            </div>
            {listing.roles_needed && Object.keys(listing.roles_needed).length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Roles</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(listing.roles_needed).map(([role, count]) => 
                    count > 0 && (
                      <span key={role} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-sm">
                        {count} {role}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Content</p>
              <p className="text-gray-900 dark:text-white font-medium capitalize">
                {listing.content_type}
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `${playersWithScores.length} players found`}
          </p>
        </div>

        {/* Players Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : playersWithScores.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No players found in your data center yet
            </p>
            <Link
              href="/search/players"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Search all players
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playersWithScores.map(player => (
              <SuggestedPlayerCard key={player.id} player={player} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SuggestedPlayerCard({ player, listing }) {
  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getMatchLabel = (score) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    return 'Potential Match'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6">
      {/* Match Score Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Star className={`w-5 h-5 ${getMatchColor(player.matchScore)}`} />
          <span className={`text-sm font-semibold ${getMatchColor(player.matchScore)}`}>
            {player.matchScore}% {getMatchLabel(player.matchScore)}
          </span>
        </div>
      </div>

      {/* Avatar and Name */}
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold mr-4">
          {player.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {player.username}
          </h3>
          {player.character_name && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {player.character_name}
            </p>
          )}
        </div>
      </div>

      {/* Location */}
      {(player.data_center || player.server) && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4 mr-2" />
          <span>
            {player.data_center}
            {player.server && ` - ${player.server}`}
          </span>
        </div>
      )}

      {/* Roles */}
      {player.roles && player.roles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {player.roles.map(role => {
            const isNeeded = listing.roles_needed && 
                           Object.keys(listing.roles_needed).some(
                             neededRole => neededRole.toLowerCase() === role.toLowerCase() && 
                             listing.roles_needed[neededRole] > 0
                           )
            return (
              <span
                key={role}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isNeeded 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 ring-2 ring-green-500'
                    : 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                }`}
              >
                {role} {isNeeded && '✓'}
              </span>
            )
          })}
        </div>
      )}

      {/* Bio */}
      {player.bio && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {player.bio}
        </p>
      )}

      {/* Progression */}
      {player.progression && Object.keys(player.progression).length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mb-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Progression:
          </p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(player.progression).map(([type, content]) => (
              <span
                key={type}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                title={Array.isArray(content) ? content.join(', ') : content}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/profile/${player.id}`}
          className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
        >
          View Profile
        </Link>
        <button
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          title="Message player (coming soon)"
        >
          <Mail className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}