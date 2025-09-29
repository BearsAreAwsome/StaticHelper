'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, User, LogOut, Search, FileText, MessageCircle } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-600">
              FFXIV Recruitment
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/listings" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              Browse Listings
            </Link>
            <Link 
              href="/search/players" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              Find Players
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/messages" 
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                    <User className="w-5 h-5" />
                    <span>{user.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                    <Link 
                      href="/profile/edit" 
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Edit Profile
                    </Link>
                    <Link 
                      href="/applications" 
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      My Applications
                    </Link>
                    <Link 
                      href="/listings/create" 
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Create Listing
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 dark:text-gray-300"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link 
              href="/listings" 
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
              onClick={() => setIsOpen(false)}
            >
              Browse Listings
            </Link>
            <Link 
              href="/search/players" 
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
              onClick={() => setIsOpen(false)}
            >
              Find Players
            </Link>
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/messages" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Messages
                </Link>
                <Link 
                  href="/profile/edit" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Edit Profile
                </Link>
                <Link 
                  href="/listings/create" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Create Listing
                </Link>
                <button 
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}