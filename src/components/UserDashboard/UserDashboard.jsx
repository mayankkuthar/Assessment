import React, { useState, useEffect, useMemo } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const {
    userQuizAttempts,
    loadUserQuizAttempts,
    profiles,
    quizzes,
    quizAssignments,
    loading: dbLoading
  } = useDatabase();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setError(null);

        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          setError('No user found. Please log in.');
          return;
        }

        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);

        await loadUserQuizAttempts(currentUser.id);

      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [loadUserQuizAttempts]);

  // Resolve the user's assigned quizzes client-side.
  // The /api/users/:id/assigned-quizzes endpoint returns [] (it never maps a
  // user to their profile's assignments), so we join the data the app already
  // loads: user.profile is a profile *name* → match the profile record →
  // pull quiz_assignments for that profile_id → attach the quiz details.
  const assignedQuizzes = useMemo(() => {
    if (!user) return [];

    const userProfile = profiles.find(p =>
      (user.profile != null && p.name === user.profile) ||
      (user.profile_id != null && String(p.id) === String(user.profile_id))
    );

    return quizAssignments
      .filter(a => 
        (userProfile && String(a.profile_id) === String(userProfile.id) && !a.user_id) ||
        (a.user_id && String(a.user_id) === String(user.id))
      )
      .map(a => {
        const assignedProfile = userProfile || (a.profile_id ? profiles.find(p => String(p.id) === String(a.profile_id)) : null);
        return {
          ...a,
          quiz: quizzes.find(q => String(q.id) === String(a.quiz_id)) || null,
          profile: assignedProfile
        };
      })
      .filter(a => a.quiz); // drop assignments whose quiz was deleted
  }, [user, profiles, quizzes, quizAssignments]);

  // Derive the summary cards from the user's actual attempts so they stay in
  // sync with the Recent Attempts list and update as more quizzes are taken.
  // (The /stats endpoint returns totalQuizzes/completedQuizzes, not the
  // totalAttempts field the cards used to read — hence the stale "0".)
  const stats = useMemo(() => {
    const completedQuizIds = new Set(
      userQuizAttempts
        .filter(a => a.completed_at || a.status === 'completed')
        .map(a => String(a.quiz_id))
    );
    const completedCount = completedQuizIds.size;

    // Pending = anything still to finish: quizzes with an in-progress attempt
    // (started but not completed) plus assigned quizzes not yet completed.
    // Counted as distinct quizzes and excluding already-completed ones, so an
    // in-progress attempt shows up even if the quiz isn't a profile assignment.
    const pendingQuizIds = new Set();
    userQuizAttempts
      .filter(a => !a.completed_at && a.status !== 'completed')
      .forEach(a => pendingQuizIds.add(String(a.quiz_id)));
    assignedQuizzes.forEach(aq => pendingQuizIds.add(String(aq.quiz_id)));
    completedQuizIds.forEach(id => pendingQuizIds.delete(id));
    const pendingCount = pendingQuizIds.size;

    return { completedCount, pendingCount };
  }, [userQuizAttempts, assignedQuizzes]);

  // Estimate time the same way the admin's Assessment Results does: based on the
  // quiz's question count (≈40s per question), not the stale stored time_limit.
  const estimateTimeLimit = (questionCount) => {
    if (!questionCount || questionCount <= 0) return 'N/A';
    return `${Math.ceil((questionCount * 40) / 60)} min`;
  };

  // Question count per assigned quiz (sum of questions across its packets),
  // fetched the same way the admin dashboard does, so the displayed time matches.
  const [questionCounts, setQuestionCounts] = useState({});
  useEffect(() => {
    const ids = [...new Set(assignedQuizzes.map(a => a.quiz_id))];
    if (ids.length === 0) return;

    let cancelled = false;
    const loadCounts = async () => {
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/quiz-packets/${id}`);
            if (!res.ok) return [id, 0];
            const packetsData = await res.json();
            const count = packetsData.reduce(
              (sum, packet) => sum + (packet.questions ? packet.questions.length : 0),
              0
            );
            return [id, count];
          } catch {
            return [id, 0];
          }
        })
      );
      if (!cancelled) setQuestionCounts(Object.fromEntries(entries));
    };

    loadCounts();
    return () => { cancelled = true; };
  }, [assignedQuizzes]);

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

  if (loading || dbLoading) {
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
              <div className="stat-card__value">{stats.completedCount}</div>
              <div className="stat-card__label">Completed Assessments</div>
            </div>
            <div className="stat-card__icon">
              <CheckCircleIcon />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__content">
            <div>
              <div className="stat-card__value">{stats.pendingCount}</div>
              <div className="stat-card__label">Pending Assessments</div>
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
              {assignedQuizzes.map((assignment) => {
                const incompleteAttempt = userQuizAttempts.find(
                  a => String(a.quiz_id) === String(assignment.quiz_id) && (!a.completed_at && a.status !== 'completed')
                );
                return (
                  <article key={assignment.id} className="list-item">
                    <div className="list-item__content">
                      <div className="list-item__header">
                        <QuizIcon className="list-item__icon" />
                        <h3 className="list-item__title">{assignment.quiz?.name}</h3>
                      </div>
                      <p className="list-item__desc">{assignment.quiz?.description}</p>
                      <div className="list-item__tags">
                        <span className="badge badge--primary">{assignment.profile?.name}</span>
                        {incompleteAttempt && (
                          <span className="badge badge--warning" style={{ display: 'flex', alignItems: 'center' }}>
                            <HourglassEmptyIcon sx={{ fontSize: 14, mr: 0.5 }} /> Pending Completion
                          </span>
                        )}
                        {questionCounts[assignment.quiz_id] > 0 && (
                          <span className="badge badge--outline" style={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} /> {estimateTimeLimit(questionCounts[assignment.quiz_id])}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="list-item__action">
                      <button
                        className="btn btn--primary"
                        onClick={() => window.open(`/attempt/${assignment.quiz_id}`, '_blank')}
                      >
                        {incompleteAttempt ? 'Resume Assessment' : 'Start Quiz'} &rarr;
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Attempts */}
        <section className="section-card">
          <h2 className="section-card__header">
            <div className="section-card__header-icon" style={{ backgroundColor: '#895BF5' }}>
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
              {userQuizAttempts.slice(0, 5).map((attempt) => {
                const isCompleted = attempt.completed_at || attempt.status === 'completed';
                return (
                  <article key={attempt.id} className="list-item">
                    <div className="list-item__content">
                      <div className="list-item__header">
                        {isCompleted ? (
                          <CheckCircleIcon className="list-item__icon" style={{ color: '#895BF5' }} />
                        ) : (
                          <ScheduleIcon className="list-item__icon" style={{ color: '#895BF5' }} />
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
                        {isCompleted ? (
                          <span className="badge badge--success" style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5 }} /> Completed
                          </span>
                        ) : (
                          <span className="badge badge--warning" style={{ display: 'flex', alignItems: 'center' }}>
                            <HourglassEmptyIcon sx={{ fontSize: 14, mr: 0.5 }} /> Pending Completion
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="list-item__action">
                      {isCompleted ? (
                        <button
                          className="btn btn--secondary"
                          onClick={() => navigate(`/report/${attempt.quiz_id}/${attempt.id}`)}
                        >
                          <VisibilityIcon className="btn-icon" />
                          View Report
                        </button>
                      ) : (
                        <button
                          className="btn btn--primary"
                          onClick={() => window.open(`/attempt/${attempt.quiz_id}`, '_blank')}
                        >
                          Resume &rarr;
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}

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
