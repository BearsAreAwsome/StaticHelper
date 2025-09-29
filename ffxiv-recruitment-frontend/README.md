# FFXIV Recruitment Platform - Frontend

A Next.js-based web application for recruiting and finding static groups in Final Fantasy XIV.

## Features

- User authentication and profiles
- Create and browse recruitment listings
- Apply to static groups
- Search for players by progression
- Messaging system between recruiters and applicants
- Integration with FFLogs and Lodestone APIs
- Recommendation system for players and listings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (default: http://localhost:5000)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ffxiv-recruitment-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create environment variables
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your configuration:
```env
API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Utilities and API client
├── hooks/           # Custom React hooks
├── context/         # React context providers
└── styles/          # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for all available configuration options.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

```bash
npm run build
npm run start
```

## API Integration

The frontend communicates with the Flask backend API. Ensure the backend is running and the `API_BASE_URL` is correctly configured.

## Contributing

This is a class project. Please follow the project guidelines and milestones as outlined in the proposal.

## License

Educational project for coursework.