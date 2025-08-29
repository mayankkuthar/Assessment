import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon
} from '@mui/icons-material'
import { useDatabase } from '../hooks/useDatabase'
import { supabase } from '../supabase'

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

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getStatusColor = (completed) => {
    return completed ? 'success' : 'warning'
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
        averageScore: 0,
        totalUsers: 0,
        completionRate: 0
      }
    }

    const totalAttempts = allQuizAttempts.length
    const completedAttempts = allQuizAttempts.filter(attempt => attempt.completed_at).length
    const averageScore = allQuizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts
    const uniqueUsers = new Set(allQuizAttempts.map(attempt => attempt.user_id).filter(Boolean)).size
    const completionRate = (completedAttempts / totalAttempts) * 100

    return {
      totalAttempts,
      completedAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  const stats = getOverallStats()

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 50%, #f0f9ff 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Paper sx={{ 
        p: { xs: 3, md: 4 }, 
        mb: 4, 
        background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)', 
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(30, 64, 175, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            textShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            📊 Admin Dashboard
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.9,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 400
          }}>
            Monitor all quiz attempts and user activity
          </Typography>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(30, 64, 175, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#1e40af',
                    fontSize: { xs: '1.6rem', sm: '2rem' },
                    mb: 0.5
                  }}>
                    {stats.totalAttempts}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    Total Attempts
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <QuizIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(16, 185, 129, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#10b981',
                    fontSize: { xs: '1.6rem', sm: '2rem' },
                    mb: 0.5
                  }}>
                    {stats.completedAttempts}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    Completed
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(6, 182, 212, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#06b6d4',
                    fontSize: { xs: '1.6rem', sm: '2rem' },
                    mb: 0.5
                  }}>
                    {stats.averageScore}%
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    Avg Score
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUpIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(245, 158, 11, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#f59e0b',
                    fontSize: { xs: '1.6rem', sm: '2rem' },
                    mb: 0.5
                  }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    Active Users
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(139, 92, 246, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#8b5cf6',
                    fontSize: { xs: '1.6rem', sm: '2rem' },
                    mb: 0.5
                  }}>
                    {stats.completionRate}%
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    Completion Rate
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ScheduleIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ 
        background: 'white',
        borderRadius: 3,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.08)',
        mb: 4
      }}>
        <Tabs 
          value={tab} 
          onChange={(e, newValue) => setTab(newValue)}
          sx={{
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
              height: 3,
              borderRadius: '2px 2px 0 0'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#6b7280',
              '&.Mui-selected': {
                color: '#1e40af'
              }
            }
          }}
        >
          <Tab label="📊 All Attempts" />
          <Tab label="👥 User Summary" />
          <Tab label="📈 Quiz Analytics" />
        </Tabs>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.08)'
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="🔍 Search by quiz, profile, or user email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="medium"
            sx={{ 
              flex: { xs: '1 1 100%', sm: 1 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#1e40af'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1e40af'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterStatus(filterStatus === 'all' ? 'completed' : filterStatus === 'completed' ? 'in-progress' : 'all')}
            sx={{
              borderColor: '#1e40af',
              color: '#1e40af',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#1e40af',
                backgroundColor: 'rgba(30, 64, 175, 0.04)'
              }
            }}
          >
            {filterStatus === 'all' ? '📋 All' : filterStatus === 'completed' ? '✅ Completed' : '⏳ In Progress'}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportData}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
              }
            }}
          >
            📄 Export
          </Button>
        </Box>
      </Paper>

      {/* Tab Content */}
      {tab === 0 && (
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                mr: 2
              }}>
                <QuizIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
              </Box>
              All Quiz Attempts ({filteredAttempts.length})
            </Typography>
            
            {filteredAttempts.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%)',
                borderRadius: 2,
                border: '2px dashed #d1d5db'
              }}>
                <QuizIcon sx={{ fontSize: '3rem', color: '#9ca3af', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                  No attempts found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search or filter criteria
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{
                borderRadius: 2,
                border: '1px solid #e5e7eb'
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{
                      background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%)'
                    }}>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 2 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 2 }}>Quiz</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 2 }}>Profile</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 2 }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 2 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 2 }}>Started</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 2 }}>Completed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAttempts.map((attempt, index) => (
                      <TableRow 
                        key={attempt.id}
                        sx={{
                          '&:nth-of-type(even)': {
                            backgroundColor: 'rgba(248, 250, 255, 0.5)'
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(30, 64, 175, 0.04)'
                          },
                          transition: 'background-color 0.2s ease-in-out'
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              mr: 2, 
                              width: 36, 
                              height: 36,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}>
                              <EmailIcon sx={{ fontSize: '1.1rem' }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {attempt.user?.email || 'Anonymous'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {attempt.quiz?.name || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip 
                            label={attempt.profile?.name || 'Unknown'} 
                            size="small" 
                            sx={{
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                              color: 'white',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {attempt.completed_at ? (
                            <Chip 
                              label={`🎯 ${attempt.score || 0}%`} 
                              size="small" 
                              sx={{
                                background: attempt.score >= 80 ? 
                                  'linear-gradient(135deg, #10b981 0%, #34d399 100%)' :
                                  attempt.score >= 60 ?
                                  'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' :
                                  'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Pending
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip 
                            label={attempt.completed_at ? '✅ Completed' : '⏳ In Progress'} 
                            size="small" 
                            sx={{
                              background: attempt.completed_at ? 
                                'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: attempt.completed_at ? '#10b981' : '#f59e0b',
                              border: `1px solid ${attempt.completed_at ? '#10b981' : '#f59e0b'}`,
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            📅 {formatDate(attempt.started_at)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {attempt.completed_at ? `✓ ${formatDate(attempt.completed_at)}` : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                mr: 2
              }}>
                <PersonIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
              </Box>
              User Summary
            </Typography>
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, #fef3e2 0%, #fed7aa 100%)',
              borderRadius: 2,
              border: '2px dashed #f59e0b'
            }}>
              <PersonIcon sx={{ fontSize: '4rem', color: '#f59e0b', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#92400e', mb: 1 }}>
                User Summary Coming Soon
              </Typography>
              <Typography variant="body1" color="#92400e" sx={{ opacity: 0.8 }}>
                Detailed user analytics and performance insights will be available here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                mr: 2
              }}>
                <TrendingUpIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
              </Box>
              Quiz Analytics
            </Typography>
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
              borderRadius: 2,
              border: '2px dashed #06b6d4'
            }}>
              <TrendingUpIcon sx={{ fontSize: '4rem', color: '#06b6d4', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#0c4a6e', mb: 1 }}>
                Quiz Analytics Coming Soon
              </Typography>
              <Typography variant="body1" color="#0c4a6e" sx={{ opacity: 0.8 }}>
                Comprehensive quiz performance metrics and trends will be displayed here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default AdminDashboard 