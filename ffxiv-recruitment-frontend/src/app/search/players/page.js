'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, User, MapPin, Star, X } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'

const DATA_CENTERS = ['Aether', 'Crystal', 'Primal', 'Dynamis']
const ROLES = ['Tank', 'Healer', 'DPS']

export default function SearchPlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    data_center: '',
    server: '',
    role: '',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const { error: showError } = useNotification()
  const { user } = useAuth()

  useEffect(() => {
    fetchPlayers()
  }, [filters.data_center, filters.server, filters.role])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.data_center) params.append('data_center', filters.data_center)
      if (filters.server) params.append('server', filters.server)
      if (filters.role) params.append('role', filters.role)
      
      const response = await api.get(`/search/players?${params.toString()}`)
      setPlayers(response.data.players || [])
    } catch (error) {
      showError('Failed to fetch players')
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      data_center: '',
      server: '',
      role: '',
      search: ''
    })
  }

  const filteredPlayers = players.filter(player => {
    if (!filters.search) return true
    const searchLower = filters.search.toLowerCase()
    return (
      player.username?.toLowerCase().includes(searchLower) ||
      player.character_name?.toLowerCase().includes(searchLower) ||
      player.bio?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Search Players
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find players for your static based on data center, role, and experience
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by username, character name, or bio..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Data Center Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Center
                </label>
                <select
                  value={filters.data_center}
                  onChange={(e) => handleFilterChange('data_center', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Data Centers</option>
                  {DATA_CENTERS.map(dc => (
                    <option key={dc} value={dc}>{dc}</option>
                  ))}
                </select>
              </div>

              {/* Server Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Server
                </label>
                <input
                  type="text"
                  value={filters.server}
                  onChange={(e) => handleFilterChange('server', e.target.value)}
                  placeholder="Any server"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Roles</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(filters.data_center || filters.server || filters.role) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {filters.data_center && (
                <FilterBadge
                  label={`DC: ${filters.data_center}`}
                  onRemove={() => handleFilterChange('data_center', '')}
                />
              )}
              {filters.server && (
                <FilterBadge
                  label={`Server: ${filters.server}`}
                  onRemove={() => handleFilterChange('server', '')}
                />
              )}
              {filters.role && (
                <FilterBadge
                  label={`Role: ${filters.role}`}
                  onRemove={() => handleFilterChange('role', '')}
                />
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `${filteredPlayers.length} players found`}
          </p>
        </div>

        {/* Players Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No players found matching your criteria
            </p>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Clear filters and try again
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map(player => (
              <PlayerCard key={player.id} player={player} currentUser={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
      {label}
      <button onClick={onRemove} className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

function PlayerCard({ player, currentUser }) {
  return (
    <Link href={`/profile/${player.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer h-full">
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
            {player.roles.map(role => (
              <span
                key={role}
                className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {player.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
            {player.bio}
          </p>
        )}

        {/* Progression */}
        {player.progression && Object.keys(player.progression).length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
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

        {/* View Profile CTA */}
        <div className="mt-4 text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center">
          View Profile
          <span className="ml-1">→</span>
        </div>
      </div>
    </Link>
  )
}