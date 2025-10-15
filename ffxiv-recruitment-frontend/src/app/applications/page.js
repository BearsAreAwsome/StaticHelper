'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { useAuth } from '@/hooks/useAuth'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const { error: showError, success } = useNotification()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchApplications()
    }
  }, [user, authLoading, router])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/applications')
      setApplications(response.data.applications || [])
    } catch (error) {
      showError('Failed to fetch applications')
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return

    try {
      await api.delete(`/applications/${applicationId}`)
      success('Application withdrawn successfully')
      fetchApplications()
    } catch (error) {
      showError('Failed to withdraw application')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', icon: <Clock className="w-4 h-4" /> },
      accepted: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', icon: <CheckCircle className="w-4 h-4" /> },
      rejected: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', icon: <XCircle className="w-4 h-4" /> }
    }
    return styles[status] || styles.pending
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track the status of your recruitment applications
          </p>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Applications Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't applied to any listings yet
            </p>
            <Link
              href="/listings"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onWithdraw={handleWithdraw}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ApplicationCard({ application, onWithdraw, getStatusBadge }) {
  const statusStyle = getStatusBadge(application.status)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.icon}
              {application.status.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Applied {new Date(application.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Listing Info */}
          {application.listing && (
            <Link href={`/listings/${application.listing.id}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 mb-2">
                {application.listing.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                  {application.listing.content_type.toUpperCase()}
                </span>
                <span>{application.listing.data_center}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  application.listing.state === 'recruiting' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {application.listing.state.toUpperCase()}
                </span>
              </div>
            </Link>
          )}

          {/* Application Details */}
          {application.message && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Your message:</span> {application.message}
              </p>
            </div>
          )}

          {application.preferred_roles && application.preferred_roles.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Roles:</span>
              {application.preferred_roles.map(role => (
                <span key={role} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs">
                  {role}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {application.status === 'pending' && (
          <button
            onClick={() => onWithdraw(application.id)}
            className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            title="Withdraw application"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}