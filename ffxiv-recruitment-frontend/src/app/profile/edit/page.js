'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Check, AlertCircle, Loader } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'
import LodestoneLink from '@/components/LodestoneLink'

const DATA_CENTERS = ['Aether', 'Crystal', 'Primal', 'Dynamis']

const SERVERS = {
  'Aether': ['Adamantoise', 'Cactuar', 'Faerie', 'Gilgamesh', 'Jenova', 'Midgardsormr', 'Sargatanas', 'Siren'],
  'Crystal': ['Balmung', 'Brynhildr', 'Coeurl', 'Diabolos', 'Goblin', 'Malboro', 'Mateus', 'Zalera'],
  'Primal': ['Behemoth', 'Excalibur', 'Exodus', 'Famfrit', 'Hyperion', 'Lamia', 'Leviathan', 'Ultros'],
  'Dynamis': ['Halicarnassus', 'Maduin', 'Marilith', 'Seraph']
}

const ROLES = ['Tank', 'Healer', 'DPS']

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    character_name: '',
    data_center: '',
    server: '',
    bio: '',
    roles: [],
    availability: ['']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { error: showError, success } = useNotification()
  const { user, loading } = useAuth()

  const handleLodestoneUpdate = (updatedUser) => {
    // Update form data with Lodestone data
    setFormData(prev => ({
      ...prev,
      character_name: updatedUser.character_name || prev.character_name,
      data_center: updatedUser.data_center || prev.data_center,
      server: updatedUser.server || prev.server
    }))
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      // Load user data
      setFormData({
        character_name: user.character_name || '',
        data_center: user.data_center || '',
        server: user.server || '',
        bio: user.bio || '',
        roles: user.roles || [],
        availability: user.availability || ['']
      })
    }
  }, [user, loading, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'data_center') {
      setFormData(prev => ({
        ...prev,
        data_center: value,
        server: '' // Reset server when data center changes
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const handleAvailabilityChange = (index, value) => {
    const newAvailability = [...formData.availability]
    newAvailability[index] = value
    setFormData(prev => ({
      ...prev,
      availability: newAvailability
    }))
  }

  const addAvailabilitySlot = () => {
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, '']
    }))
  }

  const removeAvailabilitySlot = (index) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.character_name || !formData.data_center) {
      showError('Please fill in character name and data center')
      return
    }

    setIsSubmitting(true)

    try {
      const updateData = {
        character_name: formData.character_name,
        data_center: formData.data_center,
        server: formData.server || undefined,
        bio: formData.bio || undefined,
        roles: formData.roles,
        availability: formData.availability.filter(a => a.trim())
      }

      await api.put('/users/profile', updateData)
      success('Profile updated successfully!')
      router.push('/profile/edit')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/profile/${user.id}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to profile
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your information to help recruiters find you
          </p>
        </div>
        {/* Loadstone Linking */}
        <div className="space-y-6">
          <LodestoneLink user={user} onUpdate={handleLodestoneUpdate} />
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>
            
            <div className="space-y-4">
              {/* Username (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Username cannot be changed
                </p>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed. Contact support to update.
                </p>
              </div>
            </div>
          </div>
          {/* FFXIV Character Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              FFXIV Character Information
            </h2>
            
            <div className="space-y-4">
              {/* Character Name */}
              <div>
                <label htmlFor="character_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Character Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="character_name"
                  name="character_name"
                  required
                  value={formData.character_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your character name"
                />
              </div>

              {/* Data Center */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="data_center" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Center <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="data_center"
                    name="data_center"
                    required
                    value={formData.data_center}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Data Center</option>
                    {DATA_CENTERS.map(dc => (
                      <option key={dc} value={dc}>{dc}</option>
                    ))}
                  </select>
                </div>

                {/* Server */}
                <div>
                  <label htmlFor="server" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Server
                  </label>
                  <select
                    id="server"
                    name="server"
                    value={formData.server}
                    onChange={handleChange}
                    disabled={!formData.data_center}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Server</option>
                    {formData.data_center && SERVERS[formData.data_center]?.map(server => (
                      <option key={server} value={server}>{server}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* About You */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About You
            </h2>
            
            <div className="space-y-4">
              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tell recruiters about yourself, your experience, playstyle, etc."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Preferred Roles
                </label>
                <div className="flex gap-3">
                  {ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleToggle(role)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        formData.roles.includes(role)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Availability
              </h2>
              <button
                type="button"
                onClick={addAvailabilitySlot}
                className="inline-flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Time
              </button>
            </div>

            <div className="space-y-3">
              {formData.availability.map((time, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => handleAvailabilityChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Tuesday 8PM EST"
                  />
                  {formData.availability.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAvailabilitySlot(index)}
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              List times when you're typically available for raiding
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/profile/${user.id}`}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}