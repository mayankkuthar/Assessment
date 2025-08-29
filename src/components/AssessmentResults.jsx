import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Score as ScoreIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useDatabase } from '../hooks/useDatabase';

const AssessmentResults = () => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizPackets, setQuizPackets] = useState([]);

  const { quizzes, packets, profiles, loading: dataLoading, error: dataError } = useDatabase();

  // Fetch attempts for a specific quiz
  const fetchQuizAttempts = async (quizId) => {
    setLoading(true);
    setError(null);
    
    try {
      // First get the quiz packets to know what columns to show
      const packetsResponse = await fetch(`http://localhost:3001/api/quiz-packets/${quizId}`);
      if (packetsResponse.ok) {
        const quizPacketsData = await packetsResponse.json();
        setQuizPackets(quizPacketsData);
      }

      const response = await fetch(`http://localhost:3001/api/quiz-attempts`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz attempts');
      }
      
      const allAttempts = await response.json();
      
      // Filter attempts for this specific quiz
      const quizAttempts = allAttempts.filter(attempt => attempt.quiz_id === quizId);
      
      // Enrich attempts with user and profile data
      const enrichedAttempts = await Promise.all(
        quizAttempts.map(async (attempt) => {
          try {
            // Fetch actual user data for each attempt
            let userData = null;
            if (attempt.user_id) {
              const userResponse = await fetch(`http://localhost:3001/api/users/${attempt.user_id}`);
              if (userResponse.ok) {
                userData = await userResponse.json();
              }
            }
            
            // Find profile by name (since users now store profile name as string)
            let profile = null;
            if (userData && userData.profile) {
              // Find profile by the name stored in user data
              profile = profiles.find(p => p.name === userData.profile);
            }
            
            // Fallback: try to find by profile_id if available
            if (!profile && attempt.profile_id) {
              profile = profiles.find(p => p.id === attempt.profile_id);
            }
            
            // Create user object with actual user data
            let user = null;
            if (userData) {
              user = {
                name: userData.user_name || userData.email || 'Unknown User',
                email: userData.email || 'No email'
              };
            } else if (profile) {
              // Fallback to profile data if no user data
              user = {
                name: profile.name || 'Unknown User',
                email: profile.email || 'No email'
              };
            } else {
              // Last resort: show user ID
              user = { 
                name: `User ${attempt.user_id || attempt.profile_id || 'Unknown'}`, 
                email: 'No email' 
              };
            }
            
            return {
              ...attempt,
              profile: profile || { name: 'Unknown Profile', email: 'No email', role: 'No role' },
              user: user || { name: 'Unknown User', email: 'No email' }
            };
          } catch (err) {
            console.error('Failed to fetch user data for attempt:', attempt.id, err);
            // Return attempt with fallback data
            return {
              ...attempt,
              profile: { name: 'Unknown Profile', email: 'No email', role: 'No role' },
              user: { name: 'Unknown User', email: 'No email' }
            };
          }
        })
      );
      
      setQuizAttempts(enrichedAttempts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    fetchQuizAttempts(quiz.id);
  };

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
    setQuizAttempts([]);
    setError(null);
    setQuizPackets([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not submitted';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  // Get performance level based on marks using custom scoring scale
  const getPerformanceLevel = (marks, packetName) => {
    // Try to get custom scaling from localStorage for this packet
    try {
      const savedScaling = localStorage.getItem('packetScaling_' + packetName);
      if (savedScaling) {
        const customScale = JSON.parse(savedScaling);
        if (customScale.enabled && customScale.scales && customScale.scales.length > 0) {
          // Use custom scale for this packet
          const level = customScale.scales.find(range => marks >= range.min && marks <= range.max);
          if (level) {
            return level;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse custom scaling for packet:', packetName, error);
    }
    
    // Fallback to default scoring scale
    const defaultScale = [
      { min: 0, max: 2, label: "Needs Improvement", color: "#ff6b6b", image: "📚" },
      { min: 3, max: 5, label: "Average", color: "#ffd93d", image: "📊" },
      { min: 6, max: 8, label: "Good", color: "#6bcf7f", image: "🎯" },
      { min: 9, max: 12, label: "Excellent", color: "#4ecdc4", image: "🏆" }
    ];
    
    // Find the performance level for the given marks
    const level = defaultScale.find(range => marks >= range.min && marks <= range.max);
    return level || defaultScale[0]; // Return first level if no match found
  };

  // Calculate overall performance level for the entire quiz attempt
  const getOverallPerformanceLevel = (attempt) => {
    if (attempt.packet_marks && Object.keys(attempt.packet_marks).length > 0) {
      // Calculate total marks and find overall performance
      const totalMarks = attempt.total_marks || 0;
      const totalQuestions = attempt.total_questions || 0;
      
      // Use a default scale for overall performance (can be customized later)
      const overallScale = [
        { min: 0, max: 10, label: "Needs Improvement", color: "#ff6b6b", image: "📚" },
        { min: 11, max: 20, label: "Average", color: "#ffd93d", image: "📊" },
        { min: 21, max: 30, label: "Good", color: "#6bcf7f", image: "🎯" },
        { min: 31, max: 50, label: "Excellent", color: "#4ecdc4", image: "🏆" }
      ];
      
      const level = overallScale.find(range => totalMarks >= range.min && totalMarks <= range.max);
      return {
        level: level || overallScale[0],
        totalMarks,
        totalQuestions
      };
    }
    
    // Fallback for old data
    return {
      level: { label: "Unknown", color: "#999", image: "❓" },
      totalMarks: 0,
      totalQuestions: 0
    };
  };

  // Calculate packet-based scores for an attempt
  const calculatePacketScores = (attempt) => {
    const packetScores = {};
    
    // Use packet_marks (new marks-based system)
    if (attempt.packet_marks && Object.keys(attempt.packet_marks).length > 0) {
      quizPackets.forEach(packet => {
        const packetData = attempt.packet_marks[packet.name];
        if (packetData) {
          packetScores[packet.id] = {
            marks: packetData.marks,
            questions: packetData.questions,
            performanceLevel: getPerformanceLevel(packetData.marks, packet.name)
          };
        } else {
          packetScores[packet.id] = {
            marks: 0,
            questions: 0,
            performanceLevel: getPerformanceLevel(0, packet.name)
          };
        }
      });
    } else {
      // Fallback for attempts without packet_marks
      quizPackets.forEach(packet => {
        packetScores[packet.id] = {
          marks: 0,
          questions: 0,
          performanceLevel: getPerformanceLevel(0, packet.name)
        };
      });
    }
    
    return packetScores;
  };

  if (dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (dataError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading data: {dataError}
      </Alert>
    );
  }

  // If a quiz is selected, show the attempts view
  if (selectedQuiz) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBackToQuizzes} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
              Assessment Results: {selectedQuiz.name}
            </Typography>
                         <Typography variant="body1" color="text.secondary">
               View all attempt records for this quiz with performance levels and packet-by-packet analysis
             </Typography>
          </Box>
        </Box>

        {/* Quiz Info Card */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Quiz Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Description:</strong> {selectedQuiz.description || 'No description'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Time Limit:</strong> {selectedQuiz.time_limit ? `${selectedQuiz.time_limit} minutes` : 'No time limit'}
                </Typography>
                <Typography variant="body2">
                  <strong>Passing Score:</strong> {selectedQuiz.passing_score ? `${selectedQuiz.passing_score}%` : 'Not set'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Statistics
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Total Attempts:</strong> {quizAttempts.length}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Packets:</strong> {quizPackets.length}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Completion Rate:</strong> {
                    quizAttempts.length > 0
                      ? `${Math.round((quizAttempts.filter(a => a.status === 'completed').length / quizAttempts.length) * 100)}%`
                      : 'No attempts'
                  }
                </Typography>


              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Attempts List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : quizAttempts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <AssessmentIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No attempts found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This quiz hasn't been attempted by any users yet.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 3, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                     <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                   <TableCell sx={{ fontWeight: 600 }}>Profile</TableCell>
                   <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                   <TableCell sx={{ fontWeight: 600 }}>Completed</TableCell>
                  {/* Dynamic packet columns */}
                  {quizPackets.map(packet => (
                    <TableCell key={packet.id} sx={{ fontWeight: 600, minWidth: 120 }}>
                      {packet.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {quizAttempts.map((attempt) => {
                  const packetScores = calculatePacketScores(attempt);
                  
                  return (
                    <TableRow key={attempt.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {attempt.user?.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {attempt.user?.email || 'No email'}
                          </Typography>
                        </Box>
                      </TableCell>
                                             <TableCell>
                         <Box>
                           <Typography variant="body2" sx={{ fontWeight: 500 }}>
                             {attempt.profile?.name || 'Unknown Profile'}
                           </Typography>
                           <Typography variant="caption" color="text.secondary">
                             {attempt.profile?.role || 'No role'}
                           </Typography>
                         </Box>
                       </TableCell>

                       <TableCell>
                        <Chip
                          label={attempt.status || 'Unknown'}
                          color={attempt.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(attempt.completed_at)}
                        </Typography>
                      </TableCell>
                      {/* Packet score columns */}
                      {quizPackets.map(packet => {
                        const packetScore = packetScores[packet.id];
                        return (
                          <TableCell key={packet.id}>
                            <Box sx={{ textAlign: 'center' }}>
                                                                                            <Chip
                                 label={`${packetScore.performanceLevel.image} ${packetScore.performanceLevel.label}`}
                                 sx={{
                                   backgroundColor: packetScore.performanceLevel.color,
                                   color: 'white',
                                   fontWeight: 'bold',
                                   mb: 0.5
                                 }}
                                 size="small"
                               />
                               <Typography variant="caption" color="text.secondary" display="block">
                                 {packetScore.questions} questions
                               </Typography>
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  }

  // Show quizzes grid
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
          Assessment Results
        </Typography>
                 <Typography variant="body1" color="text.secondary">
           Click on any quiz to view detailed attempt records with performance levels and packet-by-packet analysis
         </Typography>
      </Box>

      {/* Quizzes Grid */}
      {quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No quizzes available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create some quizzes first to view assessment results.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => handleQuizClick(quiz)}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      mr: 2
                    }}>
                      <QuizIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {quiz.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                    {quiz.description || 'No description available'}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Time Limit
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {quiz.time_limit ? `${quiz.time_limit} min` : 'No limit'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Passing Score
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {quiz.passing_score ? `${quiz.passing_score}%` : 'Not set'}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      startIcon={<AssessmentIcon />}
                    >
                      View Results
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AssessmentResults;
