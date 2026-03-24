import { useState, useEffect } from "react";

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
  CircularProgress,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
});

function AuthPage() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [profile, setProfile] = useState("");
  const [organization, setOrganization] = useState(""); // Added organization state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [showResend, setShowResend] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  // Fetch available profiles from the database
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const response = await fetch("http://65.1.6.81:3001/api/profiles");
        if (response.ok) {
          const profilesData = await response.json();
          setProfiles(profilesData);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, []);

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleAuth = async (isSignUp) => {
    setLoading(true); // Move setLoading to the beginning for immediate feedback
    setError("");
    setSuccess("");
    setShowResend(false);

    let hasError = false; // Track if an error occurred

    try {
      if (isSignUp) {
        // Validate required fields for signup
        if (
          !userName.trim() ||
          !email.trim() ||
          !profile ||
          !password.trim() ||
          !organization
        ) {
          setError("All fields are required for signup");
          hasError = true;
          return;
        }

        console.log("🚀 Starting signup process...", {
          email,
          userName,
          profile,
          userRole,
          organization,
        });

        // Sign up using the API directly
        const response = await fetch("http://65.1.6.81:3001/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            role: userRole,
            user_name: userName,
            profile: profile,
            organization: organization, // Include organization in signup request
          }),
        });

        const result = await response.json();

        if (result.error) {
          // Handle specific signup errors
          if (result.error.toLowerCase().includes("already exists")) {
            setError(
              "An account with this email already exists. Please use a different email or try logging in.",
            );
          } else if (result.error.toLowerCase().includes("required")) {
            setError(
              "Missing required fields. Please fill in all required information.",
            );
          } else {
            setError(result.error);
          }
          hasError = true;
          return;
        }

        if (result.user) {
          console.log("✅ Signup successful, user created:", result.user);
          setSuccess("Account created successfully! Redirecting to sign-in...");
          // Clear form and switch to sign-in tab after successful signup
          setTimeout(() => {
            console.log("🔄 Switching to sign-in tab...");
            setTab(0); // Switch to Sign In tab
            setEmail("");
            setPassword("");
            setUserName("");
            setProfile("");
            setOrganization(""); // Clear organization field
            setUserRole("user");
            setSuccess("");
            setLoading(false); // Turn off loading after redirect
          }, 1000); // Reduce timeout to 1 second for faster redirection
        } else {
          console.log("❌ Signup failed - no user data returned");
          setError("Signup failed - please try again");
          hasError = true;
        }
      } else {
        // Sign in using the API directly
        const response = await fetch("http://65.1.6.81:3001/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const result = await response.json();

        if (result.error) {
          // Handle specific login errors
          if (
            result.error.toLowerCase().includes("invalid email") ||
            result.error.toLowerCase().includes("invalid password") ||
            result.error.toLowerCase().includes("invalid credentials")
          ) {
            setError(
              "Invalid email or password. Please check your credentials and try again.",
            );
          } else if (
            result.error.toLowerCase().includes("email") &&
            result.error.toLowerCase().includes("not found")
          ) {
            setError(
              "No account found with this email. Please check your email or sign up for an account.",
            );
          } else if (result.error.toLowerCase().includes("required")) {
            setError(
              "Both email and password are required. Please fill in both fields.",
            );
          } else {
            setError(result.error);
          }
          hasError = true;
          return;
        }

        if (result.user) {
          console.log("✅ Login successful, user:", result.user);
          // Store user in localStorage for persistence
          localStorage.setItem("currentUser", JSON.stringify(result.user));
          // Reload the page to trigger app re-render with authenticated user
          window.location.reload();
        } else {
          console.log("❌ Login failed - no user data returned");
          setError("Login failed - please try again");
          hasError = true;
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);
      if (err.message.includes("Failed to fetch")) {
        setError(
          "Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else {
        setError(
          err.message || "An unexpected error occurred. Please try again.",
        );
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

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, width: "100%" }}>
          <CardContent sx={{ p: 4 }}>
            {/* HappiMynd Logo */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <img
                src="https://happimynd.com/assets/Frontend/images/happimynd_logo.png"
                alt="HappiMynd Logo"
                style={{
                  height: "60px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>

            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 3, fontWeight: "bold" }}
            >
              Assessment Tool
            </Typography>

            <Tabs
              value={tab}
              onChange={(e, newValue) => {
                setTab(newValue);
                // Reset form fields when switching tabs
                if (newValue !== tab) {
                  setEmail("");
                  setPassword("");
                  setUserName("");
                  setProfile("");
                  setOrganization(""); // Reset organization field
                  setError("");
                  setSuccess("");
                  setShowResend(false);
                  setResetEmailSent(false);
                }
              }}
              sx={{ mb: 3 }}
            >
              <Tab label="Login" />
              <Tab label="Sign Up" />
              <Tab label="Forgot Password" sx={{ textTransform: "none" }} />
            </Tabs>

            {/* Forgot Password Tab */}
            {tab === 2 ? (
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setLoading(true);
                  setError("");
                  setSuccess("");
                  setResetEmailSent(true);
                  setLoading(false);
                }}
              >
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />

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

                {resetEmailSent && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Check your email!</strong> We've sent a password
                      reset link to {email}. Click the link in the email to
                      reset your password.
                    </Typography>
                  </Alert>
                )}
              </Box>
            ) : (
              // Login / Sign Up Tabs
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuth(tab === 1);
                }}
              >
                {/* Error and Success Alerts */}
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
                  <>
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
                            <MenuItem
                              key={profileItem.id}
                              value={profileItem.name}
                            >
                              {profileItem.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>

                    {/* Organization Dropdown */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Organization</InputLabel>
                      <Select
                        value={organization}
                        label="Organization"
                        onChange={(e) => setOrganization(e.target.value)}
                        required
                      >
                        <MenuItem value="HappiMynd">HappiMynd</MenuItem>
                        <MenuItem value="Individual">Individual</MenuItem>
                        <MenuItem value="Nuvoco">Nuvoco</MenuItem>
                        <MenuItem value="PCI">PCI</MenuItem>
                        <MenuItem value="Sparsh Hospital">
                          Sparsh Hospital
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </>
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={
                    loading ||
                    (tab === 1 &&
                      (!userName.trim() ||
                        !email.trim() ||
                        !profile ||
                        !password.trim() ||
                        !organization))
                  }
                  sx={{ mb: 2 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={24}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      {tab === 1 ? "Signing Up..." : "Logging In..."}
                    </>
                  ) : tab === 0 ? (
                    "Login"
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                {tab === 1 && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Note:</strong> Your profile selection enables us
                      to guide you better in the expert sessions. Make sure to
                      select the correct profile that matches your role.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}

export default AuthPage;
