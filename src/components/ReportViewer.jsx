import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Paper,
  LinearProgress,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import StarIcon from '@mui/icons-material/Star';
import TargetIcon from '@mui/icons-material/GpsFixed';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const defaultTemplate = {
  header: {
    enabled: true,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    title: 'Assessment Performance Report',
    subtitle: 'Comprehensive Analysis Report',
    showDate: true,
    dateFormat: 'MMM DD, YYYY'
  },
  userInfo: {
    enabled: true,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: '16px',
    padding: '24px'
  },
  overallScore: {
    enabled: true,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: '16px',
    padding: '24px'
  },
  charts: {
    enabled: true,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: '16px',
    padding: '24px'
  },
  sectionAnalysis: {
    enabled: true,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: '16px',
    padding: '24px'
  }
};

const FALLBACK_SCALE = [
  { 
    min: 0, max: 2, 
    label: 'Needs Improvement', 
    color: '#ef4444', 
    lightColor: '#fef2f2',
    image: '📚', 
    largeText: "Keep practicing! You're making progress. Focus on building fundamental skills.",
    icon: '📚'
  },
  { 
    min: 3, max: 5, 
    label: 'Developing', 
    color: '#f59e0b', 
    lightColor: '#fffbeb',
    image: '📊', 
    largeText: "Good effort! You're on the right track. Continue building on your foundation.",
    icon: '📊'
  },
  { 
    min: 6, max: 8, 
    label: 'Proficient', 
    color: '#10b981', 
    lightColor: '#f0fdf4',
    image: '🎯', 
    largeText: "Well done! You're showing strong understanding and solid skills.",
    icon: '🎯'
  },
  { 
    min: 9, max: 12, 
    label: 'Excellent', 
    color: '#8b5cf6', 
    lightColor: '#faf5ff',
    image: '🏆', 
    largeText: "Outstanding! You've mastered this material with exceptional performance!",
    icon: '🏆'
  }
];

