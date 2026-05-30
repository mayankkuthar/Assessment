import React, { useState, useEffect } from 'react'
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

  const {
    allQuizAttempts,
    loadAllQuizAttempts
  } = useDatabase()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        await loadAllQuizAttempts()
      } catch (err) {
        console.error('Error loading admin data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [loadAllQuizAttempts])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredAttempts = allQuizAttempts.filter(attempt => {
    const matchesSearch = 
      attempt.quiz?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
            <div className="admin-stat-card__value" style={{ color: '#10b981' }}>{stats.completedAttempts}</div>
            <div className="admin-stat-card__label">Completed</div>
          </div>
          <div className="admin-stat-card__icon" style={{ backgroundColor: '#10b981' }}>
            <CheckCircleIcon />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-card__value" style={{ color: '#06b6d4' }}>{stats.totalMarksSum}</div>
            <div className="admin-stat-card__label">Total Marks</div>
          </div>
          <div className="admin-stat-card__icon" style={{ backgroundColor: '#06b6d4' }}>
            <TrendingUpIcon />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-card__value" style={{ color: '#f59e0b' }}>{stats.totalUsers}</div>
            <div className="admin-stat-card__label">Active Users</div>
          </div>
          <div className="admin-stat-card__icon" style={{ backgroundColor: '#f59e0b' }}>
            <PeopleAltIcon />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-card__value" style={{ color: '#8b5cf6' }}>{stats.completedAttempts}/{stats.totalAttempts}</div>
            <div className="admin-stat-card__label">Completion Rate</div>
          </div>
          <div className="admin-stat-card__icon" style={{ backgroundColor: '#8b5cf6' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <EmailIcon style={{ color: 'var(--color-muted)' }} />
                          {attempt.user?.email || 'Anonymous'}
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
        <div className="coming-soon">
          <PeopleAltIcon />
          <h3>User Summary Coming Soon</h3>
          <p>Detailed user analytics and performance insights will be available here.</p>
        </div>
      )}

      {tab === 2 && (
        <div className="coming-soon">
          <AnalyticsIcon />
          <h3>Quiz Analytics Coming Soon</h3>
          <p>Comprehensive quiz performance metrics and trends will be displayed here.</p>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard