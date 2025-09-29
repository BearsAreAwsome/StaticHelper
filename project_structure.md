# FFXIV Recruitment App - Next.js Project Structure

```
ffxiv-recruitment-frontend/
├── public/
│   ├── favicon.ico
│   └── images/
│       └── logo.png
├── src/
│   ├── app/
│   │   ├── layout.js                    # Root layout with navigation
│   │   ├── page.js                      # Home page
│   │   ├── globals.css                  # Global styles
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.js             # Login page
│   │   │   ├── register/
│   │   │   │   └── page.js             # Registration page
│   │   │   └── layout.js               # Auth layout (minimal nav)
│   │   ├── dashboard/
│   │   │   └── page.js                 # User dashboard
│   │   ├── profile/
│   │   │   ├── [id]/
│   │   │   │   └── page.js             # View user profile
│   │   │   └── edit/
│   │   │       └── page.js             # Edit own profile
│   │   ├── listings/
│   │   │   ├── page.js                 # Browse all listings
│   │   │   ├── [id]/
│   │   │   │   └── page.js             # View single listing
│   │   │   ├── create/
│   │   │   │   └── page.js             # Create new listing
│   │   │   └── manage/
│   │   │       └── [id]/
│   │   │           └── page.js         # Manage listing (recruiter view)
│   │   ├── applications/
│   │   │   └── page.js                 # View your applications
│   │   ├── messages/
│   │   │   └── page.js                 # Messaging center
│   │   └── search/
│   │       ├── players/
│   │       │   └── page.js             # Search players (for recruiters)
│   │       └── listings/
│   │           └── page.js             # Search listings (for players)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.js               # Main navigation bar
│   │   │   ├── Footer.js               # Footer component
│   │   │   └── Sidebar.js              # Optional sidebar for dashboard
│   │   ├── listings/
│   │   │   ├── ListingCard.js          # Card displaying listing summary
│   │   │   ├── ListingDetail.js        # Detailed listing view
│   │   │   ├── ListingForm.js          # Form for creating/editing listings
│   │   │   ├── ListingFilters.js       # Filter component for browsing
│   │   │   └── ApplicationList.js      # List of applications for recruiter
│   │   ├── profile/
│   │   │   ├── ProfileCard.js          # User profile card
│   │   │   ├── ProfileHeader.js        # Profile header with avatar
│   │   │   ├── ProgressionDisplay.js   # Display FFLogs progression data
│   │   │   └── CharacterInfo.js        # Display Lodestone character data
│   │   ├── search/
│   │   │   ├── SearchBar.js            # Main search input
│   │   │   ├── PlayerSearchResults.js  # Display player search results
│   │   │   └── AdvancedFilters.js      # Advanced search filters
│   │   ├── forms/
│   │   │   ├── LoginForm.js            # Login form component
│   │   │   ├── RegisterForm.js         # Registration form component
│   │   │   └── ApplicationForm.js      # Apply to listing form
│   │   ├── ui/
│   │   │   ├── Button.js               # Reusable button component
│   │   │   ├── Input.js                # Reusable input component
│   │   │   ├── Select.js               # Reusable select component
│   │   │   ├── Modal.js                # Modal dialog component
│   │   │   ├── Card.js                 # Generic card component
│   │   │   ├── Badge.js                # Badge for status indicators
│   │   │   ├── Loading.js              # Loading spinner
│   │   │   └── ErrorMessage.js         # Error display component
│   │   └── common/
│   │       ├── ProtectedRoute.js       # HOC for protected routes
│   │       └── RecommendationFeed.js   # Recommended listings/players feed
│   ├── lib/
│   │   ├── api.js                      # API client functions
│   │   ├── auth.js                     # Authentication utilities
│   │   ├── constants.js                # App constants (data centers, roles, etc.)
│   │   └── utils.js                    # General utility functions
│   ├── hooks/
│   │   ├── useAuth.js                  # Authentication hook
│   │   ├── useListings.js              # Listings data hook
│   │   ├── useProfile.js               # Profile data hook
│   │   └── useSearch.js                # Search functionality hook
│   ├── context/
│   │   ├── AuthContext.js              # Authentication context provider
│   │   └── NotificationContext.js      # Notification/toast context
│   └── styles/
│       └── components/                 # Component-specific styles if needed
├── .env.local                          # Environment variables (API URL, etc.)
├── .env.example                        # Example environment variables
├── .gitignore
├── next.config.js                      # Next.js configuration
├── package.json
├── jsconfig.json                       # JavaScript configuration
└── README.md
```

## Key Structure Decisions

### App Router (Next.js 13+)
Using the new App Router with the `app/` directory for:
- Built-in layouts and loading states
- Server and client components
- Better data fetching patterns

### Route Groups
- `(auth)/` - Groups auth pages with minimal layout
- Regular routes use the main layout with full navigation

### Component Organization
- **layout/** - Navigation and page structure
- **listings/** - All listing-related components
- **profile/** - Profile display components
- **search/** - Search and filtering components
- **forms/** - Form components
- **ui/** - Reusable UI primitives
- **common/** - Shared components

### Utility Folders
- **lib/** - Core utilities and API client
- **hooks/** - Custom React hooks for data fetching and state
- **context/** - React Context providers for global state

### Dynamic Routes
- `/profile/[id]` - View any user's profile
- `/listings/[id]` - View specific listing
- `/listings/manage/[id]` - Manage your listing as recruiter

## Next Steps

1. Initialize the Next.js project: `npx create-next-app@latest`
2. Set up Tailwind CSS for styling
3. Create the environment variables file
4. Build out the API client in `lib/api.js`
5. Set up authentication context
6. Start building components from the UI primitives up

Would you like me to create any specific files or components from this structure?