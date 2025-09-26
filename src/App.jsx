import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProfileManager from './components/ProfileManager'
import PacketManager from './components/PacketManager'
import QuizBuilder from './components/QuizBuilder'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import CategoryIcon from '@mui/icons-material/Category'
import QuizIcon from '@mui/icons-material/Quiz'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import ShareIcon from '@mui/icons-material/Share'
import AssessmentIcon from '@mui/icons-material/Assessment'
import HomeIcon from '@mui/icons-material/Home'
import HistoryIcon from '@mui/icons-material/History'
import * as XLSX from 'xlsx'
import './App.css'
import { Grid, Card, CardContent, Tooltip, Alert, CircularProgress } from '@mui/material'
import QuizAttempt from './components/QuizAttempt'
import { useDatabase } from './hooks/useDatabase'

import AssessmentResults from './components/AssessmentResults'
import AssessmentReport from './components/AssessmentReport'
import ReportViewer from './components/ReportViewer'
import AuthPage from './components/AuthPage'
import UserDashboard from './components/UserDashboard'
import AdminDashboard from './components/AdminDashboard'
import PasswordReset from './components/PasswordReset'
import PDFTemplateConfig from './components/PDFTemplateConfig'


const drawerWidth = 220

// Admin navigation items
const adminNavItems = [
  { label: 'Admin Dashboard', icon: <PersonIcon /> },
  { label: 'Profile Management', icon: <PeopleIcon /> },
  { label: 'Packet Management', icon: <CategoryIcon /> },
  { label: 'Quiz Builder', icon: <QuizIcon /> },
  { label: 'Assigned Quizzes', icon: <AssignmentTurnedInIcon /> },
  { label: 'Assessment Results', icon: <AssessmentIcon /> },
  { label: 'Assessment Report', icon: <AssessmentIcon /> },
  { label: 'PDF Templates', icon: <ShareIcon /> },
]

// User navigation items
const userNavItems = [
  { label: 'Home', icon: <HomeIcon /> },
  { label: 'Quiz Records', icon: <HistoryIcon /> },
]

