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
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
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
    title: 'Emotional Intelligence Report',
    subtitle: 'You can book a guidance session with our expert',
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
const PerformanceRing = ({ level, size = 150, marks = 0, totalMarks = 0 }) => {
  const circumference = 2 * Math.PI * 45;
  const percentage = totalMarks > 0 ? (marks / totalMarks) * 100 : 0;
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
        <Avatar src={level?.image && level.image.startsWith('data:image') ? level.image : '📊'} sx={{
                        bgcolor: level?.color || '#6b7280',
                        width: 30,
                        height: 30,
                        mr: 0,
                        fontSize: '24px',
                        boxShadow: `0 4px 20px ${alpha(level?.color || '#6b7280', 0.3)}`
                      }}></Avatar>
        <Typography variant="caption" sx={{ fontWeight: 700, color: level?.color }}>
          {marks || 0}/{totalMarks || 0}
        </Typography>
      </Box>
    </Box>
  );
};

// Radar (Spider) Chart Component
const RadarChart = ({ scores, size = 660 }) => {
  const theme = useTheme();
  const center = size / 2;
  const radius = Math.max(120, center - 80);  // Increased base radius for larger chart
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
      <svg width={660} height={360} viewBox={`0 0 ${size} ${size}`}>
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
  const [selectedPacketId, setSelectedPacketId] = useState('all');
  const isSpecialReport = useMemo(() => {
    const name = quiz?.name?.toLowerCase() || '';
    return (
      name.includes('happieq') || 
      name.includes('happi eq') ||
      name.includes('happiness quotient') ||
      name.includes('emotional intelligence assessment') ||
      name.includes('happilife') ||
      name.includes('happi assess ei') ||
      name.includes('personality')
    );
  }, [quiz]);

  const isShortAssessment = useMemo(() => {
    if (!quiz) return false;
    const quizName = quiz.name?.toLowerCase() || '';
    const packetNames = packets.map(p => p.name?.toLowerCase() || '');
    
    const themes = [
      'sleep', 'anger', 'body image', 'work life', 'bullying', 
      'natal', 'postpartum', 'stress', 'worry', 'conflict',
      'relationship', 'esteem', 'confidence', 'motivation', 
      'loss', 'loneliness', 'anxiety', 'happiness', 'satisfaction', 
      'trauma', 'emotion', 'low'
    ];
    
    const matchesQuiz = themes.some(theme => quizName.includes(theme));
    const matchesPackets = packetNames.some(pName => 
      themes.some(theme => pName.includes(theme))
    );
    
    return matchesQuiz || matchesPackets;
  }, [quiz, packets]);

  const showShortReportFeatures = useMemo(() => {
    return isShortAssessment && !isSpecialReport;
  }, [isShortAssessment, isSpecialReport]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError('');

        // Load quiz, attempts, packets, and template in parallel
        const [quizRes, attemptsRes, packetsRes, templateRes] = await Promise.all([
          fetch(`http://65.1.6.81:3001/api/quizzes/${quizId}`),
          fetch('http://65.1.6.81:3001/api/quiz-attempts'),
          fetch(`http://65.1.6.81:3001/api/quiz-packets/${quizId}`),
          fetch(`http://65.1.6.81:3001/api/pdf-templates/${quizId}`).catch(() => null)
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
            const userRes = await fetch(`http://65.1.6.81:3001/api/users/${foundAttempt.user_id}`);
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
    
    // Debug logging
    console.log('ReportViewer - Attempt packet_marks:', marksMap);
    console.log('ReportViewer - Packets:', packets);
    
    for (const packet of packets) {
      // Try multiple ways to find the packet marks
      // First try packet name as key
      let m = marksMap[packet.name];
      console.log(`Checking packet: ${packet.name} (${packet.id}) - Name match:`, m);
      
      // If not found, try packet ID as key
      if (!m && packet.id) {
        m = marksMap[packet.id];
        console.log(`Checking packet: ${packet.name} (${packet.id}) - ID match:`, m);
      }
      
      // If still not found, try to find by matching any key that contains the packet name
      if (!m) {
        const keys = Object.keys(marksMap);
        const matchingKey = keys.find(key => 
          key.toLowerCase().includes(packet.name.toLowerCase()) ||
          packet.name.toLowerCase().includes(key.toLowerCase())
        );
        if (matchingKey) {
          m = marksMap[matchingKey];
          console.log(`Checking packet: ${packet.name} (${packet.id}) - Fuzzy match (${matchingKey}):`, m);
        }
      }
      
      const marks = m?.marks || 0;
      let totalMarks = m?.total || 0;
      
      console.log(`Final marks for ${packet.name}: marks=${marks}, total=${totalMarks}`);
      
      // If totalMarks is 0, try to calculate it from packet data
      if (totalMarks === 0 && packet.questions && Array.isArray(packet.questions)) {
        totalMarks = packet.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      }
      
      // If still 0, try to get from packet's maxMarks or calculate from scoring scale
      if (totalMarks === 0 && packet.scoringScale && Array.isArray(packet.scoringScale)) {
        const maxRange = packet.scoringScale.reduce((max, range) => Math.max(max, range.max), 0);
        totalMarks = maxRange;
      }
      
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
        scaleLength: scale.length,
        marks: marks,
        totalMarks: totalMarks
      });
    }
    console.log('ReportViewer - Final scores:', scores);
    return scores;
  }, [attempt, packets]);

  const filteredPacketScores = useMemo(() => {
    if (selectedPacketId === 'all') return packetScores;
    return packetScores.filter(s => s.id === selectedPacketId);
  }, [packetScores, selectedPacketId]);

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
          onClick={() => navigate('/')}
          size="large"
        >
          Back to Dashboard
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
        <Tooltip title="Back to Dashboard">
          <IconButton 
            onClick={() => navigate('/')} 
            sx={{ 
              mr: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="https://happimynd.com/assets/Frontend/images/happimynd_logo.png"
            alt="HappiMynd Logo"
            style={{
              height: '80px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </Box>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={() => window.print()}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
          }}
        >
          Download Report
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
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, fontSize: '1.4rem' }}>
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
                textAlign: 'Justify',
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  marginTop: '1rem',
                  textAlign: 'left'
                },
                '& h1': { fontSize: '1.5rem' },
                '& h2': { fontSize: '1.3rem' },
                '& h3': { fontSize: '1.2rem' },
                '& p': { marginBottom: '0.75rem', textAlign: 'Justify' },
                '& ul, & ol': { marginBottom: '0.75rem', paddingLeft: '1.5rem', textAlign: 'Justify' },
                '& li': { marginBottom: '0.25rem', textAlign: 'Justify' },
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

      {/* Performance Overview - COMMENTED OUT */}
      {/* {packetScores.length > 0 && (
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
      )}*/}

      {/* Modern Charts Section */}
      {template?.charts?.enabled && packetScores.length > 0 && !isSpecialReport && !showShortReportFeatures && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                📊 Score Card
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>View Section</InputLabel>
                <Select
                  value={selectedPacketId}
                  label="View Section"
                  onChange={(e) => setSelectedPacketId(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Sections</MenuItem>
                  {packets.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Grid container spacing={4} style={{ justifyContent: 'center' }}>
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
                    Parameter Wise Scores
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {filteredPacketScores.map(score => (
                      <Box key={score.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {score.name}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={score.level?.label} 
                            sx={{ 
                              backgroundColor: score.level?.color,
                              color: 'white',
                              fontWeight: 700,
                              px: 1
                            }} 
                          />
                        </Box>
                        <Box sx={{ 
                          height: 12, 
                          width: '100%', 
                          bgcolor: alpha(score.level?.color || '#eee', 0.1), 
                          borderRadius: 6, 
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: alpha(score.level?.color || '#eee', 0.2)
                        }}>
                          <Box sx={{ 
                            height: '100%', 
                            width: `${Math.max(5, (score.marks / score.totalMarks) * 100)}%`, 
                            bgcolor: score.level?.color || '#ccc',
                            borderRadius: 6,
                            boxShadow: `0 0 10px ${alpha(score.level?.color || '#000', 0.3)}`
                          }} />
                        </Box>
                      </Box>
                    ))}
                    
                    {selectedPacketId === 'all' && filteredPacketScores.length > 1 && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #e5e7eb' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            Overall Performance
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {Math.round((packetScores.reduce((acc, p) => acc + p.marks, 0) / packetScores.reduce((acc, p) => acc + p.totalMarks, 0)) * 100)}%
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          height: 8, 
                          width: '100%', 
                          bgcolor: '#f1f5f9', 
                          borderRadius: 4, 
                          overflow: 'hidden' 
                        }}>
                          <Box sx={{ 
                            height: '100%', 
                            width: `${(packetScores.reduce((acc, p) => acc + p.marks, 0) / packetScores.reduce((acc, p) => acc + p.totalMarks, 0)) * 100}%`, 
                            bgcolor: 'primary.main',
                            borderRadius: 4
                          }} />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
              {/* Radar Chart */}
              {/*<Grid item xs={12}>
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
                  <Box sx={{ width: '100%', maxWidth: 660, mx: 'auto' }}>
                    <RadarChart scores={packetScores} size={360} />
                  </Box>
                </Paper>
              </Grid>*/}
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
              🔍 Analysis
            </Typography>
            
            <Grid container spacing={3}>
              {filteredPacketScores.map(p => (
                <Grid item xs={12} md={showShortReportFeatures && filteredPacketScores.length === 1 ? 12 : 6} key={p.id}>
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
                        {!showShortReportFeatures && (
                          <Chip
                            label={p.level?.label || 'Level'}
                            sx={{
                              backgroundColor: p.level?.color || '#6b7280',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {showShortReportFeatures && (
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ 
                          height: 32, 
                          width: '100%', 
                          bgcolor: alpha(p.level?.color || '#eee', 0.1), 
                          borderRadius: 2, 
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: alpha(p.level?.color || '#eee', 0.2),
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Box sx={{ 
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            height: '100%', 
                            width: `${Math.max(10, (p.marks / p.totalMarks) * 100)}%`, 
                            bgcolor: p.level?.color || '#ccc',
                            transition: 'width 1s ease-in-out',
                            boxShadow: `0 0 20px ${alpha(p.level?.color || '#000', 0.2)}`
                          }} />
                          <Typography variant="subtitle2" sx={{ 
                            position: 'relative', 
                            zIndex: 1, 
                            fontWeight: 800, 
                            color: (p.marks / p.totalMarks) > 0.4 ? 'white' : 'text.primary',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            textShadow: (p.marks / p.totalMarks) > 0.4 ? '0 1px 2px rgba(0,0,0,0.4)' : 'none'
                          }}>
                            {p.level?.label}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    {/* Removed progress bar per request */}

                    {/* Insights Text */}
                    <Typography variant="body2" sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      textAlign: 'justify'
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
      {/*<Card sx={{ 
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
                  {packetScores.reduce((acc, p) => acc + p.marks, 0)}/{packetScores.reduce((acc, p) => acc + p.totalMarks, 0)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Overall Performance
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>*/}

      {/* Custom Footer Text */}
      {quiz?.report_footer && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
                  textAlign: 'justify',
                  width: '100%',
                  borderCollapse: 'collapse',
                  margin: '1rem 0',
                  border: '1px solid #e0e0e0'
                },
                '& th, & td': { 
                  textAlign: 'justify',
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
                  fontSize: '0.8rem'
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

      {/* Next Steps Section */}
      {showShortReportFeatures && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              🎯 Next Steps
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'justify', lineHeight: 1.8, fontSize: '1.1rem' }}>
              Congratulations on completing your self assessment and going through the summary. Now that you know how you are doing on this aspect of life, we are sure you have gained a comprehensive understanding of what steps to be taken up next.
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, textAlign: 'justify', lineHeight: 1.8, fontSize: '1.1rem' }}>
              If you are keen on making the most out of your summary, an assisted session by our emotional wellbeing expert will
              guide you in minutely scrutinizing and interpreting your performance on this parameter, what implications the scores carry, and
              guiding you on the necessary next steps that can set you sailing on a holistic wellness journey.
            </Typography>

            <Typography variant="body1" sx={{ mb: 4, textAlign: 'justify', lineHeight: 1.8, fontSize: '1.1rem' }}>
              Once aware of your needs, you can choose from our unique range of accessible, actionable & transformative services available over a fully
              digital human assisted platform while ensuring utmost confidentiality. 
            </Typography>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', textAlign: 'left' }}>
              🤝 Support Services:
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { name: 'HappiGUIDE', desc: 'helps you to make the most out of your HappiLIFE summary with a summary reading session by our emotional wellbeing expert.' },
                { name: 'HappiLEARN', desc: 'is our online self-help library that enriches you with a 24*7 access to 5000+ minutes of curated, well researched content that includes video, audio, blogs and more.' },
                { name: 'HappiBUDDY', desc: 'allows you to connect with a professional expert buddy in a personal emotional log room that is non-judgemental, anonymous, and 100% confidential.' },
                { name: 'HappiSELF', desc: 'is our mobile Application that enables Self-management of emotional wellbeing with a globally validated, interactive program with Cognitive Behavior Therapy at its core.' },
                { name: 'HappiTALK', desc: 'offers you a safe space to discuss life, aspirations, personal issues, relationships and more with the best of our country’s experts from the comfort of your home.' }
              ].map((service) => (
                <Grid item xs={12} key={service.name}>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, textAlign: 'justify' }}>
                    <strong>{service.name}</strong> {service.desc}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left' }}>
                📞 Contact Details
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'left' }}>
                For further details you may contact us at <strong>info@happimynd.com</strong> or <strong>9110599581</strong> or visit our website at <a href="https://www.happimynd.com" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>www.happimynd.com</a> to explore more.
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', textAlign: 'left' }}>
              ⚠️ Disclaimer :
            </Typography>
            
            <Typography variant="caption" sx={{ display: 'block', mb: 2, textAlign: 'justify', lineHeight: 1.6, color: 'text.secondary' }}>
              <strong>A.</strong> If the services are availed by a person who belongs/works with a company/organization which are enrolled with the services for its employees or has a tie up with HappiMynd, the services/tools available to the users are subject to the following terms: 
              <br />1. The user can avail only those services which the affiliated company has subscribed/purchased for its employees. 
              <br />2. If the user is willing to avail services which are not covered/subscribed/purchased by the affiliated company, then the user can make an individual/personal purchase of the required services. 
              <br />3. The services available and their prices for an individual user can be found on the dashboard of the HappiMynd app or website itself.
            </Typography>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'justify', lineHeight: 1.6, color: 'text.secondary' }}>
              <strong>B.</strong> This summary can support you in discovering yourself, knowing the areas of improvement and living a holistic life. However, it is indicative and not a replacement for medical advice. The statements used in HappiLIFE awareness tool are inspired by ICD-10 (WHO) & DSM-5® guidelines. If you are having difficult thoughts or going through rough times, consider calling the below listed helpline numbers:
              <br />• National Emergency No. - 112 
              <br />• Women Helpline - 1091 
              <br />• Senior Citizen Helpline - 14567 
              <br />• Suicide Prevention - 9820466726 (AASRA)
            </Typography>
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