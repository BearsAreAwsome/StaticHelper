'use client'

import { useState } from 'react'
import { Link as LinkIcon, Unlink, RefreshCw, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'

export default function LodestoneLink({ user, onUpdate }) {
  const [isLinking, setIsLinking] = useState(false)
  const [lodestoneId, setLodestoneId] = useState('')
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const { error: showError, success } = useNotification()

  const handleLinkSubmit = async (e) => {
    e.preventDefault()

    if (!lodestoneId.trim()) {
      showError('Please enter your Lodestone ID')
      return
    }

    setIsLinking(true)

    try {
      const response = await api.post('/users/lodestone/link', {
        lodestone_id: lodestoneId.trim()
      })

      success('Lodestone account linked successfully!')
      setLodestoneId('')
      setShowLinkForm(false)
      onUpdate(response.data.user)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to link Lodestone account')
    } finally {
      setIsLinking(false)
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)

    try {
      const response = await api.post('/users/lodestone/verify')
      success('Lodestone data refreshed successfully!')
      onUpdate(response.data.user)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to verify Lodestone account')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to unlink your Lodestone account?')) {
      return
    }

    setIsUnlinking(true)

    try {
      const response = await api.post('/users/lodestone/unlink')
      success('Lodestone account unlinked')
      onUpdate(response.data.user)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to unlink Lodestone account')
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Lodestone Integration
      </h2>

      {user?.lodestone_id ? (
        // Linked state
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-green-900 dark:text-green-100">Account Linked</h3>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                Lodestone ID: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded font-mono text-xs">{user.lodestone_id}</code>
              </p>
              {user.lodestone_verified_at && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                  Last verified: {new Date(user.lodestone_verified_at).toLocaleDateString()}
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

          {/* Display linked character info if available */}
          {(user.character_name || user.server || user.data_center) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Linked Character Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {user.character_name && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Character Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.character_name}</p>
                  </div>
                )}
                {user.server && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Server</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.server}</p>
                  </div>
                )}
                {user.data_center && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Data Center</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.data_center}</p>
                  </div>
                )}
                {user.grand_company && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Grand Company</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.grand_company}</p>
                  </div>
                )}
              </div>

              <a
                href={`https://na.finalfantasyxiv.com/lodestone/character/${user.lodestone_id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View on Lodestone
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
                Link your Lodestone account to automatically populate your character information.
              </p>
            </div>
          </div>

          {!showLinkForm ? (
            <button
              onClick={() => setShowLinkForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium"
            >
              <LinkIcon className="w-4 h-4" />
              Link Lodestone Account
            </button>
          ) : (
            <form onSubmit={handleLinkSubmit} className="space-y-3">
              <div>
                <label htmlFor="lodestone_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lodestone ID
                </label>
                <input
                  type="text"
                  id="lodestone_id"
                  value={lodestoneId}
                  onChange={(e) => setLodestoneId(e.target.value)}
                  placeholder="e.g., 38940235"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Find your ID in your Lodestone URL: https://na.finalfantasyxiv.com/lodestone/character/<strong>38940235</strong>/
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLinking || !lodestoneId.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition font-medium"
                >
                  {isLinking ? 'Linking...' : 'Link Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkForm(false)
                    setLodestoneId('')
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}