function formatDate(dateString) {
  try {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
}

function getPerformanceLevel(marks, packetName) {
  try {
    const savedScaling = localStorage.getItem('packetScaling_' + packetName);
    if (savedScaling) {
      const customScale = JSON.parse(savedScaling);
      if (customScale.enabled && customScale.scales && customScale.scales.length > 0) {
        const level = customScale.scales.find(range => marks >= range.min && marks <= range.max);
        if (level) return level;
      }
    }
  } catch {}

  return FALLBACK_SCALE.find(range => marks >= range.min && marks <= range.max) || FALLBACK_SCALE[0];
}

// Modern Chart Component
const ModernBarChart = ({ data, height = 200 }) => {
  const theme = useTheme();
  const maxRank = Math.max(...data.map(d => d.rank));
  
  return (
    <Box sx={{ height, display: 'flex', alignItems: 'flex-end', gap: 2, px: 2 }}>
      {data.map((item, index) => {
        const heightPercent = (item.rank / maxRank) * 100;
        return (
          <Box key={item.id} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 60,
                height: `${Math.max(20, heightPercent)}%`,
                background: `linear-gradient(135deg, ${item.level?.color || '#3b82f6'} 0%, ${alpha(item.level?.color || '#3b82f6', 0.7)} 100%)`,
                borderRadius: '8px 8px 4px 4px',
                position: 'relative',
                boxShadow: `0 4px 20px ${alpha(item.level?.color || '#3b82f6', 0.3)}`,
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(item.level?.color || '#3b82f6', 0.4)}`
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  p: 0.5,
                  boxShadow: 2
                }}
              >
                <Typography sx={{ fontSize: '16px' }}>
                  {item.level?.icon || '📊'}
                </Typography>
              </Box>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 1, 
                textAlign: 'center', 
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'text.secondary'
              }}
            >
              {item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

// Performance Ring Component
const PerformanceRing = ({ level, size = 120 }) => {
  const circumference = 2 * Math.PI * 45;
  const percentage = ((level?.rank || 1) / 4) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size/2}
          cy={size/2}
          r="45"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx={size/2}
          cy={size/2}
          r="45"
          stroke={level?.color || '#3b82f6'}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </svg>
      <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '24px', mb: 0.5 }}>
          {level?.icon || '📊'}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: level?.color }}>
          {Math.round(percentage)}%
        </Typography>
      </Box>
    </Box>
  );
};

// Radar (Spider) Chart Component
const RadarChart = ({ scores, size = 320 }) => {
  const theme = useTheme();
  const center = size / 2;
  const radius = Math.max(60, center - 40);
  const itemCount = scores.length;
  const angleStep = (Math.PI * 2) / Math.max(1, itemCount);

  const getPoint = (valueRatio, index) => {
    const angle = -Math.PI / 2 + angleStep * index;
    const r = radius * Math.min(1, Math.max(0, valueRatio));
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  };

  const valuePoints = scores
    .map((s, i) => getPoint((s.rank || 0) / Math.max(1, s.scaleLength || 1), i))
    .join(' ');

  const gridLevels = 4;
  const gridPolygons = Array.from({ length: gridLevels }, (_, levelIndex) => {
    const ratio = (levelIndex + 1) / gridLevels;
    const points = Array.from({ length: itemCount }, (_, i) => getPoint(ratio, i)).join(' ');
    return (
      <polygon
        key={`grid-${levelIndex}`}
        points={points}
        fill="none"
        stroke={alpha(theme.palette.text.primary, 0.15)}
        strokeWidth={1}
      />
    );
  });

  const axes = scores.map((s, i) => {
    const end = getPoint(1, i).split(',').map(Number);
    const labelRadius = radius + 16;
    const angle = -Math.PI / 2 + angleStep * i;
    const lx = center + labelRadius * Math.cos(angle);
    const ly = center + labelRadius * Math.sin(angle);
    const textAnchor = Math.cos(angle) > 0.2 ? 'start' : Math.cos(angle) < -0.2 ? 'end' : 'middle';
    const dy = Math.sin(angle) > 0.2 ? '1em' : Math.sin(angle) < -0.2 ? '-0.4em' : '0.35em';
    return (
      <g key={`axis-${i}`}>
        <line x1={center} y1={center} x2={end[0]} y2={end[1]} stroke={alpha(theme.palette.text.primary, 0.2)} strokeWidth={1} />
        <text x={lx} y={ly} textAnchor={textAnchor} fontSize={12} fill={alpha(theme.palette.text.primary, 0.8)} dy={dy}>
          {s.name}
        </text>
      </g>
    );
  });

  const dots = scores.map((s, i) => {
    const point = getPoint((s.rank || 0) / Math.max(1, s.scaleLength || 1), i).split(',').map(Number);
    return (
      <circle key={`dot-${i}`} cx={point[0]} cy={point[1]} r={3}
        fill={s.level?.color || theme.palette.primary.main}
        stroke={alpha(s.level?.color || theme.palette.primary.main, 0.5)}
        strokeWidth={1}
      />
    );
  });

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill={alpha(theme.palette.primary.main, 0.03)} stroke={alpha(theme.palette.text.primary, 0.15)} />
        {gridPolygons}
        {axes}
        <polygon
          points={valuePoints}
          fill={alpha(theme.palette.primary.main, 0.2)}
          stroke={theme.palette.primary.main}
          strokeWidth={2}
        />
        {dots}
      </svg>
    </Box>
  );
};

const ReportViewer = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [user, setUser] = useState(null);
  const [packets, setPackets] = useState([]);
  const [template, setTemplate] = useState(defaultTemplate);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError('');

        // Load quiz, attempts, packets, and template in parallel
        const [quizRes, attemptsRes, packetsRes, templateRes] = await Promise.all([
          fetch(`http://localhost:3001/api/quizzes/${quizId}`),
          fetch('http://localhost:3001/api/quiz-attempts'),
          fetch(`http://localhost:3001/api/quiz-packets/${quizId}`),
          fetch(`http://localhost:3001/api/pdf-templates/${quizId}`).catch(() => null)
        ]);

        if (!quizRes.ok || !attemptsRes.ok || !packetsRes.ok) {
          throw new Error('Failed to load report data');
        }

        const quizData = await quizRes.json();
        const attempts = await attemptsRes.json();
        const packetData = await packetsRes.json();
        let templateData = null;
        if (templateRes && templateRes.ok) {
          const t = await templateRes.json();
          templateData = t?.template || t;
        }

        const foundAttempt = attempts.find(a => a.id === attemptId);
        if (!foundAttempt) {
          throw new Error('Attempt not found');
        }

        let userData = null;
        if (foundAttempt.user_id) {
          try {
            const userRes = await fetch(`http://localhost:3001/api/users/${foundAttempt.user_id}`);
            if (userRes.ok) {
              userData = await userRes.json();
            }
          } catch {}
        }

        if (cancelled) return;
        setQuiz(quizData);
        setAttempt(foundAttempt);
        setUser(userData);
        setPackets(packetData || []);
        setTemplate(templateData || defaultTemplate);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [quizId, attemptId]);

  const packetScores = useMemo(() => {
    const scores = [];
    if (!attempt || packets.length === 0) return scores;
    const marksMap = attempt.packet_marks || {};
    for (const packet of packets) {
      const key = packet.name;
      const m = marksMap[key];
      const marks = m?.marks || 0;
      const scale = (packet && packet.enableScoringScale && Array.isArray(packet.scoringScale) && packet.scoringScale.length > 0)
        ? packet.scoringScale
        : FALLBACK_SCALE;
      const level = scale.find(range => marks >= range.min && marks <= range.max) || scale[0];
      const levelIndex = Math.max(0, scale.findIndex(r => r.label === level.label && r.min === level.min && r.max === level.max));
      const rank = levelIndex + 1;
      scores.push({
        id: packet.id,
        name: packet.name,
        level: { ...level, rank },
        rank,
        scaleLength: scale.length
      });
    }
    return scores;
  }, [attempt, packets]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">Loading your report...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            '& .MuiAlert-message': { fontSize: '1.1rem' }
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          size="large"
        >
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: 3,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          p: 2,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Tooltip title="Back">
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mr: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ flex: 1, fontWeight: 800, color: 'text.primary' }}>
          Performance Report
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<PrintIcon />} 
          onClick={() => window.print()}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
          }}
        >
          Export Report
        </Button>
      </Paper>

      {/* Main Header Card */}
      {template?.header?.enabled && (
        <Card sx={{ 
          mb: 4, 
          background: template.header.backgroundColor,
          color: template.header.textColor,
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}>
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {template.header.title || 'Assessment Report'}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              {template.header.subtitle || quiz?.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
              Generated on {formatDate(new Date().toISOString())}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* User Info Card */}
      {template?.userInfo?.enabled && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                {(user?.user_name || user?.email || 'U')[0].toUpperCase()}
              </Avatar>
              Assessment Details
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Participant
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {user?.user_name || user?.email || 'Anonymous'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Email
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {user?.email || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Assessment
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {quiz?.name || 'Untitled'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Completed
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {formatDate(attempt?.completed_at)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Custom Header Text */}
      {quiz?.report_header && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box 
              sx={{ 
                lineHeight: 1.8,
                fontSize: '1.1rem',
                color: 'text.primary',
                textAlign: 'left',
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  marginTop: '1rem',
                  textAlign: 'left'
                },
                '& h1': { fontSize: '1.5rem' },
                '& h2': { fontSize: '1.3rem' },
                '& h3': { fontSize: '1.2rem' },
                '& p': { marginBottom: '0.75rem', textAlign: 'left' },
                '& ul, & ol': { marginBottom: '0.75rem', paddingLeft: '1.5rem', textAlign: 'left' },
                '& li': { marginBottom: '0.25rem', textAlign: 'left' },
                '& strong': { fontWeight: 600 },
                '& em': { fontStyle: 'italic' },
                '& a': { color: 'primary.main', textDecoration: 'underline' },
                '& table': { 
                  textAlign: 'left',
                  width: '100%',
                  borderCollapse: 'collapse',
                  margin: '1rem 0',
                  border: '1px solid #e0e0e0'
                },
                '& th, & td': { 
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  verticalAlign: 'top'
                },
                '& th': {
                  backgroundColor: '#f5f5f5',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                },
                '& td': {
                  fontSize: '0.9rem'
                },
                '& tr:nth-of-type(even)': {
                  backgroundColor: '#fafafa'
                }
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{quiz.report_header}</ReactMarkdown>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Performance Overview */}
      {packetScores.length > 0 && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              Performance Overview
            </Typography>
            
            <Grid container spacing={4}>
              {/* Strengths */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon />
                      Top Strengths
                    </Typography>
                    <Stack spacing={2}>
                      {packetScores.sort((a, b) => b.rank - a.rank).slice(0, 2).map(s => (
                        <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: 'rgba(255, 255, 255, 0.2)', 
                            width: 40, 
                            height: 40,
                            fontSize: '20px'
                          }}>
                            {s.level?.icon || '⭐'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {s.name}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={s.level?.label || 'Level'} 
                              sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontWeight: 600
                              }} 
                            />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                  <Box sx={{ 
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    opacity: 0.1,
                    fontSize: '120px'
                  }}>
                    🏆
                  </Box>
                </Paper>
              </Grid>

              {/* Focus Areas */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    color: '#8b4513',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TargetIcon />
                      Focus Areas
                    </Typography>
                    <Stack spacing={2}>
                      {packetScores.sort((a, b) => a.rank - b.rank).slice(0, 2).map(s => (
                        <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: 'rgba(139, 69, 19, 0.2)', 
                            width: 40, 
                            height: 40,
                            fontSize: '20px',
                            color: '#8b4513'
                          }}>
                            {s.level?.icon || '🎯'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {s.name}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={s.level?.label || 'Level'} 
                              sx={{ 
                                backgroundColor: 'rgba(139, 69, 19, 0.2)',
                                color: '#8b4513',
                                fontWeight: 600
                              }} 
                            />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                  <Box sx={{ 
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    opacity: 0.1,
                    fontSize: '120px'
                  }}>
                    🎯
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Modern Charts Section */}
      {template?.charts?.enabled && packetScores.length > 0 && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              📊 Performance Visualization
            </Typography>
            
            <Grid container spacing={4}>
              {/* Overall Performance Rings - full width */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Overall Performance
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {packetScores.map(score => (
                      <Box key={score.id} sx={{ textAlign: 'center' }}>
                        <PerformanceRing level={score.level} />
                        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                          {score.name}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={score.level?.label} 
                          sx={{ 
                            mt: 0.5,
                            backgroundColor: score.level?.color,
                            color: 'white',
                            fontWeight: 600
                          }} 
                        />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
              {/* Radar Chart */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Packet Performance Radar
                  </Typography>
                  <RadarChart scores={packetScores} size={360} />
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Detailed Section Analysis */}
      {template?.sectionAnalysis?.enabled && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              🔍 Detailed Analysis
            </Typography>
            
            <Grid container spacing={3}>
              {packetScores.map(p => (
                <Grid item xs={12} md={6} key={p.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid #e5e7eb',
                      background: `linear-gradient(135deg, ${p.level?.lightColor || '#f8fafc'} 0%, #ffffff 100%)`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={p.level?.image && p.level.image.startsWith('data:image') ? p.level.image : undefined} sx={{
                        bgcolor: p.level?.color || '#6b7280',
                        width: 50,
                        height: 50,
                        mr: 2,
                        fontSize: '24px',
                        boxShadow: `0 4px 20px ${alpha(p.level?.color || '#6b7280', 0.3)}`
                      }}>
                        {p.level?.image && p.level.image.startsWith('data:image') ? '' : (p.level?.icon || '📘')}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {p.name}
                        </Typography>
                        <Chip
                          label={p.level?.label || 'Level'}
                          sx={{
                            backgroundColor: p.level?.color || '#6b7280',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Removed progress bar per request */}

                    {/* Insights Text */}
                    <Typography variant="body2" sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    }}>
                      {p.level?.largeText || 'No detailed description available for this level.'}
                    </Typography>

                    {/* Removed rank and levels per request */}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Achievement Summary */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1
        }} />
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            🏆 Achievement Summary
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '36px'
                }}>
                  🎯
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {packetScores.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Sections Completed
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '36px'
                }}>
                  ⭐
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {packetScores.filter(p => p.rank >= 3).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Strong Performances
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '36px'
                }}>
                  📈
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {Math.round(packetScores.reduce((acc, p) => acc + (p.rank / p.scaleLength), 0) / packetScores.length * 100)}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Overall Performance
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Custom Footer Text */}
      {quiz?.report_footer && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box 
              sx={{ 
                lineHeight: 1.8,
                fontSize: '1.1rem',
                color: 'text.primary',
                textAlign: 'left',
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  marginTop: '1rem',
                  textAlign: 'left'
                },
                '& h1': { fontSize: '1.5rem' },
                '& h2': { fontSize: '1.3rem' },
                '& h3': { fontSize: '1.2rem' },
                '& p': { marginBottom: '0.75rem', textAlign: 'left' },
                '& ul, & ol': { marginBottom: '0.75rem', paddingLeft: '1.5rem', textAlign: 'left' },
                '& li': { marginBottom: '0.25rem', textAlign: 'left' },
                '& strong': { fontWeight: 600 },
                '& em': { fontStyle: 'italic' },
                '& a': { color: 'primary.main', textDecoration: 'underline' },
                '& table': { 
                  textAlign: 'left',
                  width: '100%',
                  borderCollapse: 'collapse',
                  margin: '1rem 0',
                  border: '1px solid #e0e0e0'
                },
                '& th, & td': { 
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  verticalAlign: 'top'
                },
                '& th': {
                  backgroundColor: '#f5f5f5',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                },
                '& td': {
                  fontSize: '0.9rem'
                },
                '& tr:nth-of-type(even)': {
                  backgroundColor: '#fafafa'
                }
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{quiz.report_footer}</ReactMarkdown>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          textAlign: 'center',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Report generated on {formatDate(new Date().toISOString())} • 
          Keep up the excellent work and continue learning! 🚀
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReportViewer;