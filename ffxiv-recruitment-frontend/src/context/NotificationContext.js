'use client'

import { createContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type, duration }])

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }, [])

  const success = useCallback((message, duration) => {
    return addNotification(message, 'success', duration)
  }, [addNotification])

  const error = useCallback((message, duration) => {
    return addNotification(message, 'error', duration)
  }, [addNotification])

  const warning = useCallback((message, duration) => {
    return addNotification(message, 'warning', duration)
  }, [addNotification])

  const info = useCallback((message, duration) => {
    return addNotification(message, 'info', duration)
  }, [addNotification])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </NotificationContext.Provider>
  )
}

function NotificationContainer({ notifications, onRemove }) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

function Notification({ notification, onRemove }) {
  const { id, message, type } = notification

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  }

  return (
    <div 
      className={`${styles[type]} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 animate-slide-in`}
    >
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="hover:bg-white/20 rounded p-1 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}