function App() {
  // Database state
  const {
    profiles,
    packets,
    quizzes: savedQuizzes,
    loading,
    error,
    addProfile,
    updateProfile,
    deleteProfile,
    addPacket,
    updatePacket,
    deletePacket,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    addPacketsToQuiz,
    removePacketsFromQuiz,
    assignQuizToProfiles,
    removeQuizAssignment,
    getQuizPackets,
    loadData,
    quizAssignments,
    useFallback,
    loadUserQuizAttempts,
    loadUserStats,
    userQuizAttempts,
    userStats
  } = useDatabase()

  // UI state
  const [darkMode, setDarkMode] = useState(false)
  const [tab, setTab] = useState(0)
  const [howToOpen, setHowToOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Get navigation items based on user type
  const navItems = isAdmin ? adminNavItems : userNavItems

  // Sync darkMode with body class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [darkMode])

  // Auth state management - using local storage
  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
        checkUserRole(user);
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('currentUser');
      }
    }
  }, [])

  // Check if user is admin
  const checkUserRole = async (user) => {
    try {
      // For our SQLite setup, the user object already contains the role
      if (user && user.role) {
        const isAdminUser = user.role === 'admin';
        setIsAdmin(isAdminUser);
        console.log('✅ User role detected:', user.role, 'isAdmin:', isAdminUser);
        return;
      }

      // Fallback: try to get role from API
      console.warn('No role in user object, trying API fallback');
      setIsAdmin(false);
    } catch (err) {
      console.warn('Role check failed:', err)
      setIsAdmin(false)
    }
  }

  // Load user data when user changes
  useEffect(() => {
    if (user && !isAdmin) {
      loadUserQuizAttempts(user.id)
      loadUserStats(user.id)
    }
  }, [user, isAdmin, loadUserQuizAttempts, loadUserStats])

  // Assign quiz function
  const assignQuiz = async (profileId, quizId) => {
    try {
      if (!quizAssignments.find(aq => aq.profile_id === profileId && aq.quiz_id === quizId)) {
        await assignQuizToProfiles(quizId, [profileId])
        await loadData()
      }
    } catch (err) {
      console.error('Error assigning quiz:', err)
      alert('Failed to assign quiz. Please try again.')
    }
  }

  // Export quizzes
  const exportQuizzes = () => {
    const dataStr = JSON.stringify(savedQuizzes, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quizzes.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import quizzes
  const importQuizzes = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target.result)
        if (Array.isArray(imported)) {
          for (const quiz of imported) {
            await addQuiz({
              name: quiz.name,
              description: quiz.description || '',
              time_limit: quiz.timeLimit || null,
              passing_score: quiz.passingScore || 70
            })
          }
          alert('Quizzes imported successfully!')
        } else {
          alert('Invalid file format.')
        }
      } catch (err) {
        console.error('Error importing quizzes:', err)
        alert('Invalid JSON file or import failed.')
      }
    }
    reader.readAsText(file)
  }

  // Upload Excel
  const uploadExcel = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const profilesSheet = workbook.Sheets['Profiles']
        const packetsSheet = workbook.Sheets['Packets']
        const questionsSheet = workbook.Sheets['Questions']
        const quizzesSheet = workbook.Sheets['Quizzes']
        
        if (!profilesSheet || !packetsSheet || !questionsSheet || !quizzesSheet) {
          alert('Excel must have sheets: Profiles, Packets, Questions, Quizzes')
          return
        }

        // Parse and import data
        const profilesData = XLSX.utils.sheet_to_json(profilesSheet)
        for (const row of profilesData) {
          await addProfile({
            name: row.Name || row.ProfileName,
            type: row.Type || row.WorkStatus || 'general'
          })
        }

        const packetsData = XLSX.utils.sheet_to_json(packetsSheet)
        const packetMap = new Map()
        
        for (const row of packetsData) {
          const newPacket = await addPacket({
            name: row.PacketName,
            description: row.Description || ''
          })
          packetMap.set(row.PacketName, newPacket.id)
        }

        const questionsData = XLSX.utils.sheet_to_json(questionsSheet)
        for (const row of questionsData) {
          const packetId = packetMap.get(row.PacketName || row.Packet)
          if (packetId) {
            await addQuestion({
              packet_id: packetId,
              question_text: row.Text || row.QuestionText,
              question_type: row.Type === 'MCQ' ? 'mcq' : 'true_false',
              options: row.Type === 'MCQ' ? [row.Option1, row.Option2, row.Option3, row.Option4].filter(Boolean) : null,
              correct_answer: row.CorrectAnswer || row.Correct
            })
          }
        }

        const quizzesData = XLSX.utils.sheet_to_json(quizzesSheet)
        for (const row of quizzesData) {
          const packetNames = (row.PacketNames || '').split(',').map(s => s.trim())
          const packetIds = packetNames.map(name => packetMap.get(name)).filter(Boolean)
          
          const newQuiz = await addQuiz({
            name: row.QuizName,
            description: row.Description || '',
            time_limit: row.TimeLimit || null,
            passing_score: row.PassingScore || 70
          })

          if (packetIds.length > 0) {
            await addPacketsToQuiz(newQuiz.id, packetIds)
          }

          if (row.ProfileName || row.Name) {
            const profile = profiles.find(p => p.name === (row.ProfileName || row.Name))
            if (profile) {
              await assignQuizToProfiles(newQuiz.id, [profile.id])
            }
          }
        }

        await loadData()
        alert('Excel data loaded successfully!')
      } catch (err) {
        console.error('Error uploading Excel:', err)
        alert('Failed to upload Excel file. Please check the format and try again.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#2563eb' },
    },
    typography: {
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    },
  })

  // Show loading state
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography sx={{ mb: 2 }}>Loading application...</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            If this takes too long, the database may not be set up yet.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              // Force fallback mode
              if (typeof window !== 'undefined') {
                localStorage.setItem('force_fallback', 'true')
                window.location.reload()
              }
            }}
          >
            Use Fallback Mode
          </Button>
        </Box>
      </ThemeProvider>
    )
  }

  // Show error state
  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Database Connection Error</Typography>
            <Typography sx={{ mb: 2 }}>{error}</Typography>
            {error.includes('Database connection failed') && (
              <Typography variant="body2" color="text.secondary">
                The app is now running with local JSON storage. All features are available offline.
              </Typography>
            )}
          </Alert>
        </Box>
      </ThemeProvider>
    )
  }

  // If not logged in, show AuthPage
  if (!user) {
    return <AuthPage />
  }

  // Render main app
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {useFallback && (
        <Alert severity="warning" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <Typography>
            Running in fallback mode (localStorage). Database features are limited.
          </Typography>
        </Alert>
      )}
      <Routes>
        <Route path="/attempt/:quizId" element={<QuizAttempt />} />
        <Route path="/report/:quizId/:attemptId" element={<ReportViewer />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="*" element={
          <Box sx={{ display: 'flex' }}>
            <Drawer
              variant="permanent"
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
              }}
            >
              <Toolbar />
              <Box sx={{ overflow: 'auto', mt: 2 }}>
                <List>
                  {navItems.map((item, idx) => (
                    <ListItem button key={item.label} selected={tab === idx} onClick={() => setTab(idx)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <List>
                  <ListItem button onClick={() => setHowToOpen(true)}>
                    <ListItemIcon><InfoOutlinedIcon /></ListItemIcon>
                    <ListItemText primary="How to Use" />
                  </ListItem>
                </List>
              </Box>
            </Drawer>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                minHeight: '100vh',
                background: 'inherit',
                overflow: 'auto',
              }}
            >
              <AppBar position="fixed" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    Assessment Tool {isAdmin ? '(Admin)' : '(User)'} {useFallback && '(Fallback Mode)'}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  {isAdmin && (
                    <Button component="label" color="inherit" variant="outlined" sx={{ mr: 2 }}>
                      Upload Excel
                      <input type="file" accept=".xlsx,.xls" hidden onChange={uploadExcel} />
                    </Button>
                  )}
                  <IconButton color="inherit" onClick={() => setDarkMode((prev) => !prev)}>
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                  <Button color="inherit" onClick={() => {
                    localStorage.removeItem('currentUser');
                    setUser(null);
                    setIsAdmin(false);
                  }}>Logout</Button>
                </Toolbar>
              </AppBar>
              <Toolbar />
              
              {/* Content Area */}
              <Box sx={{ mt: 2, width: '100%' }}>
                {isAdmin ? (
                  // Admin Mode
                  <>
                    {tab === 0 && <AdminDashboard />}
                    {tab === 1 && (
                      <ProfileManager 
                        profiles={profiles} 
                        addProfile={addProfile}
                        updateProfile={updateProfile}
                        deleteProfile={deleteProfile}
                      />
                    )}
                    {tab === 2 && (
                      <PacketManager 
                        packets={packets} 
                        addPacket={addPacket}
                        updatePacket={updatePacket}
                        deletePacket={deletePacket}
                        addQuestion={addQuestion}
                        updateQuestion={updateQuestion}
                        deleteQuestion={deleteQuestion}
                        onDataChange={loadData}
                      />
                    )}
                    {tab === 3 && (
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ mb: 2 }}>
                          <Button variant="contained" onClick={exportQuizzes}>Export Quizzes</Button>
                          <Button component="label" sx={{ ml: 2 }}>
                            Import Quizzes
                            <input type="file" accept="application/json" hidden onChange={importQuizzes} />
                          </Button>
                        </Box>
                        <QuizBuilder
                          profiles={profiles}
                          packets={packets}
                          savedQuizzes={savedQuizzes}
                          addQuiz={addQuiz}
                          updateQuiz={updateQuiz}
                          deleteQuiz={deleteQuiz}
                          addPacketsToQuiz={addPacketsToQuiz}
                          removePacketsFromQuiz={removePacketsFromQuiz}
                          assignQuiz={assignQuiz}
                          removeQuizAssignment={removeQuizAssignment}
                          quizAssignments={quizAssignments}
                          onDataChange={loadData}
                          getQuizPackets={getQuizPackets}
                        />
                      </Box>
                    )}
                    {tab === 4 && (
                      <Box sx={{ width: '100%' }}>
                        {profiles.length === 0 && <Typography>No profiles created.</Typography>}
                        <Grid container spacing={3} sx={{ width: '100%' }}>
                          {profiles.map(profile => (
                            <Grid item xs={12} sm={6} md={4} key={profile.id} sx={{ display: 'flex' }}>
                              <Card className="assigned-quiz-card" variant="outlined" sx={{ mb: 2, p: 2, background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', minHeight: 240, height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <CardContent sx={{ minHeight: 180, height: '100%', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-start' }}>
                                  <Typography variant="h6" sx={{ mb: 1 }}>{profile.name} <Typography component="span" color="text.secondary">({profile.type})</Typography></Typography>
                                  <List sx={{ alignItems: 'flex-start' }}>
                                    {quizAssignments.filter(aq => aq.profile_id === profile.id).length === 0 && (
                                      <ListItem><ListItemText primary="No quizzes assigned." /></ListItem>
                                    )}
                                    {quizAssignments.filter(aq => aq.profile_id === profile.id).map(aq => {
                                      const quiz = savedQuizzes.find(q => q.id === aq.quiz_id)
                                      return quiz ? (
                                        <ListItem key={aq.quiz_id} alignItems="flex-start" secondaryAction={
                                          <Tooltip title="Copy shareable link">
                                            <IconButton
                                              color="primary"
                                              onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/attempt/${quiz.id}`)
                                                alert('Link copied!')
                                              }}
                                              edge="end"
                                              sx={{ ml: 1 }}
                                            >
                                              <ShareIcon />
                                            </IconButton>
                                          </Tooltip>
                                        }>
                                          <ListItemText
                                            primary={
                                              <Typography noWrap sx={{ maxWidth: 160 }}>
                                                {quiz.name}
                                              </Typography>
                                            }
                                          />
                                        </ListItem>
                                      ) : null
                                    })}
                                  </List>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    {tab === 5 && <AssessmentResults />}
                    {tab === 6 && <AssessmentReport />}
                    {tab === 7 && <PDFTemplateConfig />}
                  </>
                ) : (
                  // User Mode
                  <>
                    {tab === 0 && <UserDashboard user={user} userStats={userStats} />}
                    {tab === 1 && (
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="h4" sx={{ mb: 3 }}>Quiz Records</Typography>
                        {userQuizAttempts.length === 0 ? (
                          <Typography>No quiz attempts found.</Typography>
                        ) : (
                          <Grid container spacing={2}>
                            {userQuizAttempts.map((attempt) => (
                              <Grid item xs={12} sm={6} md={4} key={attempt.id}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="h6">{attempt.quiz_name}</Typography>
                                    <Typography color="text.secondary">
                                      Completed: {new Date(attempt.completed_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
            <Dialog open={howToOpen} onClose={() => setHowToOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>How to Use</DialogTitle>
              <DialogContent dividers>
                {isAdmin ? (
                  <ol>
                    <li><b>Admin Dashboard:</b> View system overview and statistics.</li>
                    <li><b>Profile Management:</b> Create and manage user profiles.</li>
                    <li><b>Packet Management:</b> Create question packets and add questions.</li>
                    <li><b>Quiz Builder:</b> Build quizzes by combining packets and assign to profiles.</li>
                    <li><b>Assigned Quizzes:</b> View and manage quiz assignments.</li>
                    <li><b>Assessment Results:</b> View detailed results and attempt records for all quizzes.</li>
                    <li><b>Assessment Report:</b> Generate and download PDF reports for individual quiz submissions with detailed analysis.</li>
                    <li><b>PDF Templates:</b> Configure PDF report templates with custom styling, colors, and layout options.</li>
                    <li><b>Upload Excel:</b> Bulk import data from Excel files.</li>
                  </ol>
                ) : (
                  <ol>
                    <li><b>Home:</b> View your dashboard with progress and assigned quizzes.</li>
                    <li><b>Quiz Records:</b> View your quiz attempt history and completion dates.</li>
                    <li><b>Take Quizzes:</b> Use the shareable links provided by your admin to take quizzes.</li>
                  </ol>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setHowToOpen(false)}>Close</Button>
              </DialogActions>
            </Dialog>
          </Box>
        } />
      </Routes>
    </ThemeProvider>
  )
}

export default App
