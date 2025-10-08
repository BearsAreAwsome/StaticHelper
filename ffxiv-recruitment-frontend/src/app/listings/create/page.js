'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'

const DATA_CENTERS = ['Aether', 'Crystal', 'Primal', 'Dynamis']

const SERVERS = {
  'Aether': ['Adamantoise', 'Cactuar', 'Faerie', 'Gilgamesh', 'Jenova', 'Midgardsormr', 'Sargatanas', 'Siren'],
  'Crystal': ['Balmung', 'Brynhildr', 'Coeurl', 'Diabolos', 'Goblin', 'Malboro', 'Mateus', 'Zalera'],
  'Primal': ['Behemoth', 'Excalibur', 'Exodus', 'Famfrit', 'Hyperion', 'Lamia', 'Leviathan', 'Ultros'],
  'Dynamis': ['Halicarnassus', 'Maduin', 'Marilith', 'Seraph']
}

const CONTENT_TYPES = [
  { value: 'savage', label: 'Savage' },
  { value: 'ultimate', label: 'Ultimate' },
  { value: 'extreme', label: 'Extreme' },
  { value: 'chaotic', label: 'Chaotic' },
  { value: 'criterion', label: 'Criterion' },
  { value: 'alliance_raid', label: 'Alliance Raid' },
  { value: 'normal_raid', label: 'Normal Raid' },
  { value: 'dungeon', label: 'Dungeon' }
]

const VOICE_CHAT_OPTIONS = ['Discord', 'Teamspeak', 'Mumble', 'In-game', 'Other', 'None']

export default function CreateListingPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: '',
    content_name: '',
    data_center: '',
    server: '',
    voice_chat: '',
    additional_info: '',
    state: 'private'
  })
  
  const [rolesNeeded, setRolesNeeded] = useState({
    tank: 0,
    healer: 0,
    dps: 0
  })
  
  const [schedule, setSchedule] = useState([''])
  const [requirements, setRequirements] = useState([{ key: '', value: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const { error: showError, success } = useNotification()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'data_center') {
      setFormData(prev => ({
        ...prev,
        data_center: value,
        server: ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleRoleChange = (role, value) => {
    setRolesNeeded(prev => ({
      ...prev,
      [role]: parseInt(value) || 0
    }))
  }

  const handleScheduleChange = (index, value) => {
    const newSchedule = [...schedule]
    newSchedule[index] = value
    setSchedule(newSchedule)
  }

  const addScheduleSlot = () => {
    setSchedule([...schedule, ''])
  }

  const removeScheduleSlot = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index))
  }

  const handleRequirementChange = (index, field, value) => {
    const newRequirements = [...requirements]
    newRequirements[index][field] = value
    setRequirements(newRequirements)
  }

  const addRequirement = () => {
    setRequirements([...requirements, { key: '', value: '' }])
  }

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title || !formData.description || !formData.content_type || !formData.data_center) {
      showError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // Build roles_needed object (only include non-zero values)
      const roles = {}
      Object.entries(rolesNeeded).forEach(([role, count]) => {
        if (count > 0) roles[role] = count
      })

      // Build requirements object (only include filled requirements)
      const reqs = {}
      requirements.forEach(req => {
        if (req.key && req.value) {
          reqs[req.key] = req.value
        }
      })

      // Build schedule array (only include non-empty)
      const scheduleArray = schedule.filter(s => s.trim())

      const listingData = {
        title: formData.title,
        description: formData.description,
        content_type: formData.content_type,
        content_name: formData.content_name || undefined,
        data_center: formData.data_center,
        server: formData.server || undefined,
        roles_needed: roles,
        schedule: scheduleArray,
        requirements: reqs,
        voice_chat: formData.voice_chat || undefined,
        additional_info: formData.additional_info || undefined,
        state: formData.state
      }

      const response = await api.post('/listings', listingData)
      success('Listing created successfully!')
      router.push(`/listings/${response.data.id}`)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/listings"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to listings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create Recruitment Listing
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in the details to start recruiting for your static
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., M4S Static LF Tank & Healer"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe your static, goals, and what you're looking for..."
              />
            </div>

            {/* Content Type & Name */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="content_type"
                  name="content_type"
                  required
                  value={formData.content_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Content Type</option>
                  {CONTENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="content_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Name
                </label>
                <input
                  type="text"
                  id="content_name"
                  name="content_name"
                  value={formData.content_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Anabaseios Savage"
                />
              </div>
            </div>

            {/* Data Center & Server */}
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

              {formData.data_center && (
                <div>
                  <label htmlFor="server" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Server
                  </label>
                  <select
                    id="server"
                    name="server"
                    value={formData.server}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Server (Optional)</option>
                    {SERVERS[formData.data_center]?.map(server => (
                      <option key={server} value={server}>{server}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Voice Chat */}
            <div>
              <label htmlFor="voice_chat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voice Chat Platform
              </label>
              <select
                id="voice_chat"
                name="voice_chat"
                value={formData.voice_chat}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Voice Chat</option>
                {VOICE_CHAT_OPTIONS.map(vc => (
                  <option key={vc} value={vc}>{vc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Roles Needed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Roles Needed
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="tank" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanks
              </label>
              <input
                type="number"
                id="tank"
                min="0"
                max="8"
                value={rolesNeeded.tank}
                onChange={(e) => handleRoleChange('tank', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="healer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Healers
              </label>
              <input
                type="number"
                id="healer"
                min="0"
                max="8"
                value={rolesNeeded.healer}
                onChange={(e) => handleRoleChange('healer', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="dps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                DPS
              </label>
              <input
                type="number"
                id="dps"
                min="0"
                max="8"
                value={rolesNeeded.dps}
                onChange={(e) => handleRoleChange('dps', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Raid Schedule
            </h2>
            <button
              type="button"
              onClick={addScheduleSlot}
              className="inline-flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Time
            </button>
          </div>

          <div className="space-y-3">
            {schedule.map((time, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => handleScheduleChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Tuesday 8PM EST"
                />
                {schedule.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScheduleSlot(index)}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Requirements
            </h2>
            <button
              type="button"
              onClick={addRequirement}
              className="inline-flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Requirement
            </button>
          </div>

          <div className="space-y-3">
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={req.key}
                  onChange={(e) => handleRequirementChange(index, 'key', e.target.value)}
                  className="w-1/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., min_ilvl"
                />
                <input
                  type="text"
                  value={req.value}
                  onChange={(e) => handleRequirementChange(index, 'value', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 630"
                />
                {requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Additional Information
          </h2>
          
          <textarea
            name="additional_info"
            rows={4}
            value={formData.additional_info}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Any additional details, expectations, or information..."
          />
        </div>

        {/* Visibility */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Listing Visibility
          </h2>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="state"
                value="private"
                checked={formData.state === 'private'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3">
                <span className="block text-gray-900 dark:text-white font-medium">Private</span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Only you can see this listing
                </span>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="state"
                value="recruiting"
                checked={formData.state === 'recruiting'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3">
                <span className="block text-gray-900 dark:text-white font-medium">Recruiting</span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Visible to everyone and accepting applications
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </button>
          <Link
            href="/listings"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}