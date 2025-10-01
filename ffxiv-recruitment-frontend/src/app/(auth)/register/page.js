'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'

const DATA_CENTERS = ['Aether', 'Crystal', 'Primal', 'Dynamis']

const SERVERS = {
  'Aether': ['Adamantoise', 'Cactuar', 'Faerie', 'Gilgamesh', 'Jenova', 'Midgardsormr', 'Sargatanas', 'Siren'],
  'Crystal': ['Balmung', 'Brynhildr', 'Coeurl', 'Diabolos', 'Goblin', 'Malboro', 'Mateus', 'Zalera'],
  'Primal': ['Behemoth', 'Excalibur', 'Exodus', 'Famfrit', 'Hyperion', 'Lamia', 'Leviathan', 'Ultros'],
  'Dynamis': ['Halicarnassus', 'Maduin', 'Marilith', 'Seraph']
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    characterName: '',
    dataCenter: '',
    server: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const { error: showError, success } = useNotification()
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // If data center changes, reset server
    if (name === 'dataCenter') {
      setFormData(prev => ({
        ...prev,
        dataCenter: value,
        server: ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      showError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        character_name: formData.characterName || undefined,
        data_center: formData.dataCenter || undefined,
        server: formData.server || undefined
      }

      const result = await register(userData)

      if (result.success) {
        success('Account created successfully!')
        router.push('/dashboard')
      } else {
        showError(result.error || 'Registration failed')
      }
    } catch (err) {
      showError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800"
                placeholder="Username"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800"
                placeholder="Email address"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800"
                placeholder="Password (min. 6 characters)"
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800"
                placeholder="Confirm password"
                disabled={isLoading}
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">
                  Optional FFXIV Info
                </span>
              </div>
            </div>

            {/* Character Name */}
            <div>
              <label htmlFor="characterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Character Name
              </label>
              <input
                id="characterName"
                name="characterName"
                type="text"
                value={formData.characterName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800"
                placeholder="Your in-game character name"
                disabled={isLoading}
              />
            </div>

            {/* Data Center */}
            <div>
              <label htmlFor="dataCenter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Center
              </label>
              <select
                id="dataCenter"
                name="dataCenter"
                value={formData.dataCenter}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800"
                disabled={isLoading}
              >
                <option value="">Select Data Center</option>
                {DATA_CENTERS.map(dc => (
                  <option key={dc} value={dc}>{dc}</option>
                ))}
              </select>
            </div>

            {/* Server */}
            {formData.dataCenter && (
              <div>
                <label htmlFor="server" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Server
                </label>
                <select
                  id="server"
                  name="server"
                  value={formData.server}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800"
                  disabled={isLoading}
                >
                  <option value="">Select Server</option>
                  {SERVERS[formData.dataCenter]?.map(server => (
                    <option key={server} value={server}>{server}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}