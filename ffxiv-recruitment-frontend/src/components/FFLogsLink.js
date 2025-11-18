'use client'

import { useState } from 'react'
import { Link as LinkIcon, Unlink, RefreshCw, AlertCircle, CheckCircle, ExternalLink, Zap } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'

export default function FFLogsLink({ user, onUpdate }) {
  const [isLinking, setIsLinking] = useState(false)
  const [formData, setFormData] = useState({
    character_name: '',
    server: '',
    region: 'North America'
  })
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const { error: showError, success } = useNotification()

  const handleLinkSubmit = async (e) => {
    e.preventDefault()

    if (!formData.character_name.trim() || !formData.server.trim()) {
      showError('Please enter character name and server')
      return
    }

    setIsLinking(true)

    try {
      const response = await api.post('/fflogs/link', {
        character_name: formData.character_name.trim(),
        server: formData.server.trim(),
        region: formData.region
      })

      success('FFLogs account linked successfully!')
      setFormData({ character_name: '', server: '', region: 'North America' })
      setShowLinkForm(false)
      onUpdate(response.data.user)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to link FFLogs account')
    } finally {
      setIsLinking(false)
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)

    try {
      const response = await api.post('/fflogs/verify')
      success('FFLogs data refreshed successfully!')
      onUpdate(response.data.user)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to verify FFLogs account')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to unlink your FFLogs account?')) {
      return
    }

    setIsUnlinking(true)

    try {
      const response = await api.post('/fflogs/unlink')
      success('FFLogs account unlinked')
      onUpdate(response.data.user)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to unlink FFLogs account')
    } finally {
      setIsUnlinking(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          FFLogs Integration
        </h2>
      </div>

      {user?.fflogs_id ? (
        // Linked state
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-green-900 dark:text-green-100">Account Linked</h3>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                FFLogs ID: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded font-mono text-xs">{user.fflogs_id}</code>
              </p>
              {user.fflogs_verified_at && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                  Last verified: {new Date(user.fflogs_verified_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
              {isVerifying ? 'Refreshing...' : 'Refresh Data'}
            </button>

            <button
              onClick={handleUnlink}
              disabled={isUnlinking}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition font-medium"
            >
              <Unlink className="w-4 h-4" />
              {isUnlinking ? 'Unlinking...' : 'Unlink'}
            </button>
          </div>

          {/* Display linked character info */}
          {user.character_name && user.server && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Linked Character
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Character</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.character_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Server</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.server}</p>
                </div>
                {user.fflogs_region && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Region</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.fflogs_region}</p>
                  </div>
                )}
              </div>

              <a
                href={`https://www.fflogs.com/character/id/${user.fflogs_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View on FFLogs
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      ) : (
        // Not linked state
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900 dark:text-amber-100">Not Linked</h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                Link your FFLogs account to showcase your raid performance and rankings.
              </p>
            </div>
          </div>

          {!showLinkForm ? (
            <button
              onClick={() => setShowLinkForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium"
            >
              <LinkIcon className="w-4 h-4" />
              Link FFLogs Account
            </button>
          ) : (
            <form onSubmit={handleLinkSubmit} className="space-y-3">
              <div>
                <label htmlFor="character_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Character Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="character_name"
                  name="character_name"
                  value={formData.character_name}
                  onChange={handleChange}
                  placeholder="e.g., Cloud Strife"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="server" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Server <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="server"
                  name="server"
                  value={formData.server}
                  onChange={handleChange}
                  placeholder="e.g., Gilgamesh"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Japan">Japan</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLinking || !formData.character_name.trim() || !formData.server.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition font-medium"
                >
                  {isLinking ? 'Linking...' : 'Link Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkForm(false)
                    setFormData({ character_name: '', server: '', region: 'NA' })
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="mb-1">💡 <strong>Tip:</strong> Make sure your FFLogs profile is not set to hidden.</p>
            <p>Your character name and server must match exactly as they appear on FFLogs.</p>
          </div>
        </div>
      )}
    </div>
  )
}