'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users, Clock, MessageCircle, Edit, Trash2, Calendar } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'

export default function ListingDetailPage() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { error: showError, success } = useNotification()
  const { user } = useAuth()

  useEffect(() => {
    if (params.id) {
      fetchListing()
    }
  }, [params.id])

  const fetchListing = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/listings/${params.id}`)
      setListing(response.data)
    } catch (error) {
      showError('Failed to fetch listing')
      console.error('Error fetching listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      setDeleting(true)
      await api.delete(`/listings/${params.id}`)
      success('Listing deleted successfully')
      router.push('/listings')
    } catch (error) {
      showError('Failed to delete listing')
    } finally {
      setDeleting(false)
    }
  }

  const getStateBadge = (state) => {
    const styles = {
      recruiting: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      filled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      private: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
    return styles[state] || styles.recruiting
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Listing not found</p>
        <Link href="/listings" className="text-primary-600 hover:text-primary-500">
          Back to listings
        </Link>
      </div>
    )
  }

  const isOwner = user && listing.owner_id === user.id

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/listings"
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to listings
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStateBadge(listing.state)}`}>
                    {listing.state.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {listing.content_type.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {listing.title}
                </h1>
                {listing.content_name && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {listing.content_name}
                  </p>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Link
                    href={`/listings/manage/${listing.id}`}
                    className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition"
                    title="Manage applications"
                  >
                    <Users className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/listings/manage/${listing.id}`}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                    title="Edit listing"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition disabled:opacity-50"
                    title="Delete listing"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <InfoItem
                icon={<MapPin className="w-5 h-5" />}
                label="Location"
                value={`${listing.data_center}${listing.server ? ` - ${listing.server}` : ''}`}
              />
              {listing.voice_chat && (
                <InfoItem
                  icon={<MessageCircle className="w-5 h-5" />}
                  label="Voice Chat"
                  value={listing.voice_chat}
                />
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Roles Needed */}
          {listing.roles_needed && Object.keys(listing.roles_needed).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Roles Needed
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(listing.roles_needed).map(([role, count]) => (
                  <div key={role} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          {listing.schedule && listing.schedule.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Raid Schedule
                </h2>
              </div>
              <ul className="space-y-2">
                {listing.schedule.map((time, index) => (
                  <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {time}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {listing.requirements && Object.keys(listing.requirements).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Requirements
              </h2>
              <div className="space-y-2">
                {Object.entries(listing.requirements).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {listing.additional_info && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Additional Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {listing.additional_info}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recruiter
            </h3>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white text-lg font-semibold mr-3">
                {listing.owner?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {listing.owner?.username || 'Unknown'}
                </p>
                {listing.owner?.character_name && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {listing.owner.character_name}
                  </p>
                )}
                {listing.owner?.server && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {listing.owner.server}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Apply Card */}
          {listing.can_apply && !isOwner && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Interested?
              </h3>
              {user ? (
                <ApplyForm listingId={listing.id} onSuccess={() => fetchListing()} />
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Sign in to apply for this listing
                  </p>
                  <Link
                    href="/login"
                    className="block w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-medium text-center"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Applications:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {listing.application_count || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Posted:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {new Date(listing.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center">
      <div className="text-gray-600 dark:text-gray-400 mr-3">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-gray-900 dark:text-white font-medium">{value}</p>
      </div>
    </div>
  )
}

function ApplyForm({ listingId, onSuccess }) {
  const [formData, setFormData] = useState({
    message: '',
    experience: '',
    availability: '',
    preferred_roles: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { error: showError, success } = useNotification()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const applicationData = {
        listing_id: listingId,
        message: formData.message,
        experience: formData.experience,
        availability: formData.availability.split('\n').filter(line => line.trim()),
        preferred_roles: formData.preferred_roles
      }

      await api.post('/applications', applicationData)
      success('Application submitted successfully!')
      if (onSuccess) onSuccess()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      preferred_roles: prev.preferred_roles.includes(role)
        ? prev.preferred_roles.filter(r => r !== role)
        : [...prev.preferred_roles, role]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Message to Recruiter
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="Tell them why you're a good fit..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preferred Roles
        </label>
        <div className="flex gap-2">
          {['Tank', 'Healer', 'DPS'].map(role => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleToggle(role)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                formData.preferred_roles.includes(role)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Experience
        </label>
        <input
          type="text"
          value={formData.experience}
          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="e.g., Cleared P9S-P11S"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Availability (one per line)
        </label>
        <textarea
          value={formData.availability}
          onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="Tuesday 8PM EST&#10;Thursday 8PM EST"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  )
}