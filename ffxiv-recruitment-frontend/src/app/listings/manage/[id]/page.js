'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Users, Clock, CheckCircle, XCircle, Mail, User as UserIcon } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'

export default function ManageListingPage() {
  const [listing, setListing] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('all')
  const params = useParams()
  const router = useRouter()
  const { error: showError, success } = useNotification()
  const { user } = useAuth()

  useEffect(() => {
    if (params.id) {
      fetchListing()
      fetchApplications()
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

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/applications/listing/${params.id}`)
      setApplications(response.data.applications || [])
    } catch (error) {
      showError('Failed to fetch applications')
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus })
      success(`Application ${newStatus}!`)
      fetchApplications()
    } catch (error) {
      showError('Failed to update application status')
    }
  }

  const handleStateChange = async (newState) => {
    try {
      await api.patch(`/listings/${params.id}/state`, { state: newState })
      success('Listing state updated!')
      fetchListing()
    } catch (error) {
      showError('Failed to update listing state')
    }
  }

  const handleDeleteListing = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return

    try {
      await api.delete(`/listings/${params.id}`)
      success('Listing deleted successfully')
      router.push('/listings')
    } catch (error) {
      showError('Failed to delete listing')
    }
  }

  const filteredApplications = applications.filter(app => {
    if (selectedTab === 'all') return true
    return app.status === selectedTab
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  }

  if (loading && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Listing not found</p>
          <Link href="/listings" className="text-primary-600 hover:text-primary-500">
            Back to listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/listings/${params.id}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to listing
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Manage Listing
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {listing.title}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Link
                href={`/listings/manage/${params.id}/suggested`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Users className="w-4 h-4 mr-2" />
                Find Players
              </Link>
              <Link
                href={`/listings/${params.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                View Public
              </Link>
              <button
                onClick={handleDeleteListing}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Applications" value={stats.total} icon={<Users className="w-5 h-5" />} color="bg-blue-500" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="bg-yellow-500" />
          <StatCard label="Accepted" value={stats.accepted} icon={<CheckCircle className="w-5 h-5" />} color="bg-green-500" />
          <StatCard label="Rejected" value={stats.rejected} icon={<XCircle className="w-5 h-5" />} color="bg-red-500" />
        </div>

        {/* Listing State Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Listing State
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleStateChange('private')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                listing.state === 'private'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Private
            </button>
            <button
              onClick={() => handleStateChange('recruiting')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                listing.state === 'recruiting'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Recruiting
            </button>
            <button
              onClick={() => handleStateChange('filled')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                listing.state === 'filled'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Filled
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Current state: <span className="font-medium">{listing.state}</span>
          </p>
        </div>

        {/* Applications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <TabButton
                label="All"
                count={stats.total}
                active={selectedTab === 'all'}
                onClick={() => setSelectedTab('all')}
              />
              <TabButton
                label="Pending"
                count={stats.pending}
                active={selectedTab === 'pending'}
                onClick={() => setSelectedTab('pending')}
              />
              <TabButton
                label="Accepted"
                count={stats.accepted}
                active={selectedTab === 'accepted'}
                onClick={() => setSelectedTab('accepted')}
              />
              <TabButton
                label="Rejected"
                count={stats.rejected}
                active={selectedTab === 'rejected'}
                onClick={() => setSelectedTab('rejected')}
              />
            </div>
          </div>

          {/* Applications List */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedTab === 'all' 
                    ? 'No applications yet'
                    : `No ${selectedTab} applications`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium transition border-b-2 ${
        active
          ? 'border-primary-600 text-primary-600 dark:text-primary-400'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label} <span className="ml-1">({count})</span>
    </button>
  )
}

function ApplicationCard({ application, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return styles[status] || styles.pending
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
            {application.applicant?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {application.applicant?.username || 'Unknown'}
            </h3>
            {application.applicant?.character_name && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {application.applicant.character_name} - {application.applicant.server}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Applied {new Date(application.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(application.status)}`}>
          {application.status.toUpperCase()}
        </span>
      </div>

      {/* Quick Info */}
      <div className="flex gap-4 mb-3">
        {application.preferred_roles && application.preferred_roles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Roles:</span>
            {application.preferred_roles.map(role => (
              <span key={role} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs">
                {role}
              </span>
            ))}
          </div>
        )}
        {application.experience && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Experience:</span> {application.experience}
          </div>
        )}
      </div>

      {/* Message Preview */}
      {application.message && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {application.message}
          </p>
          {application.message.length > 100 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary-600 dark:text-primary-400 mt-1"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
          {expanded && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {application.message}
            </p>
          )}
        </div>
      )}

      {/* Availability */}
      {expanded && application.availability && application.availability.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Availability:</p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside">
            {application.availability.map((time, index) => (
              <li key={index}>{time}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {application.status === 'pending' && (
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onStatusChange(application.id, 'accepted')}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept
          </button>
          <button
            onClick={() => onStatusChange(application.id, 'rejected')}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </button>
        </div>
      )}

      {application.status !== 'pending' && (
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onStatusChange(application.id, 'pending')}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium text-sm"
          >
            Move to Pending
          </button>
        </div>
      )}
    </div>
  )
}