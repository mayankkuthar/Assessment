import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../hooks/useDatabase';
import {
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const {
    userQuizAttempts,
    userStats,
    loadUserQuizAttempts,
    loadUserStats,
    getAssignedQuizzesForUser
  } = useDatabase();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          setError('No user found. Please log in.');
          return;
        }

        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);

        await Promise.all([
          loadUserQuizAttempts(currentUser.id),
          loadUserStats(currentUser.id)
        ]);

        const assigned = await getAssignedQuizzesForUser(currentUser.id);
        setAssignedQuizzes(assigned);

      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [loadUserQuizAttempts, loadUserStats, getAssignedQuizzesForUser]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard__loading">
        <div className="dashboard__spinner" aria-label="Loading dashboard..."></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard">
        <div className="alert alert--warning" role="alert">
          Please log in to view your dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-content">
          <div className="dashboard__avatar">
            <PersonIcon />
          </div>
          <div>
            <h1 className="dashboard__title">Welcome back!</h1>
            <div className="dashboard__subtitle">
              <EmailIcon />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard__grid-stats">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__content">
            <div>
              <div className="stat-card__value">{userStats?.totalAttempts || 0}</div>
              <div className="stat-card__label">Total Attempts</div>
            </div>
            <div className="stat-card__icon">
              <QuizIcon />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__content">
            <div>
              <div className="stat-card__value">{userStats?.completionRate || 0}%</div>
              <div className="stat-card__label">Completion Rate</div>
            </div>
            <div className="stat-card__icon">
              <ScheduleIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__grid-sections">
        {/* Assigned Quizzes */}
        <section className="section-card">
          <h2 className="section-card__header">
            <div className="section-card__header-icon">
              <AssignmentIcon />
            </div>
            Assigned Quizzes
          </h2>

          {assignedQuizzes.length === 0 ? (
            <div className="empty-state">
              <AssignmentIcon className="empty-state__icon" />
              <div className="empty-state__title">No quizzes assigned yet</div>
              <div className="empty-state__subtitle">New quizzes will appear here when assigned</div>
            </div>
          ) : (
            <div>
              {assignedQuizzes.map((assignment) => (
                <article key={assignment.id} className="list-item">
                  <div className="list-item__content">
                    <div className="list-item__header">
                      <QuizIcon className="list-item__icon" />
                      <h3 className="list-item__title">{assignment.quiz?.name}</h3>
                    </div>
                    <p className="list-item__desc">{assignment.quiz?.description}</p>
                    <div className="list-item__tags">
                      <span className="badge badge--primary">{assignment.profile?.name}</span>
                      {assignment.quiz?.time_limit && (
                        <span className="badge badge--outline" style={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} /> {assignment.quiz.time_limit} min
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="list-item__action">
                    <button
                      className="btn btn--primary"
                      onClick={() => window.open(`/attempt/${assignment.quiz_id}`, '_blank')}
                    >
                      Start Quiz &rarr;
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Recent Attempts */}
        <section className="section-card">
          <h2 className="section-card__header">
            <div className="section-card__header-icon" style={{ backgroundColor: '#10b981' }}>
              <TrendingUpIcon />
            </div>
            Recent Attempts
          </h2>

          {userQuizAttempts.length === 0 ? (
            <div className="empty-state">
              <TrendingUpIcon className="empty-state__icon" />
              <div className="empty-state__title">No attempts yet</div>
              <div className="empty-state__subtitle">Your quiz results will show up here</div>
            </div>
          ) : (
            <div>
              {userQuizAttempts.slice(0, 5).map((attempt) => (
                <article key={attempt.id} className="list-item">
                  <div className="list-item__content">
                    <div className="list-item__header">
                      {attempt.completed_at ? (
                        <CheckCircleIcon className="list-item__icon" style={{ color: '#10b981' }} />
                      ) : (
                        <ScheduleIcon className="list-item__icon" style={{ color: '#f59e0b' }} />
                      )}
                      <div>
                        <h3 className="list-item__title" style={{ marginBottom: '4px' }}>
                          {attempt.quiz?.name || 'Quiz'}
                        </h3>
                        <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center' }}>
                          <EventIcon sx={{ fontSize: 16, mr: 0.5 }} /> {formatDate(attempt.started_at)}
                        </div>
                      </div>
                    </div>
                    <div className="list-item__tags" style={{ marginTop: '12px' }}>
                      <span className="badge badge--primary">{attempt.profile?.name}</span>
                      {attempt.completed_at ? (
                        <span className="badge badge--success" style={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5 }} /> Completed
                        </span>
                      ) : (
                        <span className="badge badge--warning" style={{ display: 'flex', alignItems: 'center' }}>
                          <HourglassEmptyIcon sx={{ fontSize: 14, mr: 0.5 }} /> In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="list-item__action">
                    <button
                      className="btn btn--secondary"
                      onClick={() => navigate(`/report/${attempt.quiz_id}/${attempt.id}`)}
                    >
                      <VisibilityIcon className="btn-icon" />
                      View Report
                    </button>
                  </div>
                </article>
              ))}

              {userQuizAttempts.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
                  <button className="btn btn--outline">
                    View All {userQuizAttempts.length} Attempts &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;
