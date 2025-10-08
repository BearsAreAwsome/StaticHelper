'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Plus, Users, Clock, MapPin } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'

const DATA_CENTERS = ['Aether', 'Crystal', 'Primal', 'Dynamis']
const CONTENT_TYPES = ['savage', 'ultimate', 'extreme', 'chaotic', 'criterion']

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    data_center: '',
    content_type: '',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const { error: showError } = useNotification()
  const { user } = useAuth()

  useEffect(() => {
    fetchListings()
  }, [filters.data_center, filters.content_type])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.data_center) params.append('data_center', filters.data_center)
      if (filters.content_type) params.append('content_type', filters.content_type)
      
      const response = await api.get(`/listings?${params.toString()}`)
      setListings(response.data.listings || [])
    } catch (error) {
      showError('Failed to fetch listings')
      console.error('Error fetching listings:', error)
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
      content_type: '',
      search: ''
    })
  }

  const filteredListings = listings.filter(listing => {
    if (!filters.search) return true
    const searchLower = filters.search.toLowerCase()
    return (
      listing.title.toLowerCase().includes(searchLower) ||
      listing.description.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Listings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find your perfect static group
          </p>
        </div>
        {user && (
          <Link
            href="/listings/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Listing
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search listings..."
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
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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

            {/* Content Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Type
              </label>
              <select
                value={filters.content_type}
                onChange={(e) => handleFilterChange('content_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Content Types</option>
                {CONTENT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
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
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          {loading ? 'Loading...' : `${filteredListings.length} listings found`}
        </p>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No listings found matching your criteria
          </p>
          <button
            onClick={clearFilters}
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Clear filters and try again
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}

function ListingCard({ listing }) {
  const getStateBadge = (state) => {
    const colors = {
      recruiting: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      filled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      private: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
    return colors[state] || colors.recruiting
  }

  const getContentTypeBadge = (type) => {
    const colors = {
      savage: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      ultimate: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      extreme: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      chaotic: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      criterion: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
    return colors[type] || colors.savage
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStateBadge(listing.state)}`}>
                {listing.state.toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getContentTypeBadge(listing.content_type)}`}>
                {listing.content_type.toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {listing.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Data Center & Server */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{listing.data_center}</span>
            {listing.server && <span className="ml-1">- {listing.server}</span>}
          </div>

          {/* Roles Needed */}
          {listing.roles_needed && Object.keys(listing.roles_needed).length > 0 && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 mr-2" />
              <span>
                {Object.entries(listing.roles_needed).map(([role, count]) => 
                  `${count} ${role}`
                ).join(', ')}
              </span>
            </div>
          )}

          {/* Schedule */}
          {listing.schedule && listing.schedule.length > 0 && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              <span>{listing.schedule[0]}</span>
              {listing.schedule.length > 1 && (
                <span className="ml-1">+{listing.schedule.length - 1} more</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2">
              {listing.owner?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-sm">
              <p className="text-gray-900 dark:text-white font-medium">
                {listing.owner?.username || 'Unknown'}
              </p>
              {listing.owner?.character_name && (
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  {listing.owner.character_name}
                </p>
              )}
            </div>
          </div>
          {listing.can_apply && (
            <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
              Apply Now →
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}