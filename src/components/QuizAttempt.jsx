import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  Button, 
  Box, 
  CircularProgress, 
  Alert,
  LinearProgress,
  Fade,
  Slide,
  Chip,
  Zoom,
  Grow,
  Paper
} from '@mui/material';
import { 
  CheckCircle, 
  Quiz as QuizIcon
} from '@mui/icons-material';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [quizAssignment, setQuizAssignment] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [questionAnimationKey, setQuestionAnimationKey] = useState(0);

  useEffect(() => {
    // Get current user from localStorage
    const getCurrentUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          setUser(currentUser);
          setUserProfile(currentUser.profile || 'user');
        }
      } catch (err) {
        console.error('Error getting current user:', err);
      }
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    const checkQuizAccess = async () => {
      if (!user || !userProfile) return;

      try {
        // Check if user has access to this quiz based on profile
        const assignmentResponse = await fetch(`http://localhost:3001/api/quiz-assignments`);
        if (assignmentResponse.ok) {
          const assignments = await assignmentResponse.json();
          
          // Get profiles to match profile names with IDs
          const profilesResponse = await fetch(`http://localhost:3001/api/profiles`);
          if (profilesResponse.ok) {
            const profiles = await profilesResponse.json();
            
            // Find the profile that matches the user's profile name exactly
            const userProfileData = profiles.find(p => 
              p.name === userProfile
            );
            
            if (!userProfileData) {
              setAccessDenied(true);
              setError(`Access Denied: Your profile "${userProfile}" is not found in the system. Please contact your administrator.`);
              return;
            }
            
            // Find quiz assignment for this profile
            const userAssignment = assignments.find(a => 
              a.quiz_id === quizId && a.profile_id === userProfileData.id
            );
            
            if (!userAssignment) {
              setAccessDenied(true);
              setError(`Access Denied: This quiz is not assigned to your profile (${userProfile}). Please contact your administrator.`);
              return;
            }
            
            setQuizAssignment(userAssignment);
          }
        }
      } catch (err) {
        console.error('Error checking quiz access:', err);
        setError('Failed to verify quiz access. Please try again.');
      }
    };

    checkQuizAccess();
  }, [user, userProfile, quizId]);

  useEffect(() => {
    const loadQuiz = async () => {
      if (accessDenied) return;
      
      try {
        setLoading(true);
        setError(null);

        // Get quiz data
        const quizResponse = await fetch(`http://localhost:3001/api/quizzes/${quizId}`);
        if (!quizResponse.ok) {
          throw new Error('Quiz not found');
        }
        const quizData = await quizResponse.json();
        setQuiz(quizData);

        // Get quiz packets to find questions
        const packetsResponse = await fetch(`http://localhost:3001/api/quiz-packets/${quizId}`);
        if (!packetsResponse.ok) {
          throw new Error('Failed to load quiz packets');
        }
        const packets = await packetsResponse.json();

        // Get all questions from all packets
        const allQuestions = [];
        for (const packet of packets) {
          const questionsResponse = await fetch(`http://localhost:3001/api/questions?packet_id=${packet.id}`);
          if (questionsResponse.ok) {
            const packetQuestions = await questionsResponse.json();
            packetQuestions.forEach(q => {
              allQuestions.push({
                ...q,
                packetName: packet.name
              });
            });
          }
        }

        setQuestions(allQuestions);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, accessDenied]);

  const handleChange = (qid, value) => {
    setSelectedOption(value);
    setAnswers({ ...answers, [qid]: value });
    
    // Enhanced feedback animation
    setShowAnswerFeedback(true);
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      setIsTransitioning(true);
      setShowAnswerFeedback(false);
      
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setQuestionAnimationKey(prev => prev + 1);
        }
        setIsTransitioning(false);
        setSelectedOption('');
      }, 400);
    }, 1200);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionAnimationKey(prev => prev + 1);
        setIsTransitioning(false);
      }, 400);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setQuestionAnimationKey(prev => prev + 1);
        setIsTransitioning(false);
      }, 400);
    }
  };

  const handleSubmit = async () => {
    try {
      // Calculate marks based on selected options (new scoring system)
      let totalMarks = 0;
      let totalQuestions = questions.length;
      let packetMarks = {}; // Track marks per packet

      questions.forEach(q => {
        const userAnswer = answers[q.id];
        if (userAnswer && q.options) {
          // Find the selected option and get its marks
          const selectedOption = q.options.find(opt => {
            const optionText = typeof opt === 'object' ? opt.text : opt;
            return optionText.toLowerCase() === userAnswer.toLowerCase();
          });
          
          if (selectedOption) {
            const optionMarks = typeof selectedOption === 'object' ? selectedOption.marks : (q.marks || 1);
            totalMarks += optionMarks;
            
            // Track marks per packet
            if (q.packetName) {
              if (!packetMarks[q.packetName]) {
                packetMarks[q.packetName] = { marks: 0, questions: 0 };
              }
              packetMarks[q.packetName].marks += optionMarks;
              packetMarks[q.packetName].questions += 1;
            }
          }
        }
      });

      // Calculate percentage for backward compatibility (but we'll focus on marks)
      const score = totalQuestions > 0 ? Math.round((totalMarks / (questions.reduce((sum, q) => {
        const maxMarks = q.options ? q.options.reduce((optSum, opt) => {
          const optMarks = typeof opt === 'object' ? opt.marks : (q.marks || 1);
          return optSum + optMarks;
        }, 0) : (q.marks || 1);
        return sum + maxMarks;
      }, 0))) * 100) : 0;

      // Save quiz attempt to database with new marks-based scoring
      const attemptResponse = await fetch('http://localhost:3001/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz_id: quizId,
          profile_id: quizAssignment.profile_id, // Use the assignment profile_id
          user_id: user?.id || '1',
          score: score, // Keep percentage for backward compatibility
          total_questions: totalQuestions,
          correct_answers: totalMarks, // Store total marks instead of correct answers count
          status: 'completed',
          completed_at: new Date().toISOString(),
          // New fields for marks-based scoring
          total_marks: totalMarks,
          packet_marks: packetMarks
        })
      });

      if (!attemptResponse.ok) {
        throw new Error('Failed to save quiz attempt');
      }

      // Show success message and redirect to dashboard
      alert('Quiz submitted successfully! Redirecting to dashboard...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Paper elevation={24} sx={{ 
          p: 4, 
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <QuizIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Loading your quiz...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (accessDenied) {
    return (
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        mt: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        p: 2,
        margin: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}>
        <Grow in timeout={800}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>Access Denied</Typography>
            <Typography>{error}</Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/')}
            >
              Return to Dashboard
            </Button>
          </Alert>
        </Grow>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        mt: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        p: 2
      }}>
        <Grow in timeout={800}>
          <Alert 
            severity="error"
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>Error Loading Quiz</Typography>
            <Typography>{error}</Typography>
          </Alert>
        </Grow>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        mt: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        p: 2
      }}>
        <Grow in timeout={800}>
          <Alert 
            severity="warning"
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h6">Quiz Not Found</Typography>
            <Typography>The requested quiz could not be found.</Typography>
          </Alert>
        </Grow>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: { xs: '100px', md: '200px' },
              height: { xs: '100px', md: '200px' },
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              animation: `float ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' }
              }
            }}
          />
        ))}
      </Box>

      <Box sx={{ 
        maxWidth: { xs: '100%', sm: '90%', md: '900px' }, 
        mx: 'auto', 
        px: { xs: 1, sm: 2 },
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Enhanced Header */}
        <Slide direction="down" in timeout={800}>
          <Paper elevation={8} sx={{ 
            textAlign: 'center', 
            mb: 3, 
            p: 3,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <QuizIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}>
                {quiz.name}
              </Typography>
            </Box>
            
          </Paper>
        </Slide>

        {/* Enhanced Progress Bar */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                Progress
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                }
              }} 
            />
          </Box>
        </Fade>

        {/* Enhanced Question Card */}
        <Zoom in={!isTransitioning} timeout={500} key={questionAnimationKey}>
          <Card sx={{ 
            mb: 4,
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(255,255,255,0.3)',
            minHeight: { xs: '60vh', sm: '50vh' },
            position: 'relative',
            overflow: 'hidden',
            transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}>
            {/* Decorative Header */}
            <Box sx={{
              height: 6,
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              width: '100%'
            }} />
            
            <CardContent sx={{ p: { xs: 3, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {currentQuestion && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Enhanced Answer Feedback */}
                  {showAnswerFeedback && (
                    <Slide direction="down" in={showAnswerFeedback} timeout={400}>
                      <Paper elevation={8} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 3,
                        p: 2,
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        borderRadius: 3,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          animation: 'shimmer 1s ease-out',
                          '@keyframes shimmer': {
                            '0%': { left: '-100%' },
                            '100%': { left: '100%' }
                          }
                        }
                      }}>
                        <Zoom in timeout={300}>
                          <CheckCircle sx={{ mr: 1, fontSize: 28 }} />
                        </Zoom>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Perfect! Moving to next question...
                        </Typography>
                      </Paper>
                    </Slide>
                  )}


                  {/* Enhanced Question Text */}
                  <Grow in timeout={600}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 4, 
                        fontWeight: 500,
                        lineHeight: 1.7,
                        color: 'text.primary',
                        flex: 1,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -16,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          borderRadius: 2
                        }
                      }}
                    >
                      {currentQuestion.question_text}
                    </Typography>
                  </Grow>

                  {/* Enhanced MCQ Options */}
                  {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ''}
                      onChange={e => handleChange(currentQuestion.id, e.target.value)}
                    >
                      {currentQuestion.options.map((opt, i) => {
                        const optionText = typeof opt === 'object' ? opt.text : opt;
                        const isSelected = answers[currentQuestion.id] === optionText;
                        
                        return (
                          <Grow key={i} in timeout={700 + i * 100}>
                            <FormControlLabel 
                              value={optionText} 
                              control={
                                <Radio 
                                  sx={{ 
                                    '&.Mui-checked': { 
                                      color: 'primary.main',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'transform 0.2s ease'
                                  }} 
                                />
                              } 
                              label={
                                <Typography variant="body1" sx={{ 
                                  fontSize: '1.1rem',
                                  fontWeight: isSelected ? 600 : 400,
                                  transition: 'font-weight 0.3s ease'
                                }}>
                                  {optionText}
                                </Typography>
                              }
                              sx={{ 
                                mb: 2,
                                p: 2,
                                borderRadius: 3,
                                backgroundColor: isSelected ? 'primary.light' : 'transparent',
                                border: '2px solid',
                                borderColor: isSelected ? 'primary.main' : 'grey.300',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isSelected ? 'translateX(8px)' : 'translateX(0)',
                                boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
                                '&:hover': {
                                  backgroundColor: isSelected ? 'primary.light' : 'grey.50',
                                  borderColor: 'primary.main',
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }
                              }}
                            />
                          </Grow>
                        );
                      })}
                    </RadioGroup>
                  )}

                  {/* Enhanced True/False Options */}
                  {currentQuestion.question_type === 'true_false' && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ''}
                      onChange={e => handleChange(currentQuestion.id, e.target.value)}
                    >
                      {currentQuestion.options ? (
                        currentQuestion.options.map((opt, i) => {
                          const optionText = typeof opt === 'object' ? opt.text : opt;
                          const isSelected = answers[currentQuestion.id] === optionText.toLowerCase();
                          
                          return (
                            <Grow key={i} in timeout={700 + i * 100}>
                              <FormControlLabel 
                                value={optionText.toLowerCase()} 
                                control={
                                  <Radio 
                                    sx={{ 
                                      '&.Mui-checked': { 
                                        color: 'primary.main',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'transform 0.2s ease'
                                    }} 
                                  />
                                } 
                                label={
                                  <Typography variant="body1" sx={{ 
                                    fontSize: '1.1rem',
                                    fontWeight: isSelected ? 600 : 400,
                                    transition: 'font-weight 0.3s ease'
                                  }}>
                                    {optionText}
                                  </Typography>
                                }
                                sx={{ 
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 3,
                                  backgroundColor: isSelected ? 'primary.light' : 'transparent',
                                  border: '2px solid',
                                  borderColor: isSelected ? 'primary.main' : 'grey.300',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  transform: isSelected ? 'translateX(8px)' : 'translateX(0)',
                                  boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
                                  '&:hover': {
                                    backgroundColor: isSelected ? 'primary.light' : 'grey.50',
                                    borderColor: 'primary.main',
                                    transform: 'translateX(4px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                  }
                                }}
                              />
                            </Grow>
                          );
                        })
                      ) : (
                        <>
                          {['True', 'False'].map((option, i) => {
                            const isSelected = answers[currentQuestion.id] === option.toLowerCase();
                            return (
                              <Grow key={option} in timeout={700 + i * 100}>
                                <FormControlLabel 
                                  value={option.toLowerCase()} 
                                  control={
                                    <Radio 
                                      sx={{ 
                                        '&.Mui-checked': { 
                                          color: 'primary.main',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'transform 0.2s ease'
                                      }} 
                                    />
                                  } 
                                  label={
                                    <Typography variant="body1" sx={{ 
                                      fontSize: '1.1rem',
                                      fontWeight: isSelected ? 600 : 400,
                                      transition: 'font-weight 0.3s ease'
                                    }}>
                                      {option}
                                    </Typography>
                                  }
                                  sx={{ 
                                    mb: 2,
                                    p: 2,
                                    borderRadius: 3,
                                    backgroundColor: isSelected ? 'primary.light' : 'transparent',
                                    border: '2px solid',
                                    borderColor: isSelected ? 'primary.main' : 'grey.300',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: isSelected ? 'translateX(8px)' : 'translateX(0)',
                                    boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
                                    '&:hover': {
                                      backgroundColor: isSelected ? 'primary.light' : 'grey.50',
                                      borderColor: 'primary.main',
                                      transform: 'translateX(4px)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }
                                  }}
                                />
                              </Grow>
                            );
                          })}
                        </>
                      )}
                    </RadioGroup>
                  )}

                  {/* Enhanced Likert Scale Options */}
                  {currentQuestion.question_type === 'likert' && currentQuestion.options && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ''}
                      onChange={e => handleChange(currentQuestion.id, e.target.value)}
                    >
                      {currentQuestion.options.map((opt, i) => {
                        const optionText = typeof opt === 'object' ? opt.text : opt;
                        const isSelected = answers[currentQuestion.id] === optionText;
                        
                        return (
                          <Grow key={i} in timeout={700 + i * 100}>
                            <FormControlLabel 
                              value={optionText} 
                              control={
                                <Radio 
                                  sx={{ 
                                    '&.Mui-checked': { 
                                      color: 'primary.main',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'transform 0.2s ease'
                                  }} 
                                />
                              } 
                              label={
                                <Typography variant="body1" sx={{ 
                                  fontSize: '1.1rem',
                                  fontWeight: isSelected ? 600 : 400,
                                  transition: 'font-weight 0.3s ease'
                                }}>
                                  {optionText}
                                </Typography>
                              }
                              sx={{ 
                                mb: 2,
                                p: 2,
                                borderRadius: 3,
                                backgroundColor: isSelected ? 'primary.light' : 'transparent',
                                border: '2px solid',
                                borderColor: isSelected ? 'primary.main' : 'grey.300',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isSelected ? 'translateX(8px)' : 'translateX(0)',
                                boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
                                '&:hover': {
                                  backgroundColor: isSelected ? 'primary.light' : 'grey.50',
                                  borderColor: 'primary.main',
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }
                              }}
                            />
                          </Grow>
                        );
                      })}
                    </RadioGroup>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Zoom>

         {/* Submit Button - Only show on last question */}
         {isLastQuestion && (
           <Slide direction="up" in timeout={1000}>
             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
               <Zoom in timeout={500}>
                 <Button
                   variant="contained"
                   onClick={handleSubmit}
                   disabled={Object.keys(answers).length < questions.length}
                   sx={{
                     background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                     color: 'white',
                     fontWeight: 'bold',
                     px: 6,
                     py: 2,
                     borderRadius: 3,
                     fontSize: '1.2rem',
                     boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)',
                     '&:hover': {
                       background: 'linear-gradient(135deg, #45a049, #4CAF50)',
                       transform: 'translateY(-2px)',
                       boxShadow: '0 12px 20px rgba(76, 175, 80, 0.4)'
                     },
                     '&:disabled': {
                       background: 'rgba(255,255,255,0.2)',
                       color: 'rgba(255,255,255,0.5)'
                     },
                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                   }}
                 >
                   <CheckCircle sx={{ mr: 1 }} />
                   Submit Quiz
                 </Button>
               </Zoom>
             </Box>
           </Slide>
         )}
      </Box>
    </Box>
  );
};

export default QuizAttempt;