import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  Fade,
  Slide,
  Zoom,
  Grow,
  Paper,
  IconButton,
  LinearProgress,
  Snackbar,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowBack from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';

// Helper function to get readable packet names
const getPacketName = (packetId) => {
  const nameMap = {
    'ei_self_awareness': 'Self Image',
    'ei_managing_emotions': 'Emotional Regulation',
    'ei_motivating_oneself': 'Self Drive',
    'ei_empathy_new': 'Understanding Others',
    'ei_social_skills': 'Interpersonal Effectiveness'
  };
  return nameMap[packetId] || packetId;
};

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [quizAssignment, setQuizAssignment] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [questionAnimationKey, setQuestionAnimationKey] = useState(0);
  const [showQuizDescription, setShowQuizDescription] = useState(true);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Get current user from localStorage
    const getCurrentUser = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          return parsedUser;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
      return null;
    };

    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError('');

        const currentUser = getCurrentUser();
        if (!currentUser) {
          setAccessDenied(true);
          setError('Please log in to access this quiz.');
          return;
        }

        // Load quiz data
        const [quizRes, questionsRes, profilesRes, assignmentsRes] = await Promise.all([
          fetch(`http://65.1.6.81:3001/api/quizzes/${quizId}`),
          fetch(`http://65.1.6.81:3001/api/questions?quiz_id=${quizId}`),
          fetch('http://65.1.6.81:3001/api/profiles'),
          fetch('http://65.1.6.81:3001/api/quiz-assignments')
        ]);

        if (!quizRes.ok || !questionsRes.ok) {
          throw new Error('Failed to load quiz data');
        }

        const quizData = await quizRes.json();
        const questionsData = await questionsRes.json();
        const profilesData = profilesRes.ok ? await profilesRes.json() : [];
        const assignmentsData = assignmentsRes.ok ? await assignmentsRes.json() : [];

        // Find user's profile and assignment - try multiple matching strategies
        const userProfile = profilesData.find(p => 
          p.user_id === currentUser.id || 
          p.user_id === String(currentUser.id) ||
          p.user_id === Number(currentUser.id) ||
          p.email === currentUser.email
        );
        
        const assignment = assignmentsData.find(a => 
          a.quiz_id === quizId && (
            a.profile_id === userProfile?.id ||
            a.user_id === currentUser.id ||
            a.user_id === String(currentUser.id) ||
            a.user_id === Number(currentUser.id)
          )
        );

        // Debug logging
        console.log('Current user:', currentUser);
        console.log('User profiles:', profilesData);
        console.log('Profile details:', profilesData.map(p => ({ id: p.id, user_id: p.user_id, name: p.name, email: p.email })));
        console.log('Quiz assignments:', assignmentsData);
        console.log('Assignment details:', assignmentsData.map(a => ({ id: a.id, quiz_id: a.quiz_id, profile_id: a.profile_id, user_id: a.user_id })));
        console.log('Looking for user_id:', currentUser.id, 'type:', typeof currentUser.id);
        console.log('Found user profile:', userProfile);
        console.log('Found assignment:', assignment);

        // More flexible access control - allow access if user exists and quiz exists
        // Only require profile/assignment for specific access control if needed
        if (!currentUser) {
          setAccessDenied(true);
          setError('Please log in to access this quiz.');
          return;
        }

        // If no profile exists, create a default one or allow access anyway
        if (!userProfile) {
          console.log('No user profile found, allowing access with default profile');
          // Create a default profile for the user
          const defaultProfile = {
            id: `profile_${currentUser.id}`,
            user_id: currentUser.id,
            name: currentUser.user_name || currentUser.email || 'User',
            email: currentUser.email
          };
          setUserProfile(defaultProfile);
        } else {
          setUserProfile(userProfile);
        }

        // If no assignment exists, create a default one or allow access anyway
        if (!assignment) {
          console.log('No quiz assignment found, allowing access with default assignment');
          // Create a default assignment
          const defaultAssignment = {
            id: `assignment_${currentUser.id}_${quizId}`,
            quiz_id: quizId,
            profile_id: userProfile?.id || `profile_${currentUser.id}`,
            user_id: currentUser.id,
            assigned_at: new Date().toISOString()
          };
          setQuizAssignment(defaultAssignment);
        } else {
          setQuizAssignment(assignment);
        }

        console.log('Quiz data:', quizData);
        console.log('Questions data:', questionsData);
        
        // Validate quiz and questions data
        if (!quizData || !quizData.id) {
          throw new Error('Invalid quiz data received');
        }
        
        if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
          throw new Error('No questions found for this quiz');
        }
        
        setQuiz(quizData);
        setQuestions(questionsData);
        
        console.log('Quiz and questions set successfully');
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, accessDenied]);

  const handleChange = (qid, value) => {
    setSelectedOption(value);
    setAnswers({ ...answers, [qid]: value });
    
    // Only auto-advance if not on the last question
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setIsTransitioning(true);
        
        setTimeout(() => {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setQuestionAnimationKey(prev => prev + 1);
          setIsTransitioning(false);
          setSelectedOption('');
          
          // Show motivational notification after every 10 questions
          showMotivationalNotification(nextIndex);
        }, 400);
      }, 500);
    } else {
      // On last question, just clear the selected option without transition
      setSelectedOption('');
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Starting quiz submission...');
      console.log('Quiz Data:', quiz);
      console.log('Questions Data:', questions);
      console.log('User Answers:', answers);
      
      // Calculate marks based on selected options' pre-assigned marks
      let totalMarks = 0;
      const packetMarks = {};
      
      // Process questions by packets
      questions.forEach((question, index) => {
        console.log(`\nProcessing Question ${index + 1}:`, question);
        
        const answer = answers[question.id];
        console.log('Answer for this question:', answer);
        
        // Get packet information
        const packetId = question.packet_id;
        const packetName = question.packet_name;
        console.log('Packet ID:', packetId, 'Packet Name:', packetName);
        
        if (answer && packetId) {
          // Initialize packet if not exists
          if (!packetMarks[packetId]) {
            packetMarks[packetId] = {
              marks: 0,
              questions: 0,
              name: packetName // Store packet name for reference
            };
          }
          
          // Find the selected option and get its pre-assigned marks
          console.log('Question Options:', question.options);
          let marksAwarded = 0;
          
          if (question.options && Array.isArray(question.options)) {
            // Handle new format with individual option marks
            if (typeof question.options[0] === 'object' && question.options[0].hasOwnProperty('marks')) {
              // New format: options have individual marks
              // Handle case sensitivity for True/False questions
              let selectedOption = null;
              // First try exact match
              selectedOption = question.options.find(opt => opt.text === answer);
              // If not found, try case-insensitive match
              if (!selectedOption) {
                selectedOption = question.options.find(opt => 
                  opt.text && answer && opt.text.toLowerCase() === answer.toLowerCase()
                );
              }
              
              if (selectedOption) {
                marksAwarded = selectedOption.marks || 0;
              }
            } else {
              // Old format: question has single marks value
              // Award full marks if answer exists
              marksAwarded = question.marks || 1;
            }
          } else {
            // Fallback for questions without options
            // Award full marks if answer exists
            marksAwarded = question.marks || 1;
          }
          
          console.log('Marks awarded for this answer:', marksAwarded);
          packetMarks[packetId].marks += marksAwarded;
          totalMarks += marksAwarded;
          packetMarks[packetId].questions += 1;
        }
      });
      
      console.log('\nFinal Results:');
      console.log('Total Marks:', totalMarks);
      console.log('Packet Marks:', packetMarks);

      const totalQuestions = questions.length;
      
      // Calculate maximum possible marks dynamically based on question format
      let maxPossibleMarks = 0;
      questions.forEach(question => {
        if (question.options && Array.isArray(question.options)) {
          // Handle new format with individual option marks
          if (typeof question.options[0] === 'object' && question.options[0].hasOwnProperty('marks')) {
            // New format: use maximum option mark
            const optionMarks = question.options.map(opt => opt.marks || 0);
            maxPossibleMarks += Math.max(...optionMarks, 0);
          } else {
            // Old format: use question marks
            maxPossibleMarks += question.marks || 1;
          }
        } else {
          // Fallback: use question marks
          maxPossibleMarks += question.marks || 1;
        }
      });
      
      const score = maxPossibleMarks > 0 ? Math.round((totalMarks / maxPossibleMarks) * 100) : 0;

      // Create attempt data
      const currentTime = new Date().toISOString();
      console.log('Preparing attempt data...');
      
      // Map packet IDs to their names and format the data structure
      const formattedPacketMarks = {};
      
      // Get unique packet names and their questions
      const packetGroups = questions.reduce((acc, q) => {
        const packetId = q.packet_id;
        if (!acc[packetId]) {
          acc[packetId] = {
            name: q.packet_name || getPacketName(packetId),
            questions: [],
            marks: 0
          };
        }
        acc[packetId].questions.push(q);
        return acc;
      }, {});

      // Calculate marks for each packet
      Object.entries(packetMarks).forEach(([packetId, data]) => {
        const packet = packetGroups[packetId];
        if (packet) {
          // Calculate maximum marks for this packet
          let packetMaxMarks = 0;
          if (packet.questions) {
            packet.questions.forEach(q => {
              if (q.options && Array.isArray(q.options)) {
                // Handle new format with individual option marks
                if (typeof q.options[0] === 'object' && q.options[0].hasOwnProperty('marks')) {
                  // New format: use maximum option mark
                  const optionMarks = q.options.map(opt => opt.marks || 0);
                  packetMaxMarks += Math.max(...optionMarks, 0);
                } else {
                  // Old format: use question marks
                  packetMaxMarks += q.marks || 1;
                }
              } else {
                // Fallback: use question marks
                packetMaxMarks += q.marks || 1;
              }
            });
          }
          
          // Use packet name as the key to match the expected format
          formattedPacketMarks[packet.name] = {
            marks: data.marks,
            questions: data.questions,
            total: packetMaxMarks
          };
        }
      });

      console.log('Formatted Packet Marks:', formattedPacketMarks);
      
      const attemptData = {
        id: Date.now().toString(),
        quiz_id: quizId,
        profile_id: quizAssignment?.profile_id || `profile_${user?.id}`,
        user_id: user?.id,
        score: score,
        total_questions: totalQuestions,
        correct_answers: totalMarks,
        total_marks: totalMarks,
        packet_marks: formattedPacketMarks,
        answers: answers,
        status: 'completed',
        started_at: currentTime,
        completed_at: currentTime,
        created_at: currentTime,
        updated_at: currentTime
      };

      // Log the final structure
      console.log('Attempt Data Structure:', {
        totalMarks,
        totalQuestions,
        score,
        packetMarks: formattedPacketMarks
      });
      
      console.log('Final Attempt Data:', attemptData);

      // Save quiz attempt to mock data
      const attemptResponse = await fetch('http://65.1.6.81:3001/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attemptData)
      });

      if (!attemptResponse.ok) {
        throw new Error('Failed to save quiz attempt');
      }

      const response = await attemptResponse.json();
      
      // Show success message and redirect to report
      alert('Quiz submitted successfully! Redirecting to your report...');
      
      // Redirect to report after a short delay
      setTimeout(() => {
        navigate(`/report/${quizId}/${response.id}`);
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
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: 'white' }} />
        <Typography variant="h5" color="white" sx={{ fontWeight: 500 }}>
          Loading your quiz...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3
      }}>
        <Fade in timeout={800}>
          <Alert 
            severity="error"
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              '& .MuiAlert-message': { fontSize: '1.1rem' }
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>Error Loading Quiz</Typography>
            <Typography>{error}</Typography>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBack />} 
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Back to Dashboard
            </Button>
          </Alert>
        </Fade>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ 
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3
      }}>
        <Fade in timeout={800}>
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
        </Fade>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!questions || questions.length === 0) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  const progress = calculateProgress();
  
  // Motivational messages
  const getMotivationalMessage = (questionNumber) => {
    const messages = [
      "You're doing great! Keep going!",
      "Excellent progress! You're on the right track!",
      "Fantastic work so far! Almost there!",
      "You're crushing it! Keep up the good work!",
      "Amazing effort! You're nearly finished!",
      "Well done! Your dedication is paying off!",
      "Impressive progress! You're doing brilliantly!",
      "You're on fire! Keep pushing forward!",
      "Outstanding! You're making great strides!",
      "Superb! You're almost at the finish line!",
      "Brilliant! Your persistence is admirable!",
      "Wonderful! You're making excellent progress!",
      "Terrific! You're doing better than expected!",
      "Incredible! Your focus is really showing!",
      "Remarkable! You're making steady progress!"
    ];
    
    // Return a random message
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  // Show notification after every 10 questions
  const showMotivationalNotification = (currentQuestionIndex) => {
    // Only show notification after every 10 questions (10, 20, 30, etc.)
    // And only if we're not on the last question
    if ((currentQuestionIndex + 1) % 10 === 0 && 
        currentQuestionIndex < questions.length - 1 &&
        !showQuizDescription) {
      const message = getMotivationalMessage(currentQuestionIndex + 1);
      setNotificationMessage(message);
      setShowNotification(true);
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };
  
  return (
    <Box sx={{ 
      height: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      padding: 0,
      '& *': {
        boxSizing: 'border-box'
      }
    }}>
      {/* Global CSS override for this component */}
      <style>
        {`
          #root {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100vh !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
        `}
      </style>
      
      {/* Motivational Notification */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: 80,
          zIndex: 9999
        }}
      >
        <Alert 
          onClose={() => setShowNotification(false)} 
          severity="success"
          sx={{ 
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 2
          }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
      
      {/* Minimalist Header - Back Button, Quiz Name, and User Details */}
      <Box sx={{ 
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: { xs: 'row', sm: 'row' },
        gap: { xs: 0.5, sm: 0 },
        p: { xs: 0.8, md: 1 },
        backgroundColor: 'rgba(102, 126, 234, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <IconButton 
          onClick={() => navigate('/')}
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            minWidth: { xs: 32, md: 36 },
            minHeight: { xs: 32, md: 36 },
            width: { xs: 32, md: 36 },
            height: { xs: 32, md: 36 },
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease',
            flexShrink: 0
          }}
        >
          <ArrowBack sx={{ fontSize: { xs: 18, md: 20 } }} />
        </IconButton>

        {/* Quiz Name and User Details */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, md: 2 },
          backgroundColor: { xs: 'rgba(255, 255, 255, 0.1)', md: 'rgba(255, 255, 255, 0.15)' },
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          px: { xs: 1, md: 1.5 },
          py: { xs: 0.5, md: 0.8 },
          flexDirection: { xs: 'row', sm: 'row' },
          flex: 1,
          ml: { xs: 0.5, md: 0 },
          minWidth: 0
        }}>
          <Box sx={{ textAlign: 'center', minWidth: 0, flex: { xs: 1, sm: 'auto' } }}>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 700,
              fontSize: { xs: '0.75rem', md: '0.95rem' },
              whiteSpace: { xs: 'nowrap', sm: 'normal' },
              overflow: { xs: 'hidden', sm: 'visible' },
              textOverflow: { xs: 'ellipsis', sm: 'clip' }
            }}>
              {quiz?.name || 'Quiz'}
            </Typography>
          </Box>
          
          <Box sx={{ 
            width: { xs: '100%', sm: 1 }, 
            height: { xs: 1, sm: 30 }, 
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 1,
            display: { xs: 'block', sm: 'block' }
          }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ color: 'white', fontSize: { xs: 16, md: 18 } }} />
            <Typography variant="body1" sx={{ 
              color: 'white', 
              fontWeight: 600,
              fontSize: { xs: '0.75rem', md: '0.85rem' }
            }}>
              {userProfile?.name || user?.user_name || user?.email || 'User'}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Progress Bar - Show when quiz description is hidden (i.e., during questions) */}
      {!showQuizDescription && (
        <Box sx={{ 
          width: '100%',
          position: 'relative',
          height: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: '100%',
              borderRadius: 0,
              backgroundColor: 'transparent',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4CAF50'
              }
            }} 
          />
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 700,
              color: 'white',
              fontSize: '0.8rem',
              textShadow: '0 0 2px rgba(0,0,0,0.5)'
            }}>
              {progress}%
            </Typography>
          </Box>
        </Box>
      )}

      {/* Main Content - Full Screen */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, md: 1.5 },
        pb: { xs: isLastQuestion && !showQuizDescription ? 8 : 1, md: 1.5 },
        overflow: 'hidden',
        position: 'relative'
      }}>
        {showQuizDescription ? (
          <Zoom in timeout={500}>
            <Box sx={{ 
              width: '100%',
              maxWidth: { xs: '100%', md: '1000px' },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(255,255,255,0.3)',
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <CardContent sx={{ 
                  p: { xs: 1.5, md: 2 }, 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  textAlign: 'center',
                  overflow: 'auto'
                }}>
                  <Box sx={{ mb: 1, width: { xs: '80px', md: '100px' }, height: 'auto', mx: 'auto' }}>
                    <img 
                      src="https://happimynd.com/assets/Frontend/images/happimynd_logo.png"
                      alt="HappiMynd Logo"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700,
                    mb: 0.8,
                    color: 'primary.main',
                    fontSize: { xs: '0.85rem', md: '1rem' }
                  }}>
                    Why should I take this assessment?
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.4,
                    mb: 1,
                    maxWidth: '850px',
                    width: '100%',
                    textAlign: 'justify',
                    px: { xs: 0.5, md: 1 }
                  }}>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' }, lineHeight: 1.3 }}>
                      Life is made up of many small and big moments, some exciting, some stressful, and some that test our patience.
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' }, lineHeight: 1.3 }}>
                      From experiencing joy to feeling overwhelmed by responsibilities or uncertainty to having tough conversations, making big decisions, challenges come our way every day. How we deal with them depends not just on what we know, but on how well we understand and manage our emotions while connecting with others.
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' }, lineHeight: 1.3 }}>
                      That's what Emotional Intelligence (EQ) means, it's simply being smart about feelings: knowing your own emotions and understanding others.
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' }, lineHeight: 1.3 }}>
                      This assessment will help you discover your strengths, identify areas to improve to help yourself handle overall life and manage relationships with more ease. Just a few minutes can create lasting change in both your personal happiness and professional success.
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' }, lineHeight: 1.4, textDecoration: 'underline' }}>
                      The better you understand your emotions, the better you live, connect and grow!!
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' }, lineHeight: 1.4, }}>
                      Don't forget to turn your assessment insights into action by booking a report reading session on receiving the report. You have access to our experts to gain deeper clarity and create your roadmap forward.
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    mb: 0.6,
                    color: 'primary.main',
                    fontSize: { xs: '0.8rem', md: '0.9rem' }
                  }}>
                    Instructions:
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.3,
                    mb: 1.5,
                    maxWidth: '850px',
                    width: '100%',
                    px: { xs: 0.5, md: 1 }
                  }}>
                    <Typography variant="body2" sx={{ textAlign: 'left', fontSize: { xs: '0.6rem', md: '0.65rem' } }}>
                      • Read each statement carefully
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'left', fontSize: { xs: '0.6rem', md: '0.65rem' } }}>
                      • There is no right and wrong answer, so no judgement
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'left', fontSize: { xs: '0.6rem', md: '0.65rem' } }}>
                      • 1 in the likert scale represent Strongly Disagree and 5 represents Strongly Agree
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'left', fontSize: { xs: '0.6rem', md: '0.65rem' } }}>
                      • Please avoid marking the neutral response and share real time experiences
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'left', fontSize: { xs: '0.6rem', md: '0.65rem' } }}>
                      • Please answer all the questions with your natural instinct
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'left', fontSize: { xs: '0.6rem', md: '0.65rem' } }}>
                      • Your responses will be kept 100% confidential
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setShowQuizDescription(false)}
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      fontSize: { xs: '0.85rem', md: '0.95rem' },
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                      boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #45a049 30%, #4CAF50 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 20px rgba(76, 175, 80, 0.4)'
                      }
                    }}
                  >
                    Start
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Zoom>
        ) : (
          <Zoom in={!isTransitioning} timeout={500} key={questionAnimationKey}>
          <Box sx={{ 
            width: '100%',
            maxWidth: { xs: '100%', md: '800px' },
            height: { xs: 'auto', md: '100%' },
            maxHeight: { xs: '90%', md: '100%' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* Question Card - Single Page View */}
            <Card sx={{ 
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(20px)',
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(255,255,255,0.3)',
              height: { xs: 'auto', md: '100%' },
              maxHeight: { xs: '85vh', md: '100%' },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ 
                p: { xs: 1.5, md: 2 },
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                overflow: 'auto'
              }}>
                {currentQuestion && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    {/* Question Text */}
                    <Grow in timeout={600}>
                      <Box sx={{ 
                        mb: { xs: 2, md: 2 },
                        textAlign: 'center'
                      }}>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 600,
                            lineHeight: 1.3,
                            color: 'text.primary',
                            fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' },
                            mb: 0.5
                          }}
                        >
                          {currentQuestion.question_text}
                        </Typography>
                      </Box>
                    </Grow>

                    {/* Options Container */}
                    <Box sx={{ 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      {/* MCQ Options */}
                      {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                        <RadioGroup
                          value={answers[currentQuestion.id] || ''}
                          onChange={e => handleChange(currentQuestion.id, e.target.value)}
                          sx={{ gap: { xs: 1, md: 1.2 } }}
                        >
                          {currentQuestion.options.map((opt, i) => {
                            const optionText = typeof opt === 'object' ? opt.text : opt;
                            const isSelected = answers[currentQuestion.id] === optionText;
                            
                            return (
                              <Grow key={i} in timeout={700 + i * 100}>
                                <Paper
                                  elevation={isSelected ? 6 : 1}
                                  sx={{
                                    p: { xs: 2, md: 2 },
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid',
                                    borderColor: isSelected ? 'primary.main' : 'transparent',
                                    backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'white',
                                    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                      borderColor: 'primary.main'
                                    },
                                    '&:active': {
                                      transform: 'scale(0.98)'
                                    },
                                    minHeight: { xs: 56, md: 64 },
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  onClick={() => handleChange(currentQuestion.id, optionText)}
                                >
                                  <FormControlLabel 
                                    value={optionText} 
                                    control={
                                      <Radio 
                                        sx={{ 
                                          '&.Mui-checked': { 
                                            color: 'primary.main',
                                            transform: 'scale(1.15)'
                                          },
                                          transform: 'scale(1.2)',
                                          p: { xs: 1.5, md: 1 }
                                        }} 
                                      />
                                    } 
                                    label={
                                      <Typography variant="h6" sx={{ 
                                        fontSize: { xs: '1.05rem', md: '1.25rem' },
                                        fontWeight: isSelected ? 700 : 500,
                                        color: isSelected ? 'primary.main' : 'text.primary',
                                        ml: { xs: 0.5, md: 2 },
                                        lineHeight: 1.4
                                      }}>
                                        {optionText}
                                      </Typography>
                                    }
                                    sx={{ width: '100%', m: 0, ml: 0 }}
                                  />
                                </Paper>
                              </Grow>
                            );
                          })}
                        </RadioGroup>
                      )}

                      {/* True/False Options */}
                      {currentQuestion.question_type === 'true_false' && (
                        <RadioGroup
                          value={answers[currentQuestion.id] || ''}
                          onChange={e => handleChange(currentQuestion.id, e.target.value)}
                          sx={{ gap: { xs: 1, md: 1.2 } }}
                        >
                          {currentQuestion.options ? (
                            currentQuestion.options.map((opt, i) => {
                              const optionText = typeof opt === 'object' ? opt.text : opt;
                              const isSelected = answers[currentQuestion.id] === optionText.toLowerCase();
                              
                              return (
                                <Grow key={i} in timeout={700 + i * 100}>
                                  <Paper
                                    elevation={isSelected ? 6 : 1}
                                    sx={{
                                      p: { xs: 1, md: 1.2 },
                                      borderRadius: 2,
                                      cursor: 'pointer',
                                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                      border: '2px solid',
                                      borderColor: isSelected ? 'primary.main' : 'transparent',
                                      backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'white',
                                      transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                                      '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                        borderColor: 'primary.main'
                                      },
                                      '&:active': {
                                        transform: 'scale(0.98)'
                                      },
                                      minHeight: { xs: 40, md: 48 },
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                    onClick={() => handleChange(currentQuestion.id, optionText.toLowerCase())}
                                  >
                                    <FormControlLabel 
                                      value={optionText.toLowerCase()} 
                                      control={
                                        <Radio 
                                          sx={{ 
                                            '&.Mui-checked': { 
                                              color: 'primary.main',
                                              transform: 'scale(1.1)'
                                            },
                                            transform: 'scale(1)',
                                            p: { xs: 0.5, md: 0.8 }
                                          }} 
                                        />
                                      } 
                                      label={
                                        <Typography variant="h6" sx={{ 
                                          fontSize: { xs: '0.85rem', md: '1rem' },
                                          fontWeight: isSelected ? 700 : 500,
                                          color: isSelected ? 'primary.main' : 'text.primary',
                                          ml: { xs: 0.3, md: 0.5 },
                                          lineHeight: 1.3
                                        }}>
                                          {optionText}
                                        </Typography>
                                      }
                                      sx={{ width: '100%', m: 0, ml: 0 }}
                                    />
                                  </Paper>
                                </Grow>
                              );
                            })
                          ) : (
                            <>
                              <Grow in timeout={700}>
                                <Paper
                                  elevation={answers[currentQuestion.id] === 'true' ? 6 : 1}
                                  sx={{
                                    p: { xs: 1, md: 1.2 },
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid',
                                    borderColor: answers[currentQuestion.id] === 'true' ? 'primary.main' : 'transparent',
                                    backgroundColor: answers[currentQuestion.id] === 'true' ? alpha(theme.palette.primary.main, 0.08) : 'white',
                                    transform: answers[currentQuestion.id] === 'true' ? 'scale(1.01)' : 'scale(1)',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                      borderColor: 'primary.main'
                                    },
                                    '&:active': {
                                      transform: 'scale(0.98)'
                                    },
                                    minHeight: { xs: 40, md: 48 },
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  onClick={() => handleChange(currentQuestion.id, 'true')}
                                >
                                  <FormControlLabel 
                                    value="true" 
                                    control={
                                      <Radio 
                                        sx={{ 
                                          '&.Mui-checked': { 
                                            color: 'primary.main',
                                            transform: 'scale(1.1)'
                                          },
                                          transform: 'scale(1)',
                                          p: { xs: 0.5, md: 0.8 }
                                        }} 
                                      />
                                    } 
                                    label={
                                      <Typography variant="h6" sx={{ 
                                        fontSize: { xs: '0.85rem', md: '1rem' },
                                        fontWeight: answers[currentQuestion.id] === 'true' ? 700 : 500,
                                        color: answers[currentQuestion.id] === 'true' ? 'primary.main' : 'text.primary',
                                        ml: { xs: 0.3, md: 0.5 },
                                        lineHeight: 1.3
                                      }}>
                                        True
                                      </Typography>
                                    }
                                    sx={{ width: '100%', m: 0, ml: 0 }}
                                  />
                                </Paper>
                              </Grow>
                              <Grow in timeout={800}>
                                <Paper
                                  elevation={answers[currentQuestion.id] === 'false' ? 6 : 1}
                                  sx={{
                                    p: { xs: 1, md: 1.2 },
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid',
                                    borderColor: answers[currentQuestion.id] === 'false' ? 'primary.main' : 'transparent',
                                    backgroundColor: answers[currentQuestion.id] === 'false' ? alpha(theme.palette.primary.main, 0.08) : 'white',
                                    transform: answers[currentQuestion.id] === 'false' ? 'scale(1.01)' : 'scale(1)',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                      borderColor: 'primary.main'
                                    },
                                    '&:active': {
                                      transform: 'scale(0.98)'
                                    },
                                    minHeight: { xs: 40, md: 48 },
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  onClick={() => handleChange(currentQuestion.id, 'false')}
                                >
                                  <FormControlLabel 
                                    value="false" 
                                    control={
                                      <Radio 
                                        sx={{ 
                                          '&.Mui-checked': { 
                                            color: 'primary.main',
                                            transform: 'scale(1.1)'
                                          },
                                          transform: 'scale(1)',
                                          p: { xs: 0.5, md: 0.8 }
                                        }} 
                                      />
                                    } 
                                    label={
                                      <Typography variant="h6" sx={{ 
                                        fontSize: { xs: '0.85rem', md: '1rem' },
                                        fontWeight: answers[currentQuestion.id] === 'false' ? 700 : 500,
                                        color: answers[currentQuestion.id] === 'false' ? 'primary.main' : 'text.primary',
                                        ml: { xs: 0.3, md: 0.5 },
                                        lineHeight: 1.3
                                      }}>
                                        False
                                      </Typography>
                                    }
                                    sx={{ width: '100%', m: 0, ml: 0 }}
                                  />
                                </Paper>
                              </Grow>
                            </>
                          )}
                        </RadioGroup>
                      )}

                      {/* Likert Scale Options */}
                      {currentQuestion.question_type === 'likert' && currentQuestion.options && (
                        <RadioGroup
                          value={answers[currentQuestion.id] || ''}
                          onChange={e => handleChange(currentQuestion.id, e.target.value)}
                          sx={{ gap: { xs: 1, md: 1.2 } }}
                        >
                          {currentQuestion.options.map((opt, i) => {
                            const optionText = typeof opt === 'object' ? opt.text : opt;
                            const isSelected = answers[currentQuestion.id] === optionText;
                            
                            return (
                              <Grow key={i} in timeout={700 + i * 100}>
                                <Paper
                                  elevation={isSelected ? 6 : 1}
                                  sx={{
                                    p: { xs: 1, md: 1.2 },
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid',
                                    borderColor: isSelected ? 'primary.main' : 'transparent',
                                    backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'white',
                                    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                      borderColor: 'primary.main'
                                    },
                                    '&:active': {
                                      transform: 'scale(0.98)'
                                    },
                                    minHeight: { xs: 40, md: 48 },
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  onClick={() => handleChange(currentQuestion.id, optionText)}
                                >
                                  <FormControlLabel 
                                    value={optionText} 
                                    control={
                                      <Radio 
                                        sx={{ 
                                          '&.Mui-checked': { 
                                            color: 'primary.main',
                                            transform: 'scale(1.1)'
                                          },
                                          transform: 'scale(1)',
                                          p: { xs: 0.5, md: 0.8 }
                                        }} 
                                      />
                                    } 
                                    label={
                                      <Typography variant="h6" sx={{ 
                                        fontSize: { xs: '0.85rem', md: '1rem' },
                                        fontWeight: isSelected ? 700 : 500,
                                        color: isSelected ? 'primary.main' : 'text.primary',
                                        ml: { xs: 0.3, md: 0.5 },
                                        lineHeight: 1.3
                                      }}>
                                        {optionText}
                                      </Typography>
                                    }
                                    sx={{ width: '100%', m: 0, ml: 0 }}
                                  />
                                </Paper>
                              </Grow>
                            );
                          })}
                        </RadioGroup>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
          </Zoom>
        )}

        {/* Submit Button - Only show on last question */}
        {!showQuizDescription && isLastQuestion && (
          <Box sx={{ 
            position: 'absolute',
            bottom: { xs: 78, md: 20 },
            right: { xs: 16, md: 20 },
            left: { xs: 16, md: 'auto' },
            zIndex: 10
          }}>
            <Slide direction="up" in timeout={1000}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length}
                endIcon={<CheckCircle />}
                fullWidth={{ xs: true, md: false }}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: { xs: 1.2, md: 1.2 },
                  fontWeight: 700,
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  minHeight: { xs: 42, md: 'auto' },
                  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                  boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049, #4CAF50)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 20px rgba(76, 175, 80, 0.4)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                Submit Quiz
              </Button>
            </Slide>
          </Box>
        )}
        
        {/* Powered by HappiMynd Footer - Show when quiz description is hidden (i.e., during questions) */}
        {!showQuizDescription && (
          <Box sx={{ 
            position: 'absolute',
            bottom: { xs: 80, md: 20 },
            right: { xs: 16, md: 20 },
            left: 'auto',
            zIndex: 5
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              px: 1,
              py: 0.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ width: { xs: 16, md: 20 }, height: { xs: 16, md: 20 } }}>
                <img 
                  src="https://happimynd.com/assets/Frontend/images/happimynd_logo.png"
                  alt="HappiMynd Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ 
                fontWeight: 600,
                color: '#667eea',
                fontSize: { xs: '0.6rem', md: '0.65rem' }
              }}>
                Powered by HappiMynd
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default QuizAttempt;