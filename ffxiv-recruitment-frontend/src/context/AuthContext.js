'use client'

import { createContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '@/lib/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth()
    setLoading(false)
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token')
      if (token) {
        // Verify token and get user data
        const response = await api.get('/auth/me')
        setUser(response.data)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      Cookies.remove('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      // Store token in cookie (expires in 7 days)
      Cookies.set('token', token, { expires: 7 })
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data
      
      // Store token in cookie
      Cookies.set('token', token, { expires: 7 })
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
    router.push('/')
  }

  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}