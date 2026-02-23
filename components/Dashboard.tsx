'use client'

import { useState } from 'react'

const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || 'flcadmin2025'
const DEFAULT_CAMPUS_ID =
  process.env.NEXT_PUBLIC_DEFAULT_CAMPUS_ID ||
  '4b47fd67-fe9b-4bce-9baf-5e1f8921a3bb'

interface Stream {
  id?: string
  name: string
  bacentaCount?: number
  governorshipCount?: number
}

interface Campus {
  id: string
  name: string
  currency: string
  conversionRateToDollar: number
  noIncomeTracking: boolean
  streams: Stream[]
}

interface StreamDetail {
  name: string
  bacentas: number
  governorships: number
}

interface CategoryTotals {
  jesusNight: { bacentas: number; governorships: number; streams: StreamDetail[] }
  experience: { bacentas: number; governorships: number; streams: StreamDetail[] }
  hge: { bacentas: number; governorships: number; streams: StreamDetail[] }
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [campusId, setCampusId] = useState(DEFAULT_CAMPUS_ID)
  const [campus, setCampus] = useState<Campus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim() !== APP_PASSWORD) {
      setLoginError('Incorrect password')
      return
    }
    setLoginError('')
    setIsAuthenticated(true)
    await loadCampusData(DEFAULT_CAMPUS_ID)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setCampus(null)
  }

  const loadCampusData = async (id: string) => {
    if (!id) {
      setError('Please provide a campus ID')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query CampusGovernorships($id: ID!) {
              campuses(where: { id: $id }) {
                id
                name
                currency
                conversionRateToDollar
                noIncomeTracking
                streams {
                  name
                  bacentaCount
                  governorshipCount
                }
              }
            }
          `,
          variables: { id },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch campus data')
      }

      const result = await response.json()

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message || 'GraphQL error')
      }

      if (!result.data?.campuses || result.data.campuses.length === 0) {
        throw new Error('Invalid campus ID or data not found')
      }

      setCampus(result.data.campuses[0])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const categorizeAndSum = (streams: Stream[]): CategoryTotals => {
    const categories: CategoryTotals = {
      jesusNight: { bacentas: 0, governorships: 0, streams: [] },
      experience: { bacentas: 0, governorships: 0, streams: [] },
      hge: { bacentas: 0, governorships: 0, streams: [] },
    }

    const categoryMap = {
      jesusNight: ['jesus night'],
      experience: [
        'galatians',
        'ephesians',
        'colossians',
        'philippians',
        'anagkazo experience',
      ],
      hge: ['signs and wonders hge'],
    }

    streams.forEach((stream) => {
      const name = (stream.name || '').toLowerCase()
      const bacentas = Number(stream.bacentaCount ?? 0) || 0
      const governorships = Number(stream.governorshipCount ?? 0) || 0

      const streamDetail: StreamDetail = {
        name: stream.name,
        bacentas,
        governorships,
      }

      if (categoryMap.jesusNight.includes(name)) {
        categories.jesusNight.bacentas += bacentas
        categories.jesusNight.governorships += governorships
        categories.jesusNight.streams.push(streamDetail)
      }

      if (categoryMap.experience.includes(name)) {
        categories.experience.bacentas += bacentas
        categories.experience.governorships += governorships
        categories.experience.streams.push(streamDetail)
      }

      if (categoryMap.hge.includes(name)) {
        categories.hge.bacentas += bacentas
        categories.hge.governorships += governorships
        categories.hge.streams.push(streamDetail)
      }
    })

    return categories
  }

  const totals = campus ? categorizeAndSum(campus.streams) : null

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center px-4 bg-slate-950'>
        <div className='w-full max-w-md bg-slate-800 shadow-xl rounded-2xl p-8'>
          <h1 className='text-2xl font-semibold text-emerald-400 mb-6'>
            Gathering Governorships Dashboard
          </h1>
          <form onSubmit={handleLogin}>
            <label
              className='block text-sm text-slate-300 mb-2'
              htmlFor='password'
            >
              App Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500'
              placeholder='Enter app password'
            />
            <button
              type='submit'
              className='mt-6 w-full bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-semibold py-3 rounded-lg'
            >
              Login
            </button>
            {loginError && (
              <p className='mt-4 text-sm text-red-400'>{loginError}</p>
            )}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-100'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <h2 className='text-2xl font-semibold'>
            Gathering Governorships Dashboard
          </h2>
          <button
            onClick={handleLogout}
            className='bg-slate-800 hover:bg-slate-700 transition-colors text-slate-200 px-4 py-2 rounded-lg'
          >
            Logout
          </button>
        </div>

        <div className='mt-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6'>
          <div className='grid gap-4 md:grid-cols-[1fr_auto] items-end'>
            <div>
              <label
                className='block text-sm text-slate-300 mb-2'
                htmlFor='campusId'
              >
                Campus ID
              </label>
              <input
                id='campusId'
                type='text'
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className='w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                placeholder='e.g. 4b47fd67-fe9b-4bce-9baf-5e1f8921a3bb'
              />
            </div>
            <div>
              <button
                onClick={() => loadCampusData(campusId)}
                disabled={loading}
                className='w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50'
              >
                {loading ? 'Loading...' : 'Load Data'}
              </button>
              <p className='text-xs text-slate-400 mt-2'>
                Revival is preloaded
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className='mt-6'>
            <div className='bg-red-900/40 border border-red-700 text-red-200 px-4 py-3 rounded-lg'>
              {error}
            </div>
          </div>
        )}

        {campus && totals && (
          <div className='mt-8'>
            <div className='flex items-center gap-3'>
              <h3 className='text-3xl font-semibold text-emerald-400'>
                {campus.name}
              </h3>
            </div>
            <div className='mt-4 flex flex-wrap gap-2'>
              <span className='bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full'>
                Currency: {campus.currency || 'N/A'}
              </span>
              <span className='bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full'>
                USD Rate: {campus.conversionRateToDollar ?? 'N/A'}
              </span>
              <span className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full">
                Income Tracking:
                {campus.noIncomeTracking ? 'Disabled' : 'Enabled'}
              </span>
            </div>

            <div className='mt-8 grid gap-6 lg:grid-cols-3'>
              <div 
                className='bg-slate-800 shadow-lg rounded-xl p-6 cursor-pointer hover:bg-slate-750 transition-colors'
                onClick={() => setExpandedCard(expandedCard === 'jesusNight' ? null : 'jesusNight')}
              >
                <div className='flex items-center justify-between'>
                  <h4 className='text-lg font-semibold text-slate-200'>
                    Service - Jesus Night
                  </h4>
                  <svg 
                    className={`w-5 h-5 text-emerald-400 transition-transform ${expandedCard === 'jesusNight' ? 'rotate-180' : ''}`}
                    fill='none' 
                    stroke='currentColor' 
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>
                <p className='text-sm text-slate-400 mt-1'>
                  {totals.jesusNight.streams.length} Stream{totals.jesusNight.streams.length !== 1 ? 's' : ''}
                </p>
                <div className='mt-6'>
                  <p className='text-sm text-slate-400'>Total Bacentas</p>
                  <p className='text-4xl font-bold text-emerald-400'>
                    {totals.jesusNight.bacentas}
                  </p>
                </div>
                <div className='mt-4'>
                  <p className='text-sm text-slate-400'>Total Governorships</p>
                  <p className='text-4xl font-bold text-emerald-400'>
                    {totals.jesusNight.governorships}
                  </p>
                </div>
                {expandedCard === 'jesusNight' && totals.jesusNight.streams.length > 0 && (
                  <div className='mt-6 pt-6 border-t border-slate-700'>
                    <p className='text-sm font-semibold text-slate-300 mb-3'>Breakdown by Stream:</p>
                    <div className='space-y-3'>
                      {totals.jesusNight.streams.map((stream, idx) => (
                        <div key={idx} className='bg-slate-900/50 rounded-lg p-3'>
                          <p className='text-sm font-medium text-slate-200 mb-2'>{stream.name}</p>
                          <div className='flex gap-4 text-xs'>
                            <div>
                              <span className='text-slate-400'>Bacentas: </span>
                              <span className='text-emerald-400 font-semibold'>{stream.bacentas}</span>
                            </div>
                            <div>
                              <span className='text-slate-400'>Governorships: </span>
                              <span className='text-emerald-400 font-semibold'>{stream.governorships}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div 
                className='bg-slate-800 shadow-lg rounded-xl p-6 cursor-pointer hover:bg-slate-750 transition-colors'
                onClick={() => setExpandedCard(expandedCard === 'experience' ? null : 'experience')}
              >
                <div className='flex items-center justify-between'>
                  <h4 className='text-lg font-semibold text-slate-200'>
                    Service - Experience
                  </h4>
                  <svg 
                    className={`w-5 h-5 text-emerald-400 transition-transform ${expandedCard === 'experience' ? 'rotate-180' : ''}`}
                    fill='none' 
                    stroke='currentColor' 
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>
                <p className='text-sm text-slate-400 mt-1'>
                  {totals.experience.streams.length} Stream{totals.experience.streams.length !== 1 ? 's' : ''}
                </p>
                <div className='mt-6'>
                  <p className='text-sm text-slate-400'>Total Bacentas</p>
                  <p className='text-4xl font-bold text-emerald-400'>
                    {totals.experience.bacentas}
                  </p>
                </div>
                <div className='mt-4'>
                  <p className='text-sm text-slate-400'>Total Governorships</p>
                  <p className='text-4xl font-bold text-emerald-400'>
                    {totals.experience.governorships}
                  </p>
                </div>
                {expandedCard === 'experience' && totals.experience.streams.length > 0 && (
                  <div className='mt-6 pt-6 border-t border-slate-700'>
                    <p className='text-sm font-semibold text-slate-300 mb-3'>Breakdown by Stream:</p>
                    <div className='space-y-3'>
                      {totals.experience.streams.map((stream, idx) => (
                        <div key={idx} className='bg-slate-900/50 rounded-lg p-3'>
                          <p className='text-sm font-medium text-slate-200 mb-2'>{stream.name}</p>
                          <div className='flex gap-4 text-xs'>
                            <div>
                              <span className='text-slate-400'>Bacentas: </span>
                              <span className='text-emerald-400 font-semibold'>{stream.bacentas}</span>
                            </div>
                            <div>
                              <span className='text-slate-400'>Governorships: </span>
                              <span className='text-emerald-400 font-semibold'>{stream.governorships}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div 
                className='bg-slate-800 shadow-lg rounded-xl p-6 cursor-pointer hover:bg-slate-750 transition-colors'
                onClick={() => setExpandedCard(expandedCard === 'hge' ? null : 'hge')}
              >
                <div className='flex items-center justify-between'>
                  <h4 className='text-lg font-semibold text-slate-200'>
                    Service - Holy Ghost Encounter
                  </h4>
                  <svg 
                    className={`w-5 h-5 text-emerald-400 transition-transform ${expandedCard === 'hge' ? 'rotate-180' : ''}`}
                    fill='none' 
                    stroke='currentColor' 
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>
                <p className='text-sm text-slate-400 mt-1'>
                  {totals.hge.streams.length} Stream{totals.hge.streams.length !== 1 ? 's' : ''}
                </p>
                <div className='mt-6'>
                  <p className='text-sm text-slate-400'>Total Bacentas</p>
                  <p className='text-4xl font-bold text-emerald-400'>
                    {totals.hge.bacentas}
                  </p>
                </div>
                <div className='mt-4'>
                  <p className='text-sm text-slate-400'>Total Governorships</p>
                  <p className='text-4xl font-bold text-emerald-400'>
                    {totals.hge.governorships}
                  </p>
                </div>
                {expandedCard === 'hge' && totals.hge.streams.length > 0 && (
                  <div className='mt-6 pt-6 border-t border-slate-700'>
                    <p className='text-sm font-semibold text-slate-300 mb-3'>Breakdown by Stream:</p>
                    <div className='space-y-3'>
                      {totals.hge.streams.map((stream, idx) => (
                        <div key={idx} className='bg-slate-900/50 rounded-lg p-3'>
                          <p className='text-sm font-medium text-slate-200 mb-2'>{stream.name}</p>
                          <div className='flex gap-4 text-xs'>
                            <div>
                              <span className='text-slate-400'>Bacentas: </span>
                              <span className='text-emerald-400 font-semibold'>{stream.bacentas}</span>
                            </div>
                            <div>
                              <span className='text-slate-400'>Governorships: </span>
                              <span className='text-emerald-400 font-semibold'>{stream.governorships}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className='fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50'>
            <div className='flex flex-col items-center gap-4'>
              <div className='h-12 w-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin'></div>
              <p className='text-slate-200 text-sm'>Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
