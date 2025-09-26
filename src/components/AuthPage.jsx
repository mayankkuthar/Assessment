import { useState, useEffect } from 'react'

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})

function AuthPage() {
  const [tab, setTab] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [profile, setProfile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userRole, setUserRole] = useState('user')
  const [showResend, setShowResend] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)

  // Fetch available profiles from the database
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoadingProfiles(true)
      try {
        const response = await fetch('http://localhost:3001/api/profiles')
        if (response.ok) {
          const profilesData = await response.json()
          setProfiles(profilesData)
        }
      } catch (err) {
        console.error('Error fetching profiles:', err)
      } finally {
        setLoadingProfiles(false)
      }
    }

    fetchProfiles()
  }, [])

  const handleAuth = async (isSignUp) => {
    setLoading(true)
    setError('')
    setSuccess('')
    setShowResend(false)

    try {
      if (isSignUp) {
        // Validate required fields for signup
        if (!userName.trim() || !email.trim() || !profile || !password.trim()) {
          throw new Error('All fields are required for signup')
        }
        
        console.log('🚀 Starting signup process...', { email, userName, profile, userRole })
        
        // Sign up using the API directly
        const response = await fetch('http://localhost:3001/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            role: userRole,
            user_name: userName,
            profile: profile
          })
        });

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.user) {
          console.log('✅ Signup successful, user created:', result.user);
          setSuccess('Account created successfully! Redirecting to sign-in in 2 seconds...');
          // Clear form and switch to sign-in tab after successful signup
          setTimeout(() => {
            console.log('🔄 Switching to sign-in tab...');
            setTab(0); // Switch to Sign In tab
            setEmail('');
            setPassword('');
            setUserName('');
            setProfile('');
            setUserRole('user');
            setSuccess('');
          }, 2000); // Wait 2 seconds then switch
        } else {
          console.log('❌ Signup failed - no user data returned');
          setError('Signup failed - please try again');
        }
      } else {
        // Sign in using the API directly
        const response = await fetch('http://localhost:3001/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          })
        });

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.user) {
          // Store user in localStorage and redirect
          localStorage.setItem('currentUser', JSON.stringify(result.user));
          window.location.reload(); // Refresh to trigger auth state change
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Email verification not available in local mode
      setSuccess('Email verification not available in local mode. Please contact your administrator.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Password reset not available in local mode
      setSuccess('Password reset not available in local mode. Please contact your administrator.')
      setResetEmailSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 2
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
              Assessment Tool
            </Typography>
            
            <Tabs value={tab} onChange={(e, newValue) => {
              setTab(newValue)
              // Reset form fields when switching tabs
              if (newValue !== tab) {
                setEmail('')
                setPassword('')
                setUserName('')
                setProfile('')
                setError('')
                setSuccess('')
                setShowResend(false)
                setResetEmailSent(false)
              }
            }} sx={{ mb: 3 }}>
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
              <Tab label="Forgot Password" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
                {success.includes('Account created successfully') && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setTab(0)
                        setEmail('')
                        setPassword('')
                        setUserName('')
                        setProfile('')
                        setUserRole('user')
                        setSuccess('')
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Go to Sign In Now
                    </Button>
                  </Box>
                )}
              </Alert>
            )}

            {tab === 2 ? (
              // Forgot Password Tab
              <Box>
                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleForgotPassword}
                  disabled={loading || !email}
                  sx={{ mb: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                {resetEmailSent && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Check your email!</strong> We've sent a password reset link to {email}. 
                      Click the link in the email to reset your password.
                    </Typography>
                  </Alert>
                )}
              </Box>
            ) : (
              // Sign In / Sign Up Tabs
              <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAuth(tab === 1); }}>
                {tab === 1 && (
                  <TextField
                    fullWidth
                    label="User Name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    sx={{ mb: 2 }}
                    required
                  />
                )}
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                
                {tab === 1 && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Profile</InputLabel>
                    <Select
                      value={profile}
                      label="Profile"
                      onChange={(e) => setProfile(e.target.value)}
                      required
                      disabled={loadingProfiles}
                    >
                      {loadingProfiles ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading profiles...
                        </MenuItem>
                      ) : (
                        profiles.map((profileItem) => (
                          <MenuItem key={profileItem.id} value={profileItem.name}>
                            {profileItem.name} ({profileItem.role})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                )}
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />

                {tab === 1 && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      value={userRole}
                      label="Account Type"
                      onChange={(e) => setUserRole(e.target.value)}
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || (tab === 1 && (!userName.trim() || !email.trim() || !profile || !password.trim()))}
                  sx={{ mb: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    tab === 0 ? 'Sign In' : 'Sign Up'
                  )}
                </Button>

                {tab === 1 && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Note:</strong> Your profile selection determines which quizzes you can access. 
                      Make sure to select the correct profile that matches your role.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  )
}

export default AuthPage 