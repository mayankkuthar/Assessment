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
  Divider,
  Paper,
  Avatar
} from '@mui/material'
import {
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material'
import { useDatabase } from '../hooks/useDatabase'


const UserDashboard = () => {
  const [user, setUser] = useState(null)
  const [assignedQuizzes, setAssignedQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    userQuizAttempts,
    userStats,
    loadUserQuizAttempts,
    loadUserStats,
    getAssignedQuizzesForUser
  } = useDatabase()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user from localStorage
        const storedUser = localStorage.getItem('currentUser')
        if (!storedUser) {
          setError('No user found. Please log in.')
          return
        }

        const currentUser = JSON.parse(storedUser)
        setUser(currentUser)

        // Load user-specific data
        await Promise.all([
          loadUserQuizAttempts(currentUser.id),
          loadUserStats(currentUser.id)
        ])

        // Load assigned quizzes
        const assigned = await getAssignedQuizzesForUser(currentUser.id)
        setAssignedQuizzes(assigned)

      } catch (err) {
        console.error('Error loading user data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [loadUserQuizAttempts, loadUserStats, getAssignedQuizzesForUser])

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getStatusColor = (completed) => {
    return completed ? 'success' : 'warning'
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

  if (!user) {
    return (
      <Alert severity="warning">
        Please log in to view your dashboard.
      </Alert>
    )
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 50%, #f0f9ff 100%)',
      minHeight: '100vh'
    }}>
      {/* User Header */}
      <Paper sx={{ 
        p: { xs: 3, md: 4 }, 
        mb: 4, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
          <Avatar sx={{ 
            mr: 3, 
            bgcolor: 'rgba(255,255,255,0.15)', 
            width: 64, 
            height: 64,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}>
            <PersonIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 800,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              mb: 1,
              textShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              Welcome back!
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1.5, fontSize: '1.2rem', opacity: 0.9 }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 500,
                opacity: 0.95,
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(102, 126, 234, 0.08)',
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
                    color: '#667eea',
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    mb: 0.5
                  }}>
                    {userStats?.totalAttempts || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}>
                    Total Attempts
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <QuizIcon sx={{ color: 'white', fontSize: '1.8rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>



        <Grid item xs={12} sm={6} md={3}>
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
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    mb: 0.5
                  }}>
                    {userStats?.completionRate || 0}%
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}>
                    Completion Rate
                  </Typography>
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ScheduleIcon sx={{ color: 'white', fontSize: '1.8rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 3, md: 4 }}>
        {/* Assigned Quizzes */}
        <Grid item xs={12} lg={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 700,
                color: '#1f2937'
              }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  mr: 2
                }}>
                  <AssignmentIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
                </Box>
                Assigned Quizzes
              </Typography>
              
              {assignedQuizzes.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%)',
                  borderRadius: 2,
                  border: '2px dashed #d1d5db'
                }}>
                  <AssignmentIcon sx={{ fontSize: '3rem', color: '#9ca3af', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                    No quizzes assigned yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    New quizzes will appear here when assigned
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {assignedQuizzes.map((assignment) => (
                    <Paper key={assignment.id} sx={{
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1, mr: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <QuizIcon sx={{ color: '#8b5cf6', mr: 1.5, fontSize: '1.3rem' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                              {assignment.quiz?.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                            {assignment.quiz?.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                              label={assignment.profile?.name} 
                              size="small" 
                              sx={{ 
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                color: 'white',
                                fontWeight: 500
                              }}
                            />
                            {assignment.quiz?.time_limit && (
                              <Chip 
                                label={`⏱️ ${assignment.quiz.time_limit} min`} 
                                size="small" 
                                variant="outlined"
                                sx={{ borderColor: '#d1d5db', color: '#6b7280' }}
                              />
                            )}
                          </Box>
                        </Box>
                        <Button
                          variant="contained"
                          href={`/attempt/${assignment.quiz_id}`}
                          target="_blank"
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 2,
                            px: 3,
                            py: 1.2,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                            }
                          }}
                        >
                          Start Quiz →
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quiz Submission History */}
        <Grid item xs={12}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 700,
                color: '#1f2937'
              }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  mr: 2
                }}>
                  <QuizIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
                </Box>
                Quiz Submission History
              </Typography>
              
              {!userQuizAttempts || userQuizAttempts.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  background: 'linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%)',
                  borderRadius: 2,
                  border: '2px dashed #d1d5db'
                }}>
                  <QuizIcon sx={{ fontSize: '3rem', color: '#9ca3af', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                    No quiz submissions yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Your quiz attempts will appear here after completion
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {userQuizAttempts.map((attempt) => (
                    <Paper key={attempt.id} sx={{
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1, mr: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <QuizIcon sx={{ color: '#8b5cf6', mr: 1.5, fontSize: '1.3rem' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                              {attempt.quiz?.name || 'Quiz'}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                            {formatDate(attempt.completed_at || attempt.created_at)}
                          </Typography>
                                                     <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                             {attempt.status && (
                               <Chip 
                                 label={attempt.status}
                                 size="small" 
                                 color={attempt.status === 'completed' ? 'success' : 'warning'}
                                 sx={{ fontWeight: 500 }}
                               />
                             )}
                           </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Completed
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(attempt.completed_at || attempt.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Attempts */}
        <Grid item xs={12} lg={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 700,
                color: '#1f2937'
              }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  mr: 2
                }}>
                  <TrendingUpIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
                </Box>
                Recent Attempts
              </Typography>
              
              {userQuizAttempts.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  borderRadius: 2,
                  border: '2px dashed #d1d5db'
                }}>
                  <TrendingUpIcon sx={{ fontSize: '3rem', color: '#9ca3af', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                    No attempts yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Your quiz results will show up here
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {userQuizAttempts.slice(0, 5).map((attempt) => (
                    <Paper key={attempt.id} sx={{
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          background: attempt.completed_at ? 
                            'linear-gradient(135deg, #10b981 0%, #34d399 100%)' :
                            'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                          borderRadius: '50%',
                          p: 1,
                          display: 'flex',
                          mr: 2
                        }}>
                          {attempt.completed_at ? (
                            <CheckCircleIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                          ) : (
                            <ScheduleIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
                            {attempt.quiz?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📅 {formatDate(attempt.started_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={attempt.profile?.name} 
                          size="small"
                          sx={{ 
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            fontWeight: 500
                          }}
                        />

                        <Chip 
                          label={attempt.completed_at ? '✅ Completed' : '⏳ In Progress'} 
                          size="small" 
                          variant="outlined"
                          sx={{
                            borderColor: attempt.completed_at ? '#10b981' : '#f59e0b',
                            color: attempt.completed_at ? '#10b981' : '#f59e0b',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
              
              {userQuizAttempts.length > 5 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    sx={{
                      borderColor: '#10b981',
                      color: '#10b981',
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        color: 'white',
                        borderColor: 'transparent'
                      }
                    }}
                  >
                    View All {userQuizAttempts.length} Attempts →
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>


    </Box>
  )
}

export default UserDashboard 