# Gathering Governorships Dashboard

A Next.js dashboard for viewing governorship and bacenta statistics across different campus services.

## Features

- 🔐 **Password-protected login** (configurable app password)
- 🔒 **Server-side API authentication** (credentials never exposed to browser)
- 📊 **Real-time GraphQL data** from campus API
- 🎨 **Beautiful dark theme** with Tailwind CSS
- 📱 **Fully responsive** design
- ⚡ **Built with Next.js 15** and React 19

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Local Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your credentials:

   ```env
   API_EMAIL=your-api-email@example.com
   API_PASSWORD=your-api-password
   NEXT_PUBLIC_APP_PASSWORD=your-custom-app-password
   NEXT_PUBLIC_DEFAULT_CAMPUS_ID=your-campus-uuid
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/bgdashboard)

### Manual Deploy

1. **Push your code to GitHub** (make sure `.env.local` is NOT committed)

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository

3. **Add Environment Variables in Vercel:**

   In the Vercel project settings → Environment Variables, add:

   ```
   API_EMAIL=your-api-email@example.com
   API_PASSWORD=your-api-password
   NEXT_PUBLIC_APP_PASSWORD=your-app-password
   NEXT_PUBLIC_DEFAULT_CAMPUS_ID=your-campus-uuid
   ```

4. **Deploy!** Vercel will automatically build and deploy your app

5. **Access your dashboard** at `https://your-project.vercel.app`

## Environment Variables

| Variable                        | Required | Description                                          |
| ------------------------------- | -------- | ---------------------------------------------------- |
| `API_EMAIL`                     | ✅ Yes   | Email for API authentication (server-side only)      |
| `API_PASSWORD`                  | ✅ Yes   | Password for API authentication (server-side only)   |
| `NEXT_PUBLIC_APP_PASSWORD`      | No       | Dashboard login password (default: `flcadmin2025`)   |
| `NEXT_PUBLIC_DEFAULT_CAMPUS_ID` | No       | Campus ID to load on login (default: Revival campus) |

> ⚠️ **Security Note:** `API_EMAIL` and `API_PASSWORD` are only used server-side and are NEVER exposed to the browser.

## Architecture

- **`/app/page.tsx`** - Main page that renders the Dashboard component
- **`/components/Dashboard.tsx`** - Client-side dashboard UI with login and data display
- **`/app/api/auth/route.ts`** - Server API route that authenticates with the auth service
- **`/app/api/graphql/route.ts`** - Server API proxy that forwards GraphQL requests with authentication

## Service Categories

Data is automatically categorized into three services:

1. **Jesus Night** - Jesus Night stream
2. **Experience** - Galatians, Ephesians, Colossians, Philippians, Anagkazo Experience
3. **Holy Ghost Encounter** - Signs And Wonders HGE

Each service shows:

- Total Bacentas
- Total Governorships

## License

Private internal tool - Not for public distribution
