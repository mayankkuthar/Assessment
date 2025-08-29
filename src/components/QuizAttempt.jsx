import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Radio, RadioGroup, FormControlLabel, Button, Box, CircularProgress, Alert } from '@mui/material';
import { supabase } from '../sqlite';

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


  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Get user's profile from their signup data
          const userResponse = await fetch(`http://localhost:3001/api/users/${currentUser.id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserProfile(userData.profile || 'user');
          }
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
    setAnswers({ ...answers, [qid]: value });
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (accessDenied) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">
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
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" sx={{ mb: 1 }}>Error Loading Quiz</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="warning">
          <Typography variant="h6">Quiz Not Found</Typography>
          <Typography>The requested quiz could not be found.</Typography>
        </Alert>
      </Box>
    );
  }



  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" gutterBottom>{quiz.name}</Typography>
          {quiz.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {quiz.description}
            </Typography>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Profile Access:</strong> You are accessing this quiz with profile: <strong>{userProfile}</strong>
            </Typography>
            <Typography variant="body2">
              <strong>Note:</strong> After submitting this quiz, you will be redirected to your dashboard. 
              Your results will be available there for review.
            </Typography>
          </Alert>
          {questions.length === 0 && (
            <Alert severity="info">
              <Typography>No questions found for this quiz.</Typography>
            </Alert>
          )}
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            {questions.map((q, idx) => (
              <Box key={q.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {idx + 1}. {q.question_text} 
                  <span style={{ color: '#888', fontSize: '0.9rem' }}> [{q.question_type}]</span>
                  <Typography variant="caption" display="block" color="text.secondary">
                    From: {q.packetName}
                  </Typography>
                </Typography>
                {q.question_type === 'mcq' && q.options && (
                  <RadioGroup
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                  >
                    {q.options.map((opt, i) => {
                      // Handle both new format (object with text and marks) and old format (string)
                      const optionText = typeof opt === 'object' ? opt.text : opt;
                      const optionMarks = typeof opt === 'object' ? opt.marks : (q.marks || 1);
                      return (
                        <FormControlLabel 
                          key={i} 
                          value={optionText} 
                          control={<Radio />} 
                          label={optionText} 
                        />
                      );
                    })}
                  </RadioGroup>
                )}
                {q.question_type === 'true_false' && (
                  <RadioGroup
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                  >
                    {q.options ? (
                      // Handle new format with individual marks
                      q.options.map((opt, i) => {
                        const optionText = typeof opt === 'object' ? opt.text : opt;
                        const optionMarks = typeof opt === 'object' ? opt.marks : (q.marks || 1);
                        return (
                          <FormControlLabel 
                            key={i} 
                            value={optionText.toLowerCase()} 
                            control={<Radio />} 
                            label={optionText} 
                          />
                        );
                      })
                    ) : (
                      // Fallback to old format
                      <>
                        <FormControlLabel value="true" control={<Radio />} label="True" />
                        <FormControlLabel value="false" control={<Radio />} label="False" />
                      </>
                    )}
                  </RadioGroup>
                )}
              </Box>
            ))}
            {questions.length > 0 && (
              <Button type="submit" variant="contained" color="primary">
                Submit Quiz & Return to Dashboard
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuizAttempt; 