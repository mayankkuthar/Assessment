import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
  },
  typography: {
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
  },
})

function PasswordReset() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Password reset not available in local mode
    setError('Password reset not available in local mode. Please contact your administrator.')
  }, [])

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Password update not available in local mode
      setSuccess('Password update not available in local mode. Please contact your administrator.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/')
  }

  if (!session && !error) {
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
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Verifying reset link...</Typography>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    )
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
              Reset Password
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {session ? (
              <Box component="form" onSubmit={handlePasswordReset}>
                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                  Enter your new password below.
                </Typography>

                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                  helperText="Password must be at least 6 characters long"
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !password || !confirmPassword}
                  sx={{ mb: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleBackToLogin}
                  sx={{ mt: 2 }}
                >
                  Back to Login
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  )
}

export default PasswordReset 