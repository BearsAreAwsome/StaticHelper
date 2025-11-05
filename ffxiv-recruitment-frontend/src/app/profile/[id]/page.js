'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, MessageCircle, Edit, Calendar, Award } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { error: showError } = useNotification()
  const { user } = useAuth()

  useEffect(() => {
    if (params.id) {
      fetchProfile()
    }
  }, [params.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/users/${params.id}`)
      setProfile(response.data)
    } catch (error) {
      showError('Failed to fetch profile')
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Profile not found</p>
          <Link href="/listings" className="text-primary-600 hover:text-primary-500">
            Back to listings
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = user && user.id === profile.id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/listings"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {profile.username?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {profile.username}
                </h1>
                {profile.character_name && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-1">
                    {profile.character_name}
                  </p>
                )}

                {/* Location */}
                {(profile.data_center || profile.server) && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>
                      {profile.data_center}
                      {profile.server && ` - ${profile.server}`}
                    </span>
                  </div>
                )}

                {/* Roles */}
                {profile.roles && profile.roles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.roles.map(role => (
                      <span
                        key={role}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                About
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Availability */}
          {profile.availability && profile.availability.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Availability
                </h2>
              </div>
              <ul className="space-y-2">
                {profile.availability.map((time, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">
                    • {time}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progression */}
          {profile.progression && Object.keys(profile.progression).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Progression
                </h2>
              </div>
              <div className="space-y-3">
                {Object.entries(profile.progression).map(([type, content]) => (
                  <div key={type}>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
                      {type}:
                    </p>
                    {Array.isArray(content) ? (
                      <div className="flex flex-wrap gap-2">
                        {content.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Section */}
        {!isOwnProfile && (
          <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Interested?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you're recruiting, consider reaching out to this player
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                title="Message player (coming soon)"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </button>
              <button
                className="px-4 py-2 border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition font-medium"
                title="Add to favorites (coming soon)"
              >
                Add to Favorites
              </button>
            </div>
          </div>
        )}

        {/* Member Since */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}