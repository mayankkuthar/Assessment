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
  Tooltip,
  Divider
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
  Download as DownloadIcon,
  BarChart as BarChartIcon,
  PeopleAlt as PeopleAltIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material'
import { useDatabase } from '../hooks/useDatabase'
import PDFTemplateConfig from './PDFTemplateConfig'


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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 50%, #f0f9ff 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#1e40af', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading Dashboard Data...
          </Typography>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4, background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 50%, #f0f9ff 100%)', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          <Typography variant="h6">Dashboard Error</Typography>
          {error}
        </Alert>
      </Box>
    )
  }

  const stats = getOverallStats()

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 50%, #f0f9ff 100%)',
      minHeight: '100vh'
    }}>
      {/* Enhanced Header */}
      <Paper sx={{ 
        p: { xs: 3, md: 4 }, 
        mb: 4, 
        background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)', 
        color: 'white',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(30, 64, 175, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="6" cy="6" r="6"/%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              p: 2,
              mr: 3,
              backdropFilter: 'blur(10px)'
            }}>
              <BarChartIcon sx={{ fontSize: '2.5rem' }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                mb: 1,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                textShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                Admin Dashboard
              </Typography>
              <Typography variant="h6" sx={{ 
                opacity: 0.9,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 400
              }}>
                Monitor all quiz attempts and user activity
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Enhanced Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(30, 64, 175, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(30, 64, 175, 0.15)',
              borderColor: 'rgba(30, 64, 175, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#1e40af',
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    mb: 0.5
                  }}>
                    {stats.totalAttempts}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.95rem' }
                  }}>
                    Total Attempts
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
                }}>
                  <QuizIcon sx={{ color: 'white', fontSize: '1.8rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)',
              borderColor: 'rgba(16, 185, 129, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#10b981',
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    mb: 0.5
                  }}>
                    {stats.completedAttempts}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.95rem' }
                  }}>
                    Completed
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <CheckCircleIcon sx={{ color: 'white', fontSize: '1.8rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(6, 182, 212, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(6, 182, 212, 0.15)',
              borderColor: 'rgba(6, 182, 212, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#06b6d4',
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    mb: 0.5
                  }}>
                    {stats.averageScore}%
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.95rem' }
                  }}>
                    Avg Score
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
                }}>
                  <TrendingUpIcon sx={{ color: 'white', fontSize: '1.8rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(245, 158, 11, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(245, 158, 11, 0.15)',
              borderColor: 'rgba(245, 158, 11, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#f59e0b',
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    mb: 0.5
                  }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.95rem' }
                  }}>
                    Active Users
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  <PeopleAltIcon sx={{ color: 'white', fontSize: '1.8rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)',
              borderColor: 'rgba(139, 92, 246, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#8b5cf6',
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    mb: 0.5
                  }}>
                    {stats.completionRate}%
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.95rem' }
                  }}>
                    Completion Rate
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}>
                  <ScheduleIcon sx={{ color: 'white', fontSize: '1.8rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Tabs */}
      <Box sx={{ 
        background: 'white',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
        mb: 4,
        overflow: 'hidden'
      }}>
        <Tabs 
          value={tab} 
          onChange={(e, newValue) => setTab(newValue)}
          sx={{
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
              height: 4,
              borderRadius: '2px 2px 0 0'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#6b7280',
              py: 3,
              px: 4,
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: '#1e40af',
                background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(55, 48, 163, 0.05) 100%)'
              },
              '&:hover': {
                background: 'rgba(30, 64, 175, 0.02)',
                color: '#374151'
              }
            }
          }}
        >
          <Tab label="📊 All Attempts" />
          <Tab label="👥 User Summary" />
          <Tab label="📈 Quiz Analytics" />
        </Tabs>
      </Box>

      {/* Enhanced Search and Filter */}
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
      }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="🔍 Search by quiz, profile, or user email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="medium"
            sx={{ 
              flex: { xs: '1 1 100%', sm: 1 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: 'white',
                '&:hover fieldset': {
                  borderColor: '#1e40af',
                  borderWidth: '2px'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1e40af',
                  borderWidth: '2px'
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
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              borderWidth: '2px',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#1e40af',
                backgroundColor: 'rgba(30, 64, 175, 0.08)',
                borderWidth: '2px',
                transform: 'translateY(-2px)'
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
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            📄 Export
          </Button>
        </Box>
      </Paper>

      {/* Enhanced Tab Content */}
      {tab === 0 && (
        <Card sx={{
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
              color: 'white',
              p: { xs: 3, sm: 4 },
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                p: 1.5,
                mr: 3,
                backdropFilter: 'blur(10px)'
              }}>
                <QuizIcon sx={{ fontSize: '1.8rem' }} />
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.3rem', sm: '1.5rem' }
              }}>
                All Quiz Attempts ({filteredAttempts.length})
              </Typography>
            </Box>
            
            {filteredAttempts.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%)',
                border: '2px dashed #d1d5db'
              }}>
                <QuizIcon sx={{ fontSize: '4rem', color: '#9ca3af', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  No attempts found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filter criteria
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{
                      background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%)'
                    }}>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 3, fontSize: '0.95rem' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 3, fontSize: '0.95rem' }}>Quiz</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 3, fontSize: '0.95rem' }}>Profile</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 3, fontSize: '0.95rem' }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 3, fontSize: '0.95rem' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 3, fontSize: '0.95rem' }}>Started</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1f2937', py: 3, fontSize: '0.95rem' }}>Completed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAttempts.map((attempt, index) => (
                      <TableRow 
                        key={attempt.id}
                        sx={{
                          '&:nth-of-type(even)': {
                            backgroundColor: 'rgba(248, 250, 255, 0.6)'
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(30, 64, 175, 0.06)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ py: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              mr: 2, 
                              width: 40, 
                              height: 40,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}>
                              <EmailIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                              {attempt.user?.email || 'Anonymous'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>
                            {attempt.quiz?.name || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Chip 
                            label={attempt.profile?.name || 'Unknown'} 
                            size="small" 
                            sx={{
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
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
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                              Pending
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Chip 
                            label={attempt.completed_at ? '✅ Completed' : '⏳ In Progress'} 
                            size="small" 
                            sx={{
                              background: attempt.completed_at ? 
                                'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: attempt.completed_at ? '#10b981' : '#f59e0b',
                              border: `2px solid ${attempt.completed_at ? '#10b981' : '#f59e0b'}`,
                              fontWeight: 600,
                              fontSize: '0.8rem'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            📅 {formatDate(attempt.started_at)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
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
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              p: { xs: 3, sm: 4 },
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                p: 1.5,
                mr: 3,
                backdropFilter: 'blur(10px)'
              }}>
                <PeopleAltIcon sx={{ fontSize: '1.8rem' }} />
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.3rem', sm: '1.5rem' }
              }}>
                User Summary
              </Typography>
            </Box>
            <Box sx={{ 
              textAlign: 'center', 
              py: 10,
              background: 'linear-gradient(135deg, #fef3e2 0%, #fed7aa 100%)',
              border: '2px dashed #f59e0b'
            }}>
              <PeopleAltIcon sx={{ fontSize: '5rem', color: '#f59e0b', mb: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#92400e', mb: 2 }}>
                User Summary Coming Soon
              </Typography>
              <Typography variant="body1" color="#92400e" sx={{ opacity: 0.8, maxWidth: '500px', mx: 'auto' }}>
                Detailed user analytics and performance insights will be available here. 
                Track individual user progress, learning patterns, and improvement trends.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: 'white',
              p: { xs: 3, sm: 4 },
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                p: 1.5,
                mr: 3,
                backdropFilter: 'blur(10px)'
              }}>
                <AnalyticsIcon sx={{ fontSize: '1.8rem' }} />
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.3rem', sm: '1.5rem' }
              }}>
                Quiz Analytics
              </Typography>
            </Box>
            <Box sx={{ 
              textAlign: 'center', 
              py: 10,
              background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
              border: '2px dashed #06b6d4'
            }}>
              <AnalyticsIcon sx={{ fontSize: '5rem', color: '#06b6d4', mb: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#0c4a6e', mb: 2 }}>
                Quiz Analytics Coming Soon
              </Typography>
              <Typography variant="body1" color="#0c4a6e" sx={{ opacity: 0.8, maxWidth: '500px', mx: 'auto' }}>
                Comprehensive quiz performance metrics and trends will be displayed here. 
                Analyze question difficulty, time patterns, and overall quiz effectiveness.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default AdminDashboard 