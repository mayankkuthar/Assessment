import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import './QuizAttempt.css';

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

  // Timestamp captured when the user actually starts the quiz
  const startedAtRef = useRef(null);

  // Pending auto-advance timers, so manual navigation can cancel them
  const advanceTimers = useRef([]);
  const clearAdvance = () => {
    advanceTimers.current.forEach(clearTimeout);
    advanceTimers.current = [];
  };
  // Cancel any pending timers on unmount
  useEffect(() => () => clearAdvance(), []);

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
          fetch(`/api/quizzes/${quizId}`),
          fetch(`/api/questions?quiz_id=${quizId}`),
          fetch('/api/profiles'),
          fetch('/api/quiz-assignments')
        ]);

        if (!quizRes.ok || !questionsRes.ok) {
          throw new Error('Failed to load quiz data');
        }

        const quizData = await quizRes.json();
        const questionsData = await questionsRes.json();
        const profilesData = profilesRes.ok ? await profilesRes.json() : [];
        const assignmentsData = assignmentsRes.ok ? await assignmentsRes.json() : [];

        // Find user's profile and assignment - try multiple matching strategies
        const foundProfile = profilesData.find(p => 
          p.user_id === currentUser.id || 
          p.user_id === String(currentUser.id) ||
          p.user_id === Number(currentUser.id) ||
          p.email === currentUser.email
        );
        
        const assignment = assignmentsData.find(a => 
          a.quiz_id === quizId && (
            a.profile_id === foundProfile?.id ||
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
        console.log('Found user profile:', foundProfile);
        console.log('Found assignment:', assignment);

        // More flexible access control - allow access if user exists and quiz exists
        if (!currentUser) {
          setAccessDenied(true);
          setError('Please log in to access this quiz.');
          return;
        }

        // If no profile exists, create a default one or allow access anyway
        if (!foundProfile) {
          console.log('No user profile found, allowing access with default profile');
          const defaultProfile = {
            id: `profile_${currentUser.id}`,
            user_id: currentUser.id,
            name: currentUser.user_name || currentUser.email || 'User',
            email: currentUser.email
          };
          setUserProfile(defaultProfile);
        } else {
          setUserProfile(foundProfile);
        }

        // If no assignment exists, create a default one or allow access anyway
        if (!assignment) {
          console.log('No quiz assignment found, allowing access with default assignment');
          const defaultAssignment = {
            id: `assignment_${currentUser.id}_${quizId}`,
            quiz_id: quizId,
            profile_id: foundProfile?.id || `profile_${currentUser.id}`,
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

        // Fallback start time: ensures started_at is recorded even if the
        // description screen is skipped. The Start button refines this.
        if (!startedAtRef.current) {
          startedAtRef.current = new Date().toISOString();
        }

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
    setAnswers(prev => ({ ...prev, [qid]: value }));

    // Only auto-advance if not on the last question
    if (currentQuestionIndex < questions.length - 1) {
      clearAdvance();
      const t1 = setTimeout(() => {
        setIsTransitioning(true);

        const t2 = setTimeout(() => {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setQuestionAnimationKey(prev => prev + 1);
          setIsTransitioning(false);
          setSelectedOption('');

          // Show motivational notification after every 10 questions
          showMotivationalNotification(nextIndex);
        }, 400);
        advanceTimers.current.push(t2);
      }, 500);
      advanceTimers.current.push(t1);
    } else {
      setSelectedOption('');
    }
  };

  // Navigate between questions (with the same transition animation as auto-advance)
  // so users can go back to review/change earlier answers and move forward again.
  // Cancels any pending auto-advance so manual navigation always wins.
  const goToQuestion = (index) => {
    if (index < 0 || index > questions.length - 1) return;
    clearAdvance();
    setIsTransitioning(true);
    const t = setTimeout(() => {
      setCurrentQuestionIndex(index);
      setQuestionAnimationKey(prev => prev + 1);
      setIsTransitioning(false);
      setSelectedOption('');
      showMotivationalNotification(index);
    }, 300);
    advanceTimers.current.push(t);
  };

  const handlePrevious = () => goToQuestion(currentQuestionIndex - 1);
  const handleNext = () => goToQuestion(currentQuestionIndex + 1);

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
              name: packetName
            };
          }
          
          // Find the selected option and get its pre-assigned marks
          console.log('Question Options:', question.options);
          let marksAwarded = 0;
          
          if (question.options && Array.isArray(question.options)) {
            if (typeof question.options[0] === 'object' && question.options[0].hasOwnProperty('marks')) {
              let selectedOpt = null;
              selectedOpt = question.options.find(opt => opt.text === answer);
              if (!selectedOpt) {
                selectedOpt = question.options.find(opt => 
                  opt.text && answer && opt.text.toLowerCase() === answer.toLowerCase()
                );
              }
              if (selectedOpt) {
                marksAwarded = selectedOpt.marks || 0;
              }
            } else {
              marksAwarded = question.marks || 1;
            }
          } else {
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
          if (typeof question.options[0] === 'object' && question.options[0].hasOwnProperty('marks')) {
            const optionMarks = question.options.map(opt => opt.marks || 0);
            maxPossibleMarks += Math.max(...optionMarks, 0);
          } else {
            maxPossibleMarks += question.marks || 1;
          }
        } else {
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
          let packetMaxMarks = 0;
          if (packet.questions) {
            packet.questions.forEach(q => {
              if (q.options && Array.isArray(q.options)) {
                if (typeof q.options[0] === 'object' && q.options[0].hasOwnProperty('marks')) {
                  const optionMarks = q.options.map(opt => opt.marks || 0);
                  packetMaxMarks += Math.max(...optionMarks, 0);
                } else {
                  packetMaxMarks += q.marks || 1;
                }
              } else {
                packetMaxMarks += q.marks || 1;
              }
            });
          }
          
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
        started_at: startedAtRef.current || currentTime,
        completed_at: currentTime,
        time_taken: startedAtRef.current
          ? Math.max(0, Math.round((new Date(currentTime) - new Date(startedAtRef.current)) / 1000))
          : null,
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
      const attemptResponse = await fetch('/api/quiz-attempts', {
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

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="quiz-attempt__loading">
        <div className="quiz-attempt__spinner" />
        <span className="quiz-attempt__loading-text">Loading your quiz...</span>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className="quiz-attempt__error">
        <div className="quiz-attempt__error-card">
          <h3>Error Loading Quiz</h3>
          <p>{error}</p>
          <button className="btn--outline" onClick={() => navigate('/')}>
            <ArrowBack style={{ width: 18, height: 18 }} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz not found ─────────────────────────────────────────
  if (!quiz) {
    return (
      <div className="quiz-attempt__error">
        <div className="quiz-attempt__error-card">
          <h3>Quiz Not Found</h3>
          <p>The requested quiz could not be found.</p>
        </div>
      </div>
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
  const getMotivationalMessage = () => {
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
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  // Show notification after every 10 questions
  const showMotivationalNotification = (currentIdx) => {
    if ((currentIdx + 1) % 10 === 0 && 
        currentIdx < questions.length - 1 &&
        !showQuizDescription) {
      const message = getMotivationalMessage();
      setNotificationMessage(message);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };

  // Render options for any question type
  const renderOptions = () => {
    if (!currentQuestion) return null;

    let options = [];
    const qType = currentQuestion.question_type;

    if (qType === 'true_false' && !currentQuestion.options) {
      options = [
        { text: 'True', value: 'true' },
        { text: 'False', value: 'false' }
      ];
    } else if (currentQuestion.options && Array.isArray(currentQuestion.options)) {
      options = currentQuestion.options.map(opt => {
        const text = typeof opt === 'object' ? opt.text : opt;
        const value = qType === 'true_false' ? text.toLowerCase() : text;
        return { text, value };
      });
    }

    return (
      <div className="quiz-attempt__options">
        {options.map((opt, i) => {
          const isSelected = answers[currentQuestion.id] === opt.value;
          return (
            <div
              key={i}
              className={`quiz-attempt__option${isSelected ? ' quiz-attempt__option--selected' : ''}`}
              onClick={() => handleChange(currentQuestion.id, opt.value)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleChange(currentQuestion.id, opt.value); }}
            >
              <span className="quiz-attempt__option-radio" />
              <span className="quiz-attempt__option-label">{opt.text}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="quiz-attempt">
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
      
      {/* Motivational Notification Toast */}
      <div className={`quiz-attempt__toast${showNotification ? ' quiz-attempt__toast--visible' : ''}`}>
        {notificationMessage}
      </div>
      
      {/* Header */}
      <div className="quiz-attempt__header">
        <button className="quiz-attempt__back-btn" onClick={() => navigate('/')} title="Back to Dashboard">
          <ArrowBack style={{ width: 20, height: 20 }} />
        </button>

        <div className="quiz-attempt__header-info">
          <span className="quiz-attempt__quiz-name">{quiz?.name || 'Quiz'}</span>
          <span className="quiz-attempt__header-divider" />
          <span className="quiz-attempt__user-badge">
            <PersonIcon style={{ fontSize: 18 }} />
            <span className="quiz-attempt__user-name">
              {userProfile?.name || user?.user_name || user?.email || 'User'}
            </span>
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      {!showQuizDescription && (
        <div className="quiz-attempt__progress">
          <div className="quiz-attempt__progress-fill" style={{ width: `${progress}%` }} />
          <div className="quiz-attempt__progress-label">{progress}%</div>
        </div>
      )}

      {/* Main Content */}
      <div className="quiz-attempt__body">
        {showQuizDescription ? (
          /* ── Description Card ── */
          <div className="quiz-attempt__desc-wrap">
            <div className="quiz-attempt__desc-card">
              <div className="quiz-attempt__desc-inner">
                <img 
                  src="https://happimynd.com/assets/Frontend/images/happimynd_logo.png"
                  alt="HappiMynd Logo"
                  className="quiz-attempt__desc-logo"
                />
                <h2 className="quiz-attempt__desc-title">
                  Why should I take this assessment?
                </h2>
                
                <div className="quiz-attempt__desc-body">
                  <p>
                    Life is made up of many small and big moments, some exciting, some stressful, and some that test our patience.
                  </p>
                  <p>
                    From experiencing joy to feeling overwhelmed by responsibilities or uncertainty to having tough conversations, making big decisions, challenges come our way every day. How we deal with them depends not just on what we know, but on how well we understand and manage our emotions while connecting with others.
                  </p>
                  <p>
                    That's what Emotional Intelligence (EQ) means, it's simply being smart about feelings: knowing your own emotions and understanding others.
                  </p>
                  <p>
                    This assessment will help you discover your strengths, identify areas to improve to help yourself handle overall life and manage relationships with more ease. Just a few minutes can create lasting change in both your personal happiness and professional success.
                  </p>
                  <p className="underline">
                    The better you understand your emotions, the better you live, connect and grow!!
                  </p>
                  <p>
                    Don't forget to turn your assessment insights into action by booking a report reading session on receiving the report. You have access to our experts to gain deeper clarity and create your roadmap forward.
                  </p>
                </div>

                <h3 className="quiz-attempt__instructions-title">Instructions:</h3>
                
                <ul className="quiz-attempt__instructions-list">
                  <li>Read each statement carefully</li>
                  <li>There is no right and wrong answer, so no judgement</li>
                  <li>1 in the likert scale represent Strongly Disagree and 5 represents Strongly Agree</li>
                  <li>Please avoid marking the neutral response and share real time experiences</li>
                  <li>Please answer all the questions with your natural instinct</li>
                  <li>Your responses will be kept 100% confidential</li>
                </ul>

                <button
                  className="quiz-attempt__start-btn"
                  onClick={() => {
                    startedAtRef.current = new Date().toISOString();
                    setShowQuizDescription(false);
                  }}
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Question Card ── */
          <div
            key={questionAnimationKey}
            className={`quiz-attempt__question-wrap${isTransitioning ? ' quiz-attempt__question-wrap--transitioning' : ''}`}
          >
            <div className="quiz-attempt__question-card">
              <div className="quiz-attempt__question-inner">
                {currentQuestion && (
                  <>
                    <h2 className="quiz-attempt__question-text">
                      {currentQuestion.question_text}
                    </h2>
                    {renderOptions()}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Question navigation: go back to change answers, move forward, or submit */}
        {!showQuizDescription && (
          <div className="quiz-attempt__nav">
            <button
              className="quiz-attempt__nav-btn"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isTransitioning}
            >
              <ArrowBack style={{ width: 18, height: 18 }} />
              Previous
            </button>

            <span className="quiz-attempt__nav-counter">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>

            {isLastQuestion ? (
              <button
                className="quiz-attempt__submit-btn"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length}
              >
                Submit Quiz
                <CheckCircle style={{ width: 20, height: 20 }} />
              </button>
            ) : (
              <button
                className="quiz-attempt__nav-btn quiz-attempt__nav-btn--next"
                onClick={handleNext}
                disabled={isTransitioning}
              >
                Next
                <ArrowForward style={{ width: 18, height: 18 }} />
              </button>
            )}
          </div>
        )}
        
        {/* Powered by HappiMynd Footer */}
        {!showQuizDescription && (
          <div className="quiz-attempt__powered">
            <img 
              src="https://happimynd.com/assets/Frontend/images/happimynd_logo.png"
              alt="HappiMynd Logo"
            />
            <span>Powered by HappiMynd</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAttempt;