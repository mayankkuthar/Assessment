import React, { useState, useEffect, useMemo } from 'react'
import {
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  PeopleAlt as PeopleAltIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  BarChart as BarChartIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material'
import { useDatabase } from '../hooks/useDatabase'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userMap, setUserMap] = useState({})
  const [showProfileBreakdown, setShowProfileBreakdown] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [quizSearch, setQuizSearch] = useState('')
  const [selectedQuizStat, setSelectedQuizStat] = useState(null)
  const [quizRowLimit, setQuizRowLimit] = useState('25') // number string or 'all'

  const {
    allQuizAttempts,
    loadAllQuizAttempts,
    quizzes,
    profiles
  } = useDatabase()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const attempts = await loadAllQuizAttempts()

        // The global /api/quiz-attempts endpoint returns flat records (no nested
        // quiz/user/profile), so fetch each referenced user once to enrich locally.
        const userIds = [...new Set((attempts || []).map(a => a.user_id).filter(Boolean))]
        const entries = await Promise.all(
          userIds.map(async (id) => {
            try {
              const res = await fetch(`http://65.1.6.81:3001/api/users/${id}`)
              if (res.ok) return [id, await res.json()]
            } catch (e) {
              /* ignore individual user fetch failures */
            }
            return [id, null]
          })
        )
        setUserMap(Object.fromEntries(entries))
      } catch (err) {
        console.error('Error loading admin data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [loadAllQuizAttempts])

  // Enrich flat attempts with quiz / profile / user objects expected by the UI
  const enrichedAttempts = useMemo(() => {
    return (allQuizAttempts || []).map(attempt => {
      const quiz = (quizzes || []).find(q => String(q.id) === String(attempt.quiz_id)) || null

      const userData = userMap[attempt.user_id] || null
      let profile = null
      if (userData && userData.profile) {
        profile = (profiles || []).find(p => p.name === userData.profile) || null
      }
      if (!profile && attempt.profile_id) {
        profile = (profiles || []).find(p => String(p.id) === String(attempt.profile_id)) || null
      }

      const user = userData
        ? {
            name: userData.user_name || userData.email || 'Unknown User',
            email: userData.email || 'No email',
            organization: userData.organization || 'Not specified'
          }
        : { name: `User ${attempt.user_id || 'Unknown'}`, email: 'No email', organization: 'Not specified' }

      return {
        ...attempt,
        quiz: quiz || { name: 'Unknown' },
        profile: profile || { name: 'Unknown' },
        user
      }
    })
  }, [allQuizAttempts, quizzes, profiles, userMap])

  // Count unique active users grouped by their profile
  const usersByProfile = useMemo(() => {
    const profileToUsers = {}
    const seen = new Set()

    ;(allQuizAttempts || []).forEach(attempt => {
      const userId = attempt.user_id
      if (!userId || seen.has(userId)) return
      seen.add(userId)

      const userData = userMap[userId]
      const profileName = (userData && userData.profile) || 'Unassigned'
      profileToUsers[profileName] = (profileToUsers[profileName] || 0) + 1
    })

    return Object.entries(profileToUsers)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [allQuizAttempts, userMap])

  // One row per user, aggregating their attempts into headline metrics plus the
  // raw rows (used by the drill-down modal). Averages/best use completed attempts only.
  const userSummaries = useMemo(() => {
    const map = {}
    enrichedAttempts.forEach(a => {
      const key = a.user_id || a.user?.email || 'unknown'
      if (!map[key]) {
        map[key] = {
          id: key,
          name: a.user?.name || 'Unknown User',
          email: a.user?.email || 'No email',
          organization: a.user?.organization || 'Not specified',
          attempts: 0,
          completed: 0,
          scoreSum: 0,
          scoreCount: 0,
          best: 0,
          lastActivity: 0,
          rows: []
        }
      }
      const u = map[key]
      u.attempts += 1
      u.rows.push(a)
      if (a.completed_at) {
        u.completed += 1
        const s = Number(a.score) || 0
        u.scoreSum += s
        u.scoreCount += 1
        if (s > u.best) u.best = s
      }
      const t = new Date(a.completed_at || a.started_at || 0).getTime()
      if (t > u.lastActivity) u.lastActivity = t
    })

    return Object.values(map)
      .map(u => ({
        ...u,
        avgScore: u.scoreCount ? Math.round(u.scoreSum / u.scoreCount) : 0,
        rows: u.rows.sort((a, b) =>
          new Date(b.completed_at || b.started_at || 0) - new Date(a.completed_at || a.started_at || 0))
      }))
      .sort((a, b) => b.avgScore - a.avgScore || b.attempts - a.attempts)
  }, [enrichedAttempts])

  const filteredUserSummaries = useMemo(() => {
    const tokens = userSearch.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return userSummaries
    return userSummaries.filter(u => {
      const haystack = `${u.name} ${u.email} ${u.organization}`.toLowerCase()
      return tokens.every(t => haystack.includes(t))
    })
  }, [userSummaries, userSearch])

  const scoreBadgeClass = (score) =>
    score >= 80 ? 'badge--success' : score >= 60 ? 'badge--warning' : 'badge--outline'

  // One row per quiz, aggregating attempts into headline metrics + score-band
  // distribution. A "pass" is a completed attempt scoring 60% or higher.
  const quizAnalytics = useMemo(() => {
    const map = {}
    enrichedAttempts.forEach(a => {
      const key = a.quiz_id || a.quiz?.name || 'unknown'
      if (!map[key]) {
        map[key] = {
          id: key,
          name: a.quiz?.name || 'Unknown Quiz',
          attempts: 0,
          completed: 0,
          scoreSum: 0,
          scoreCount: 0,
          best: 0,
          worst: 100,
          passCount: 0,
          bands: { Excellent: 0, Good: 0, 'Needs Improvement': 0 },
          users: new Set(),
          lastActivity: 0,
          rows: []
        }
      }
      const q = map[key]
      q.attempts += 1
      q.rows.push(a)
      if (a.user_id) q.users.add(a.user_id)
      if (a.completed_at) {
        q.completed += 1
        const s = Number(a.score) || 0
        q.scoreSum += s
        q.scoreCount += 1
        if (s > q.best) q.best = s
        if (s < q.worst) q.worst = s
        if (s >= 60) q.passCount += 1
        if (s >= 80) q.bands.Excellent += 1
        else if (s >= 60) q.bands.Good += 1
        else q.bands['Needs Improvement'] += 1
      }
      const t = new Date(a.completed_at || a.started_at || 0).getTime()
      if (t > q.lastActivity) q.lastActivity = t
    })

    return Object.values(map)
      .map(q => ({
        ...q,
        uniqueUsers: q.users.size,
        avgScore: q.scoreCount ? Math.round(q.scoreSum / q.scoreCount) : 0,
        worst: q.scoreCount ? q.worst : 0,
        passRate: q.scoreCount ? Math.round((q.passCount / q.scoreCount) * 100) : 0,
        completionRate: q.attempts ? Math.round((q.completed / q.attempts) * 100) : 0,
        rows: q.rows.sort((a, b) =>
          new Date(b.completed_at || b.started_at || 0) - new Date(a.completed_at || a.started_at || 0))
      }))
      .sort((a, b) => b.attempts - a.attempts || b.avgScore - a.avgScore)
  }, [enrichedAttempts])

  const filteredQuizAnalytics = useMemo(() => {
    const tokens = quizSearch.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return quizAnalytics
    return quizAnalytics.filter(q => tokens.every(t => q.name.toLowerCase().includes(t)))
  }, [quizAnalytics, quizSearch])

  const exportQuizAnalytics = () => {
    const csvData = [
      ['Quiz', 'Attempts', 'Unique Users', 'Completed', 'Completion Rate', 'Avg Score', 'Best', 'Lowest', 'Pass Rate', 'Last Activity'],
      ...filteredQuizAnalytics.map(q => [
        q.name, q.attempts, q.uniqueUsers, q.completed, `${q.completionRate}%`,
        `${q.avgScore}%`, `${q.best}%`, `${q.worst}%`, `${q.passRate}%`,
        q.lastActivity ? formatDate(q.lastActivity) : 'N/A'
      ])
    ]
    const csvContent = csvData.map(row => row.map(c => {
      const s = String(c ?? '')
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportUserSummary = () => {
    const csvData = [
      ['User', 'Email', 'Organization', 'Attempts', 'Completed', 'Avg Score', 'Best Score', 'Last Activity'],
      ...filteredUserSummaries.map(u => [
        u.name, u.email, u.organization, u.attempts, u.completed,
        `${u.avgScore}%`, `${u.best}%`,
        u.lastActivity ? formatDate(u.lastActivity) : 'N/A'
      ])
    ]
    const csvContent = csvData.map(row => row.map(c => {
      const s = String(c ?? '')
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-summary-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredAttempts = enrichedAttempts.filter(attempt => {
    // Combine every searchable field into one haystack so a query matches by
    // quiz, profile, email, user name or organization (in any combination).
    const haystack = [
      attempt.quiz?.name,
      attempt.profile?.name,
      attempt.user?.email,
      attempt.user?.name,
      attempt.user?.organization
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const tokens = searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const matchesSearch = tokens.every(token => haystack.includes(token))

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'completed' && attempt.completed_at) ||
      (filterStatus === 'in-progress' && !attempt.completed_at)

    return matchesSearch && matchesFilter
  })

  const getOverallStats = () => {
    if (allQuizAttempts.length === 0) {
      return {
        totalAttempts: 0,
        completedAttempts: 0,
        totalMarksSum: 0,
        totalUsers: 0,
        completionRate: 0
      }
    }

    const totalAttempts = allQuizAttempts.length
    const completedAttempts = allQuizAttempts.filter(attempt => attempt.completed_at).length
    const totalMarksSum = allQuizAttempts.reduce((sum, attempt) => sum + (attempt.total_marks || 0), 0)
    const uniqueUsers = new Set(allQuizAttempts.map(attempt => attempt.user_id).filter(Boolean)).size
    const completionRate = (completedAttempts / totalAttempts) * 100

    return {
      totalAttempts,
      completedAttempts,
      totalMarksSum,
      totalUsers: uniqueUsers,
      completionRate: Math.round(completionRate * 100) / 100
    }
  }

  const exportData = () => {
    const csvData = [
      ['User Email', 'Quiz Name', 'Profile', 'Score', 'Status', 'Started At', 'Completed At'],
      ...filteredAttempts.map(attempt => [
        attempt.user?.email || 'Anonymous',
        attempt.quiz?.name || 'Unknown',
        attempt.profile?.name || 'Unknown',
        attempt.score || 0,
        attempt.completed_at ? 'Completed' : 'In Progress',
        formatDate(attempt.started_at),
        attempt.completed_at ? formatDate(attempt.completed_at) : 'N/A'
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-attempts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="dashboard__loading">
        <div className="dashboard__spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="alert alert--error">
          <h4>Dashboard Error</h4>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const stats = getOverallStats()

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header__icon">
          <BarChartIcon />
        </div>
        <div>
          <h1 className="admin-header__title">Admin Dashboard</h1>
          <p className="admin-header__subtitle">Monitor all quiz attempts and user activity</p>
        </div>
      </header>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-card__value" style={{ color: 'var(--color-primary)' }}>{stats.totalAttempts}</div>
            <div className="admin-stat-card__label">Total Attempts</div>
          </div>
          <div className="admin-stat-card__icon" style={{ backgroundColor: 'var(--color-primary)' }}>
            <QuizIcon />
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-card__value" style={{ color: '#895BF5' }}>{stats.completedAttempts}</div>
            <div className="admin-stat-card__label">Completed</div>
          </div>
          <div className="admin-stat-card__icon" style={{ backgroundColor: '#895BF5' }}>
            <CheckCircleIcon />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-card__value" style={{ color: '#895BF5' }}>{stats.totalMarksSum}</div>
            <div className="admin-stat-card__label">Total Marks</div>
          </div>
          <div className="admin-stat-card__icon" style={{ backgroundColor: '#895BF5' }}>
            <TrendingUpIcon />
          </div>
        </div>

        <div
          className="admin-stat-card admin-stat-card--clickable"
          onClick={() => setShowProfileBreakdown(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowProfileBreakdown(true) }}
          title="View active users per profile"
        >
          <div>
            <div className="admin-stat-card__value" style={{ color: '#895BF5' }}>{stats.totalUsers}</div>
            <div className="admin-stat-card__label">Active Users</div>
          </div>
          <div className="admin-stat-card__icon" style={{ backgroundColor: '#895BF5' }}>
            <PeopleAltIcon />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-card__value" style={{ color: '#895BF5' }}>{stats.completedAttempts}/{stats.totalAttempts}</div>
            <div className="admin-stat-card__label">Completion Rate</div>
          </div>
          <div className="admin-stat-card__icon" style={{ backgroundColor: '#895BF5' }}>
            <ScheduleIcon />
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${tab === 0 ? 'admin-tab--active' : ''}`}
          onClick={() => setTab(0)}
        >
          All Attempts
        </button>
        <button 
          className={`admin-tab ${tab === 1 ? 'admin-tab--active' : ''}`}
          onClick={() => setTab(1)}
        >
          User Summary
        </button>
        <button 
          className={`admin-tab ${tab === 2 ? 'admin-tab--active' : ''}`}
          onClick={() => setTab(2)}
        >
          Quiz Analytics
        </button>
      </div>

      {tab === 0 && (
        <>
          <div className="admin-controls">
            <div className="admin-search">
              <SearchIcon style={{ color: 'var(--color-muted)' }} />
              <input 
                type="text" 
                placeholder="Search by quiz, profile, or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              className="btn btn--outline" 
              onClick={() => setFilterStatus(filterStatus === 'all' ? 'completed' : filterStatus === 'completed' ? 'in-progress' : 'all')}
            >
              <FilterListIcon className="btn-icon" />
              {filterStatus === 'all' ? 'All' : filterStatus === 'completed' ? 'Completed' : 'In Progress'}
            </button>

            <button className="btn btn--primary" onClick={exportData}>
              <DownloadIcon className="btn-icon" />
              Export
            </button>
          </div>

          <div className="admin-table-container">
            {filteredAttempts.length === 0 ? (
              <div className="coming-soon">
                <QuizIcon />
                <h3>No attempts found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Quiz</th>
                    <th>Profile</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map(attempt => (
                    <tr key={attempt.id}>
                      <td>
                        <div className="admin-user-cell">
                          <span className="admin-user-cell__name">{attempt.user?.name || 'Unknown User'}</span>
                          <span className="admin-user-cell__email">
                            <EmailIcon style={{ width: '13px', height: '13px', marginRight: '4px' }} />
                            {attempt.user?.email || 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{attempt.quiz?.name || 'Unknown'}</td>
                      <td>
                        <span className="badge badge--primary">{attempt.profile?.name || 'Unknown'}</span>
                      </td>
                      <td>
                        {attempt.completed_at ? (
                          <span className={`badge ${attempt.score >= 80 ? 'badge--success' : attempt.score >= 60 ? 'badge--warning' : 'badge--outline'}`}>
                            {attempt.score || 0}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-muted-fg)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>Pending</span>
                        )}
                      </td>
                      <td>
                        {attempt.completed_at ? (
                          <span className="badge badge--success">
                            <CheckCircleIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                            Completed
                          </span>
                        ) : (
                          <span className="badge badge--warning">
                            <ScheduleIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                            In Progress
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>{formatDate(attempt.started_at)}</td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>{attempt.completed_at ? formatDate(attempt.completed_at) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 1 && (
        <>
          <div className="admin-controls">
            <div className="admin-search">
              <SearchIcon style={{ color: 'var(--color-muted)' }} />
              <input
                type="text"
                placeholder="Search users by name, email, or organization..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <button className="btn btn--primary" onClick={exportUserSummary} disabled={filteredUserSummaries.length === 0}>
              <DownloadIcon className="btn-icon" />
              Export
            </button>
          </div>

          <div className="admin-table-container">
            {filteredUserSummaries.length === 0 ? (
              <div className="coming-soon">
                <PeopleAltIcon />
                <h3>No users found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Organization</th>
                    <th>Attempts</th>
                    <th>Completed</th>
                    <th>Avg Score</th>
                    <th>Best</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUserSummaries.map(u => (
                    <tr
                      key={u.id}
                      className="admin-table__row--clickable"
                      onClick={() => setSelectedUser(u)}
                      title="View user details"
                    >
                      <td>
                        <div className="admin-user-cell">
                          <span className="admin-user-cell__name">{u.name}</span>
                          <span className="admin-user-cell__email">
                            <EmailIcon style={{ width: '13px', height: '13px', marginRight: '4px' }} />
                            {u.email}
                          </span>
                        </div>
                      </td>
                      <td><span className="badge badge--primary">{u.organization}</span></td>
                      <td style={{ fontWeight: 600 }}>{u.attempts}</td>
                      <td>{u.completed}/{u.attempts}</td>
                      <td>
                        {u.scoreCount > 0 ? (
                          <span className={`badge ${scoreBadgeClass(u.avgScore)}`}>{u.avgScore}%</span>
                        ) : (
                          <span style={{ color: 'var(--color-muted-fg)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>—</span>
                        )}
                      </td>
                      <td>{u.scoreCount > 0 ? `${u.best}%` : '—'}</td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>{u.lastActivity ? formatDate(u.lastActivity) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 2 && (
        <>
          <div className="admin-controls">
            <div className="admin-search">
              <SearchIcon style={{ color: 'var(--color-muted)' }} />
              <input
                type="text"
                placeholder="Search quizzes by name..."
                value={quizSearch}
                onChange={(e) => setQuizSearch(e.target.value)}
              />
            </div>

            <button className="btn btn--primary" onClick={exportQuizAnalytics} disabled={filteredQuizAnalytics.length === 0}>
              <DownloadIcon className="btn-icon" />
              Export
            </button>
          </div>

          <div className="admin-table-container">
            {filteredQuizAnalytics.length === 0 ? (
              <div className="coming-soon">
                <AnalyticsIcon />
                <h3>No quizzes found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Attempts</th>
                    <th>Users</th>
                    <th>Completion</th>
                    <th>Avg Score</th>
                    <th>Pass Rate</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizAnalytics.map(q => (
                    <tr
                      key={q.id}
                      className="admin-table__row--clickable"
                      onClick={() => { setQuizRowLimit('25'); setSelectedQuizStat(q) }}
                      title="View quiz details"
                    >
                      <td style={{ fontWeight: 600 }}>{q.name}</td>
                      <td>{q.attempts}</td>
                      <td>{q.uniqueUsers}</td>
                      <td>{q.completed}/{q.attempts}</td>
                      <td>
                        {q.scoreCount > 0 ? (
                          <div className="admin-score-bar" title={`${q.avgScore}%`}>
                            <div className="admin-score-bar__track">
                              <div className="admin-score-bar__fill" style={{ width: `${q.avgScore}%` }} />
                            </div>
                            <span className="admin-score-bar__val">{q.avgScore}%</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-muted-fg)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {q.scoreCount > 0 ? (
                          <span className={`badge ${scoreBadgeClass(q.passRate)}`}>{q.passRate}%</span>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>{q.lastActivity ? formatDate(q.lastActivity) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal admin-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div className="admin-modal__title">
                <PeopleAltIcon />
                <div>
                  <span>{selectedUser.name}</span>
                  <div className="admin-modal__subtitle">{selectedUser.email} · {selectedUser.organization}</div>
                </div>
              </div>
              <button
                className="admin-modal__close"
                onClick={() => setSelectedUser(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-user-stats">
                <div className="admin-user-stat">
                  <div className="admin-user-stat__value">{selectedUser.attempts}</div>
                  <div className="admin-user-stat__label">Attempts</div>
                </div>
                <div className="admin-user-stat">
                  <div className="admin-user-stat__value">{selectedUser.completed}</div>
                  <div className="admin-user-stat__label">Completed</div>
                </div>
                <div className="admin-user-stat">
                  <div className="admin-user-stat__value">{selectedUser.scoreCount > 0 ? `${selectedUser.avgScore}%` : '—'}</div>
                  <div className="admin-user-stat__label">Avg Score</div>
                </div>
                <div className="admin-user-stat">
                  <div className="admin-user-stat__value">{selectedUser.scoreCount > 0 ? `${selectedUser.best}%` : '—'}</div>
                  <div className="admin-user-stat__label">Best</div>
                </div>
              </div>

              <h4 className="admin-modal__section">Attempt History</h4>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Profile</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.rows.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.quiz?.name || 'Unknown'}</td>
                        <td><span className="badge badge--primary">{r.profile?.name || 'Unknown'}</span></td>
                        <td>
                          {r.completed_at ? (
                            <span className={`badge ${scoreBadgeClass(r.score || 0)}`}>{r.score || 0}%</span>
                          ) : (
                            <span style={{ color: 'var(--color-muted-fg)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>Pending</span>
                          )}
                        </td>
                        <td>
                          {r.completed_at ? (
                            <span className="badge badge--success">Completed</span>
                          ) : (
                            <span className="badge badge--warning">In Progress</span>
                          )}
                        </td>
                        <td style={{ fontSize: 'var(--text-sm)' }}>{r.completed_at ? formatDate(r.completed_at) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedQuizStat && (
        <div className="admin-modal-overlay" onClick={() => setSelectedQuizStat(null)}>
          <div className="admin-modal admin-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div className="admin-modal__title">
                <AnalyticsIcon />
                <div>
                  <span>{selectedQuizStat.name}</span>
                  <div className="admin-modal__subtitle">
                    {selectedQuizStat.attempts} attempts · {selectedQuizStat.uniqueUsers} users
                  </div>
                </div>
              </div>
              <button
                className="admin-modal__close"
                onClick={() => setSelectedQuizStat(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-user-stats">
                <div className="admin-user-stat">
                  <div className="admin-user-stat__value">{selectedQuizStat.completionRate}%</div>
                  <div className="admin-user-stat__label">Completion</div>
                </div>
                <div className="admin-user-stat">
                  <div className="admin-user-stat__value">{selectedQuizStat.scoreCount > 0 ? `${selectedQuizStat.avgScore}%` : '—'}</div>
                  <div className="admin-user-stat__label">Avg Score</div>
                </div>
                <div className="admin-user-stat">
                  <div className="admin-user-stat__value">{selectedQuizStat.scoreCount > 0 ? `${selectedQuizStat.best}%` : '—'}</div>
                  <div className="admin-user-stat__label">Best</div>
                </div>
                <div className="admin-user-stat">
                  <div className="admin-user-stat__value">{selectedQuizStat.scoreCount > 0 ? `${selectedQuizStat.passRate}%` : '—'}</div>
                  <div className="admin-user-stat__label">Pass Rate</div>
                </div>
              </div>

              {selectedQuizStat.scoreCount > 0 && (
                <>
                  <h4 className="admin-modal__section">Score Distribution</h4>
                  <div className="admin-dist">
                    {[
                      { label: 'Excellent (80–100%)', key: 'Excellent', cls: 'admin-dist__fill--excellent' },
                      { label: 'Good (60–79%)', key: 'Good', cls: 'admin-dist__fill--good' },
                      { label: 'Needs Improvement (<60%)', key: 'Needs Improvement', cls: 'admin-dist__fill--low' }
                    ].map(({ label, key, cls }) => {
                      const count = selectedQuizStat.bands[key]
                      const pct = Math.round((count / selectedQuizStat.scoreCount) * 100)
                      return (
                        <div key={key} className="admin-dist__row">
                          <span className="admin-dist__label">{label}</span>
                          <span className="admin-dist__bar">
                            <span className={`admin-dist__fill ${cls}`} style={{ width: `${pct}%` }} />
                          </span>
                          <span className="admin-dist__val">{count} ({pct}%)</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {(() => {
                const limit = quizRowLimit === 'all' ? selectedQuizStat.rows.length : Number(quizRowLimit)
                const visibleRows = selectedQuizStat.rows.slice(0, limit)
                return (
              <>
              <div className="admin-modal__section-head">
                <h4 className="admin-modal__section">Recent Attempts</h4>
                <div className="admin-rowlimit">
                  <label htmlFor="quiz-row-limit">Show</label>
                  <select
                    id="quiz-row-limit"
                    className="admin-rowlimit__select"
                    value={quizRowLimit}
                    onChange={(e) => setQuizRowLimit(e.target.value)}
                  >
                    {[25, 50, 100].filter(n => n < selectedQuizStat.rows.length).map(n => (
                      <option key={n} value={String(n)}>Top {n}</option>
                    ))}
                    <option value="all">All ({selectedQuizStat.rows.length})</option>
                  </select>
                </div>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map(r => (
                      <tr key={r.id}>
                        <td>{r.user?.email || r.user?.name || 'Anonymous'}</td>
                        <td>
                          {r.completed_at ? (
                            <span className={`badge ${scoreBadgeClass(r.score || 0)}`}>{r.score || 0}%</span>
                          ) : (
                            <span style={{ color: 'var(--color-muted-fg)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>Pending</span>
                          )}
                        </td>
                        <td>
                          {r.completed_at ? (
                            <span className="badge badge--success">Completed</span>
                          ) : (
                            <span className="badge badge--warning">In Progress</span>
                          )}
                        </td>
                        <td style={{ fontSize: 'var(--text-sm)' }}>{r.completed_at ? formatDate(r.completed_at) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleRows.length < selectedQuizStat.rows.length && (
                  <p className="admin-modal__empty">Showing {visibleRows.length} of {selectedQuizStat.rows.length} attempts.</p>
                )}
              </div>
              </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {showProfileBreakdown && (
        <div className="admin-modal-overlay" onClick={() => setShowProfileBreakdown(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div className="admin-modal__title">
                <PeopleAltIcon />
                <span>Active Users by Profile</span>
              </div>
              <button
                className="admin-modal__close"
                onClick={() => setShowProfileBreakdown(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal__body">
              {usersByProfile.length === 0 ? (
                <p className="admin-modal__empty">No active users yet.</p>
              ) : (
                <ul className="admin-profile-list">
                  {usersByProfile.map(({ name, count }) => (
                    <li key={name} className="admin-profile-list__item">
                      <span className="admin-profile-list__name">{name}</span>
                      <span className="admin-profile-list__count">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard