import React, { useState, useEffect } from 'react';
import {
  Assessment as AssessmentIcon,
  Quiz as QuizIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useDatabase } from '../hooks/useDatabase';
import './AssessmentResults.css';

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
      const packetsResponse = await fetch(`http://65.1.6.81:3001/api/quiz-packets/${quizId}`);
      if (packetsResponse.ok) {
        const quizPacketsData = await packetsResponse.json();
        setQuizPackets(quizPacketsData);
      }

      const response = await fetch(`http://65.1.6.81:3001/api/quiz-attempts`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz attempts');
      }
      
      const allAttempts = await response.json();
      
      // Filter attempts for this specific quiz
      const filteredAttempts = allAttempts.filter(attempt => attempt.quiz_id === quizId);
      
      // Enrich attempts with user and profile data
      const enrichedAttempts = await Promise.all(
        filteredAttempts.map(async (attempt) => {
          try {
            // Fetch actual user data for each attempt
            let userData = null;
            if (attempt.user_id) {
              const userResponse = await fetch(`http://65.1.6.81:3001/api/users/${attempt.user_id}`);
              if (userResponse.ok) {
                userData = await userResponse.json();
              }
            }
            
            // Find profile by name (since users now store profile name as string)
            let profile = null;
            if (userData && userData.profile) {
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
              user = {
                name: profile.name || 'Unknown User',
                email: profile.email || 'No email'
              };
            } else {
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
    try {
      const savedScaling = localStorage.getItem('packetScaling_' + packetName);
      if (savedScaling) {
        const customScale = JSON.parse(savedScaling);
        if (customScale.enabled && customScale.scales && customScale.scales.length > 0) {
          const level = customScale.scales.find(range => marks >= range.min && marks <= range.max);
          if (level) return level;
        }
      }
    } catch (error) {
      console.warn('Failed to parse custom scaling for packet:', packetName, error);
    }
    
    const defaultScale = [
      { min: 0, max: 2, label: "Needs Improvement", color: "#ff6b6b", image: "" },
      { min: 3, max: 5, label: "Average", color: "#ffd93d", image: "" },
      { min: 6, max: 8, label: "Good", color: "#6bcf7f", image: "" },
      { min: 9, max: 12, label: "Excellent", color: "#4ecdc4", image: "" }
    ];
    
    const level = defaultScale.find(range => marks >= range.min && marks <= range.max);
    return level || defaultScale[0];
  };

  // Calculate packet-based scores for an attempt
  const calculatePacketScores = (attempt) => {
    const packetScores = {};
    
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

  // ── Loading state ──────────────────────────────────────────
  if (dataLoading) {
    return (
      <div className="results-spinner-wrap">
        <div className="results-spinner" />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (dataError) {
    return (
      <div className="assessment-results">
        <div className="report-alert">Error loading data: {dataError}</div>
      </div>
    );
  }

  // ── Detail view (quiz selected) ────────────────────────────
  if (selectedQuiz) {
    return (
      <div className="assessment-results">
        {/* Header */}
        <div className="results-header" style={{ flexWrap: 'wrap' }}>
          <button className="results-back-btn" onClick={handleBackToQuizzes} style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}>
            <ArrowBackIcon style={{ color: '#fff' }} />
          </button>
          <div className="results-header__text">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AssessmentIcon style={{ width: 28, height: 28 }} />
              Assessment Results: {selectedQuiz.name}
            </h1>
            <p>View all attempt records for this quiz with performance levels and packet-by-packet analysis</p>
          </div>
        </div>

        {/* Quiz Info Banner */}
        <div className="results-info-banner">
          <div>
            <h3>Quiz Details</h3>
            <p><strong>Description:</strong> {selectedQuiz.description || 'No description'}</p>
            <p><strong>Time Limit:</strong> {selectedQuiz.time_limit ? `${selectedQuiz.time_limit} minutes` : 'No time limit'}</p>
            <p><strong>Passing Score:</strong> {selectedQuiz.passing_score ? `${selectedQuiz.passing_score}%` : 'Not set'}</p>
          </div>
          <div>
            <h3>Statistics</h3>
            <p><strong>Total Attempts:</strong> {quizAttempts.length}</p>
            <p><strong>Packets:</strong> {quizPackets.length}</p>
            <p><strong>Completion Rate:</strong> {
              quizAttempts.length > 0
                ? `${quizAttempts.filter(a => a.status === 'completed').length}/${quizAttempts.length}`
                : 'No attempts'
            }</p>
          </div>
        </div>

        {/* Attempts Table */}
        {loading ? (
          <div className="results-spinner-wrap">
            <div className="results-spinner" />
          </div>
        ) : error ? (
          <div className="report-alert">{error}</div>
        ) : quizAttempts.length === 0 ? (
          <div className="results-empty">
            <AssessmentIcon />
            <h3>No attempts found</h3>
            <p>This quiz hasn't been attempted by any users yet.</p>
          </div>
        ) : (
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Profile</th>
                  <th>Organization</th>
                  <th>Status</th>
                  <th>Completed</th>
                  {quizPackets.map(packet => (
                    <th key={packet.id} style={{ minWidth: 120 }}>{packet.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quizAttempts.map((attempt) => {
                  const packetScores = calculatePacketScores(attempt);
                  
                  return (
                    <tr key={attempt.id}>
                      <td>
                        <p className="results-table__user-name">{attempt.user?.name || 'Unknown User'}</p>
                        <p className="results-table__user-email">{attempt.user?.email || 'No email'}</p>
                      </td>
                      <td>
                        <p className="results-table__user-name">{attempt.profile?.name || 'Unknown Profile'}</p>
                        <p className="results-table__user-email">{attempt.profile?.role || 'No role'}</p>
                      </td>
                      <td>
                        <span className="results-badge results-badge--outline">
                          {attempt.user?.organization || 'Not specified'}
                        </span>
                      </td>
                      <td>
                        <span className={`results-badge ${attempt.status === 'completed' ? 'results-badge--completed' : 'results-badge--warning'}`}>
                          {attempt.status || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-secondary)' }}>
                        {formatDate(attempt.completed_at)}
                      </td>
                      {quizPackets.map(packet => {
                        const packetScore = packetScores[packet.id];
                        return (
                          <td key={packet.id} className="results-performance-cell">
                            <span
                              className="results-performance-badge"
                              style={{ backgroundColor: packetScore.performanceLevel.color }}
                            >
                              {packetScore.performanceLevel.label}
                            </span>
                            <br />
                            <span className="results-performance-sub">
                              {packetScore.questions} questions
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── Quiz selection grid ────────────────────────────────────
  return (
    <div className="assessment-results">
      {/* Header */}
      <div className="results-header">
        <div className="results-header__icon">
          <AssessmentIcon />
        </div>
        <div className="results-header__text">
          <h1>Assessment Results</h1>
          <p>Click on any quiz to view detailed attempt records with performance levels and packet-by-packet analysis</p>
        </div>
      </div>

      {/* Quizzes Grid */}
      {quizzes.length === 0 ? (
        <div className="results-empty">
          <QuizIcon />
          <h3>No quizzes available</h3>
          <p>Create some quizzes first to view assessment results.</p>
        </div>
      ) : (
        <div className="results-quiz-grid">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="results-quiz-card"
              onClick={() => handleQuizClick(quiz)}
            >
              <div className="results-quiz-card__header">
                <div className="results-quiz-card__icon">
                  <QuizIcon />
                </div>
                <h3 className="results-quiz-card__name">{quiz.name}</h3>
              </div>
              
              <p className="results-quiz-card__desc">
                {quiz.description || 'No description available'}
              </p>
              
              <div className="results-quiz-card__footer">
                <div className="results-quiz-card__meta">
                  <div>
                    <span className="results-quiz-card__meta-label">Time Limit</span>
                    <span className="results-quiz-card__meta-value">{quiz.time_limit ? `${quiz.time_limit} min` : 'No limit'}</span>
                  </div>
                  <div>
                    <span className="results-quiz-card__meta-label">Passing Score</span>
                    <span className="results-quiz-card__meta-value">{quiz.passing_score ? `${quiz.passing_score}%` : 'Not set'}</span>
                  </div>
                </div>
                
                <button className="results-quiz-card__action-btn">
                  <AssessmentIcon style={{ width: 18, height: 18 }} />
                  View Results
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentResults;
