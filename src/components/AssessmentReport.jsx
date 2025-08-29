import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import PDFGenerator from '../services/pdfGenerator';

const AssessmentReport = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizPackets, setQuizPackets] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all data in parallel
      const [quizzesRes, profilesRes] = await Promise.all([
        fetch('http://localhost:3001/api/quizzes'),
        fetch('http://localhost:3001/api/profiles')
      ]);

      if (!quizzesRes.ok || !profilesRes.ok) {
        throw new Error('Failed to load data');
      }

      const quizzesData = await quizzesRes.json();
      const profilesData = await profilesRes.json();

      setQuizzes(quizzesData);
      setProfiles(profilesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = async (quiz) => {
    try {
      setLoading(true);
      setError('');
      setSelectedQuiz(quiz);

      // Load quiz attempts and packets for the selected quiz
      const [attemptsRes, packetsRes] = await Promise.all([
        fetch(`http://localhost:3001/api/quiz-attempts?quiz_id=${quiz.id}`),
        fetch(`http://localhost:3001/api/quiz-packets/${quiz.id}`)
      ]);

      if (!attemptsRes.ok || !packetsRes.ok) {
        throw new Error('Failed to load quiz data');
      }

      const attemptsData = await attemptsRes.json();
      const packetsData = await packetsRes.json();

      // Enrich attempts with user information
      const enrichedAttempts = await Promise.all(
        attemptsData.map(async (attempt) => {
          try {
            // Fetch user data for each attempt
            const userRes = await fetch(`http://localhost:3001/api/users/${attempt.user_id}`);
            if (userRes.ok) {
              const userData = await userRes.json();
              return {
                ...attempt,
                user: userData
              };
            }
            return attempt;
          } catch (err) {
            console.error('Failed to fetch user data:', err);
            return attempt;
          }
        })
      );

      setQuizAttempts(enrichedAttempts);
      setQuizPackets(packetsData);
      setShowDetails(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (attempt) => {
    try {
      setGeneratingPDF(true);
      
      // Get user data
      let userData = attempt.userData;
      if (!userData && attempt.user_id) {
        try {
          const userRes = await fetch(`http://localhost:3001/api/users/${attempt.user_id}`);
          if (userRes.ok) {
            userData = await userRes.json();
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }
      }
      
      // Get questions for all packets in this quiz
      const allQuestions = [];
      for (const packet of quizPackets) {
        const questionsRes = await fetch(`http://localhost:3001/api/questions?packet_id=${packet.id}`);
        if (questionsRes.ok) {
          const questions = await questionsRes.json();
          allQuestions.push(...questions);
        }
      }

      // Calculate packet scores
      const packetScores = quizPackets.map(packet => {
        const packetQuestions = allQuestions.filter(q => q.packet_id === packet.id);
        const correct = packetQuestions.filter(q => {
          // For now, we'll use a mock answer since we don't have actual user answers
          // In a real scenario, this would come from the attempt data
          return Math.random() > 0.5; // Mock: 50% chance of correct answer
        }).length;
        const total = packetQuestions.length;
        const score = total > 0 ? Math.round((correct / total) * 100) : 0;
        
        return {
          ...packet,
          score,
          correct,
          total,
          marks: correct,
          totalMarks: total
        };
      });
      
      // Create PDF generator instance
      const pdfGenerator = new PDFGenerator();
      
      // Generate the report
      await pdfGenerator.generateReport(
        selectedQuiz,
        userData || { user_name: 'Unknown User', email: 'No email' },
        attempt, // Pass the actual attempt data
        allQuestions,
        {}, // Mock answers - in real scenario, this would be attempt.answers
        quizPackets // Pass actual packet data with names
      );

      // Download the PDF
      const fileName = `${selectedQuiz.name}_${userData?.user_name || 'User'}_${new Date(attempt.completed_at).toISOString().split('T')[0]}.pdf`;
      pdfGenerator.downloadPDF(fileName);

    } catch (err) {
      setError(`Failed to generate PDF: ${err.message}`);
    } finally {
      setGeneratingPDF(false);
    }
  };



  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttempts = quizAttempts.filter(attempt => {
    const matchesSearch = searchTerm === '' || 
      (profiles.find(p => p.id === attempt.profile_id || p.id === attempt.user_id)?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'completed') return matchesSearch && attempt.status === 'completed';
    if (filterStatus === 'in-progress') return matchesSearch && attempt.status === 'in-progress';
    
    return matchesSearch;
  });

  const getProfileInfo = (attempt) => {
    // If we have user data from the enriched attempt, use it
    if (attempt.user) {
      return {
        name: attempt.user.user_name || attempt.user.email || 'Unknown User',
        email: attempt.user.email || 'No email',
        role: attempt.user.profile || 'No role'
      };
    }
    
    // Fallback: try to find profile by name if we have user data
    if (attempt.userData && attempt.userData.profile) {
      const profile = profiles.find(p => p.name === attempt.userData.profile);
      if (profile) {
        return {
          name: profile.name || 'Unknown User',
          email: profile.email || 'No email',
          role: profile.role || 'No role'
        };
      }
    }
    
    // Fallback to profile data if no user data
    const profile = profiles.find(p => p.id === attempt.profile_id || p.id === attempt.user_id);
    if (profile) {
      return {
        name: profile.name || 'Unknown User',
        email: profile.email || 'No email',
        role: profile.role || 'No role'
      };
    }
    
    // Final fallback
    return { name: 'Unknown User', email: 'No email', role: 'No role' };
  };

  const calculateScore = (attempt) => {
    // Calculate percentage based on correct answers vs total questions
    if (attempt.total_questions > 0) {
      const percentage = Math.round((attempt.correct_answers / attempt.total_questions) * 100);
      return Math.min(percentage, 100); // Cap at 100%
    }
    return 0;
  };

  if (loading && !selectedQuiz) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Assessment Reports
      </Typography>

      {!showDetails ? (
        // Quiz Selection View
        <Box>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>

          <Grid container spacing={3}>
            {filteredQuizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleQuizSelect(quiz)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" component="div">
                        {quiz.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Created: {formatDate(quiz.created_at)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Description: {quiz.description || 'No description available'}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label="Click to View Reports" 
                        color="primary" 
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredQuizzes.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No quizzes found matching your search.' : 'No quizzes available.'}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        // Quiz Details View
        <Box>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => setShowDetails(false)}
              sx={{ minWidth: 'auto' }}
            >
              ← Back to Quizzes
            </Button>
            
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {selectedQuiz.name} - Assessment Reports
            </Typography>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <TextField
              select
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <option value="all">All Attempts</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </TextField>
          </Box>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Profile</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Overall Score</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Completed</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttempts.map((attempt) => {
                  const profile = getProfileInfo(attempt);
                  const percentage = calculateScore(attempt);
                  
                  return (
                    <TableRow key={attempt.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {profile.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {profile.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={profile.role} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ textAlign: 'center' }}>
                          <Chip
                            label={`${percentage}%`}
                            color={getScoreColor(percentage)}
                            size="small"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          />
                          <Typography variant="caption" color="text.secondary" display="block">
                            {attempt.correct_answers || 0}/{attempt.total_questions || 0} questions
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={attempt.status || 'completed'}
                          color={attempt.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(attempt.completed_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Download PDF Report">
                          <IconButton
                            onClick={() => handleGeneratePDF(attempt)}
                            disabled={generatingPDF}
                            color="primary"
                            size="small"
                          >
                            {generatingPDF ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DownloadIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredAttempts.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No attempts found matching your criteria.' 
                  : 'No attempts found for this quiz.'}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              📊 Quiz Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Attempts: <strong>{quizAttempts.length}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Completed: <strong>{quizAttempts.filter(a => a.status === 'completed').length}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Packets: <strong>{quizPackets.length}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AssessmentReport; 