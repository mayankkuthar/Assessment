import { useState, useEffect } from 'react'



function AuthPage() {
  const [tab, setTab] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [profile, setProfile] = useState('')
  const [organization, setOrganization] = useState('') // Added organization state
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
        const response = await fetch('/api/profiles')
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

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleAuth = async (isSignUp) => {
    setLoading(true) // Move setLoading to the beginning for immediate feedback
    setError('')
    setSuccess('')
    setShowResend(false)

    let hasError = false; // Track if an error occurred
    
    try {
      if (isSignUp) {
        // Validate required fields for signup
        if (!userName.trim() || !email.trim() || !profile || !password.trim() || !organization) {
          setError('All fields are required for signup');
          hasError = true;
          return;
        }
        
        console.log('🚀 Starting signup process...', { email, userName, profile, userRole, organization })
        
        // Sign up using the API directly
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            role: userRole,
            user_name: userName,
            profile: profile,
            organization: organization // Include organization in signup request
          })
        });

        const result = await response.json();

        if (result.error) {
          // Handle specific signup errors
          if (result.error.toLowerCase().includes('already exists')) {
            setError('An account with this email already exists. Please use a different email or try logging in.');
          } else if (result.error.toLowerCase().includes('required')) {
            setError('Missing required fields. Please fill in all required information.');
          } else {
            setError(result.error);
          }
          hasError = true;
          return;
        }

        if (result.user) {
          console.log('✅ Signup successful, user created:', result.user);
          setSuccess('Account created successfully! Redirecting to sign-in...');
          // Clear form and switch to sign-in tab after successful signup
          setTimeout(() => {
            console.log('🔄 Switching to sign-in tab...');
            setTab(0); // Switch to Sign In tab
            setEmail('');
            setPassword('');
            setUserName('');
            setProfile('');
            setOrganization(''); // Clear organization field
            setUserRole('user');
            setSuccess('');
            setLoading(false); // Turn off loading after redirect
          }, 1000); // Reduce timeout to 1 second for faster redirection
        } else {
          console.log('❌ Signup failed - no user data returned');
          setError('Signup failed - please try again');
          hasError = true;
        }
      } else {
        // Sign in using the API directly
        const response = await fetch('/api/auth/signin', {
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
          // Handle specific login errors
          if (result.error.toLowerCase().includes('invalid email') || result.error.toLowerCase().includes('invalid password') || result.error.toLowerCase().includes('invalid credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (result.error.toLowerCase().includes('email') && result.error.toLowerCase().includes('not found')) {
            setError('No account found with this email. Please check your email or sign up for an account.');
          } else if (result.error.toLowerCase().includes('required')) {
            setError('Both email and password are required. Please fill in both fields.');
          } else {
            setError(result.error);
          }
          hasError = true;
          return;
        }

        if (result.user) {
          console.log('✅ Login successful, user:', result.user);
          // Store user in localStorage for persistence
          localStorage.setItem('currentUser', JSON.stringify(result.user));
          // Reload the page to trigger app re-render with authenticated user
          window.location.reload();
        } else {
          console.log('❌ Login failed - no user data returned');
          setError('Login failed - please try again');
          hasError = true;
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
      hasError = true;
    } finally {
      // Only set loading to false for login attempts or signup attempts that resulted in an error
      // Successful signup will turn off loading in the timeout after redirect
      if (!isSignUp || hasError) {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (newValue) => {
    setTab(newValue);
    if (newValue !== tab) {
      setEmail('');
      setPassword('');
      setUserName('');
      setProfile('');
      setOrganization('');
      setError('');
      setSuccess('');
      setShowResend(false);
      setResetEmailSent(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
          <img 
            src="https://happimynd.com/assets/Frontend/images/happimynd_logo.png"
            alt="HappiMynd Logo"
            style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
          />
        </div>
        
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-6)', fontWeight: 700, fontSize: 'var(--text-2xl)', color: 'var(--color-fg)' }}>
          Assessment Tool
        </h2>
        
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)', gap: 'var(--space-2)' }}>
          <button 
            style={{ flex: 1, padding: 'var(--space-2)', borderBottom: tab === 0 ? '2px solid var(--color-primary)' : '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontWeight: tab === 0 ? 700 : 500, color: tab === 0 ? 'var(--color-primary)' : 'var(--color-muted-fg)' }}
            onClick={() => handleTabChange(0)}
          >
            Login
          </button>
          <button 
            style={{ flex: 1, padding: 'var(--space-2)', borderBottom: tab === 1 ? '2px solid var(--color-primary)' : '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontWeight: tab === 1 ? 700 : 500, color: tab === 1 ? 'var(--color-primary)' : 'var(--color-muted-fg)' }}
            onClick={() => handleTabChange(1)}
          >
            Sign Up
          </button>
          <button 
            style={{ flex: 1, padding: 'var(--space-2)', borderBottom: tab === 2 ? '2px solid var(--color-primary)' : '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontWeight: tab === 2 ? 700 : 500, color: tab === 2 ? 'var(--color-primary)' : 'var(--color-muted-fg)' }}
            onClick={() => handleTabChange(2)}
          >
            Forgot Password
          </button>
        </div>
        
        {/* Forgot Password Tab */}
        {tab === 2 ? (
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            setLoading(true);
            setError('');
            setSuccess('');
            setResetEmailSent(true);
            setLoading(false);
          }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {error && <div className="alert alert--error">{error}</div>}
            {success && <div className="alert alert--success" style={{ backgroundColor: '#E9D5FF', color: '#18181B', border: '1px solid #895BF5', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>{success}</div>}
            
            {resetEmailSent && (
              <div className="alert" style={{ backgroundColor: '#E9D5FF', color: '#18181B', border: '1px solid #E9D5FF', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                <strong>Check your email!</strong> We've sent a password reset link to {email}. Click the link in the email to reset your password.
              </div>
            )}

            <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>Reset Password</button>
          </form>
        ) : (
          // Login / Sign Up Tabs
          <form onSubmit={(e) => { e.preventDefault(); handleAuth(tab === 1); }}>
            {error && <div className="alert alert--error">{error}</div>}
            {success && <div className="alert alert--success" style={{ backgroundColor: '#E9D5FF', color: '#18181B', border: '1px solid #895BF5', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>{success}</div>}
            
            {tab === 1 && (
              <div className="form-group">
                <label className="form-label">User Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {tab === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Profile</label>
                  <select
                    className="form-input"
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    required
                    disabled={loadingProfiles}
                  >
                    <option value="" disabled>Select a profile</option>
                    {loadingProfiles ? (
                      <option disabled>Loading profiles...</option>
                    ) : (
                      profiles.map((profileItem) => (
                        <option key={profileItem.id} value={profileItem.name}>
                          {profileItem.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <select
                    className="form-input"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select an organization</option>
                    <option value="HappiMynd">HappiMynd</option>
                    <option value="Individual">Individual</option>
                    <option value="PCI">PCI</option>
                    <option value="Sparsh Hospital">Sparsh Hospital</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary"
              style={{ width: '100%', marginBottom: 'var(--space-4)' }}
              disabled={loading || (tab === 1 && (!userName.trim() || !email.trim() || !profile || !password.trim() || !organization))}
            >
              {loading ? (tab === 1 ? 'Signing Up...' : 'Logging In...') : (tab === 0 ? 'Login' : 'Sign Up')}
            </button>

            {tab === 1 && (
              <div className="alert" style={{ backgroundColor: '#E9D5FF', color: '#18181B', border: '1px solid #E9D5FF', fontSize: 'var(--text-sm)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                <strong>Note:</strong> Your profile selection enables us to guide you better in the expert sessions. Make sure to select the correct profile that matches your role.
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage