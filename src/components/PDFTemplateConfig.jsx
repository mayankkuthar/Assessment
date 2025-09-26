import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tab,
  Tabs,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  LinearProgress,
  Alert,
  Tooltip,
  Fab,
  Stack,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Badge,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Backdrop,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  History as HistoryIcon,
  Palette as PaletteIcon,
  Article as ArticleIcon,
  BarChart as BarChartIcon,
  Inventory as InventoryIcon,
  Reorder as ReorderIcon,
  Tune as TuneIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  RestartAlt as RestartAltIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const PDFTemplateConfig = () => {
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [availablePackets, setAvailablePackets] = useState([]);
  const [template, setTemplate] = useState({
    header: { 
      enabled: true, 
      backgroundColor: '#2563eb', 
      textColor: '#ffffff', 
      title: 'Assessment Report', 
      subtitle: 'Performance Analysis',
      showLogo: true,
      logoPosition: 'left',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '20px',
      margin: '0px',
      borderRadius: '8px',
      borderWidth: '0px',
      borderColor: 'transparent',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    userInfo: { 
      enabled: true, 
      order: 1, 
      backgroundColor: '#f8fafc', 
      borderColor: '#e5e7eb',
      showAvatar: true,
      showEmail: true,
      showProfile: true,
      showDate: true,
      fontSize: '14px',
      fontWeight: 'normal',
      textAlign: 'left',
      padding: '16px',
      margin: '16px 0px',
      borderRadius: '8px',
      borderWidth: '2px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    overallScore: { 
      enabled: true, 
      order: 2, 
      backgroundColor: '#f8fafc', 
      borderColor: '#e5e7eb',
      showPercentage: true,
      showGrade: true,
      showLevel: true,
      showTrend: true,
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '20px',
      margin: '16px 0px',
      borderRadius: '12px',
      borderWidth: '2px',
      shadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    charts: { 
      enabled: true, 
      order: 3, 
      backgroundColor: '#ffffff', 
      borderColor: '#e5e7eb', 
      layout: 'grid', 
      gridColumns: 2,
      showBarChart: true,
      showPieChart: true,
      showGaugeChart: true,
      showRadarChart: true,
      chartHeight: '300px',
      chartWidth: '100%',
      fontSize: '14px',
      fontWeight: 'normal',
      textAlign: 'center',
      padding: '20px',
      margin: '16px 0px',
      borderRadius: '8px',
      borderWidth: '1px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    sectionAnalysis: { 
      enabled: true, 
      order: 4, 
      backgroundColor: '#ffffff', 
      borderColor: '#e5e7eb',
      showPacketScores: true,
      showQuestionBreakdown: true,
      showTimeAnalysis: true,
      showDifficultyLevels: true,
      fontSize: '14px',
      fontWeight: 'normal',
      textAlign: 'left',
      padding: '20px',
      margin: '16px 0px',
      borderRadius: '8px',
      borderWidth: '1px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    performanceInsights: { 
      enabled: true, 
      order: 5, 
      backgroundColor: '#f0f9ff', 
      borderColor: '#0ea5e9',
      showStrengths: true,
      showWeaknesses: true,
      showImprovements: true,
      showComparisons: true,
      fontSize: '14px',
      fontWeight: 'medium',
      textAlign: 'left',
      padding: '20px',
      margin: '16px 0px',
      borderRadius: '8px',
      borderWidth: '2px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    recommendations: { 
      enabled: true, 
      order: 6, 
      backgroundColor: '#fef3c7', 
      borderColor: '#f59e0b',
      showActionItems: true,
      showResources: true,
      showTimeline: true,
      showPriority: true,
      fontSize: '14px',
      fontWeight: 'medium',
      textAlign: 'left',
      padding: '20px',
      margin: '16px 0px',
      borderRadius: '8px',
      borderWidth: '2px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    footer: { 
      enabled: true, 
      order: 7, 
      backgroundColor: '#f8fafc', 
      borderColor: '#e5e7eb',
      showTimestamp: true,
      showPageNumbers: true,
      showCompanyInfo: true,
      showContactInfo: true,
      fontSize: '12px',
      fontWeight: 'normal',
      textAlign: 'center',
      padding: '16px',
      margin: '16px 0px',
      borderRadius: '8px',
      borderWidth: '1px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    page: { 
      size: 'A4', 
      orientation: 'portrait', 
      backgroundColor: '#ffffff',
      margin: '20mm',
      showPageNumbers: true,
      showWatermark: false,
      watermarkText: 'Assessment Report',
      watermarkOpacity: '0.1'
    },
    typography: { 
      primaryFont: 'Helvetica', 
      secondaryFont: 'Arial',
      headingFontSize: '24px',
      subheadingFontSize: '18px',
      bodyFontSize: '14px',
      captionFontSize: '12px',
      lineHeight: '1.5',
      letterSpacing: '0.5px'
    },
    colors: { 
      primary: '#2563eb', 
      secondary: '#6b7280', 
      success: '#10b981', 
      warning: '#f59e0b', 
      danger: '#ef4444',
      info: '#06b6d4',
      light: '#f8fafc',
      dark: '#1f2937'
    },
    packets: {
      showIndividualScores: true,
      showQuestionDetails: true,
      showTimeSpent: true,
      showDifficultyAnalysis: true,
      showPerformanceTrends: true,
      showComparativeAnalysis: true,
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      fontSize: '14px',
      fontWeight: 'normal',
      textAlign: 'left',
      padding: '16px',
      margin: '8px 0px',
      borderRadius: '6px',
      borderWidth: '1px',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      alternateRowColors: true,
      rowBackgroundColor: '#f8fafc',
      rowAlternateBackgroundColor: '#ffffff'
    },
    packetConfigs: {
      // Dynamic packet-specific configurations will be stored here
      // Format: { packetId: { enabled: true, order: 1, customSettings: {...} } }
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [templateHistory, setTemplateHistory] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Auto-save functionality with debouncing
  const autoSaveTemplate = useCallback(async () => {
    if (!selectedQuiz || !hasUnsavedChanges) {
      console.log('🔄 Auto-save skipped:', { selectedQuiz, hasUnsavedChanges });
      return;
    }

    console.log('🚀 Starting auto-save for quiz:', selectedQuiz);
    console.log('📋 Template data to save:', {
      hasPacketConfigs: !!(template && template.packetConfigs),
      packetConfigsCount: template && template.packetConfigs ? Object.keys(template.packetConfigs).length : 0,
      packetIds: template && template.packetConfigs ? Object.keys(template.packetConfigs) : [],
      templateKeys: Object.keys(template || {})
    });

    setIsAutoSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/pdf-templates/${selectedQuiz}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        console.log('✅ Template auto-saved successfully for quiz:', selectedQuiz);
        console.log('📁 Saved template data:', JSON.stringify(template, null, 2));
      } else {
        console.error('❌ Auto-save failed with status:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Auto-save error:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [selectedQuiz, template, hasUnsavedChanges]);

  // Debounced auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && selectedQuiz) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save (2 seconds after last change)
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveTemplate();
      }, 2000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, selectedQuiz, autoSaveTemplate]);

  const loadQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/quizzes');
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const loadQuizPackets = async (quizId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/quiz-packets/${quizId}`);
      const packets = await response.json();
      setAvailablePackets(packets);
      
      // Initialize packet configurations if they don't exist
      const newTemplate = { ...template };
      if (!newTemplate.packetConfigs) {
        newTemplate.packetConfigs = {};
      }
      
      // Add default configurations for new packets
      packets.forEach((packet, index) => {
        if (!newTemplate.packetConfigs[packet.id]) {
          newTemplate.packetConfigs[packet.id] = {
            enabled: true,
            order: index + 1,
            title: packet.name,
            description: packet.description || '',
            showHeader: true,
            showScoreBreakdown: true,
            showQuestionList: true,
            showPerformanceLevel: true,
            showRecommendations: true,
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            headerBackgroundColor: '#f8fafc',
            headerTextColor: '#374151',
            scoreColor: '#10b981',
            fontSize: '14px',
            fontWeight: 'normal',
            textAlign: 'left',
            padding: '20px',
            margin: '16px 0px',
            borderRadius: '8px',
            borderWidth: '1px',
            shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            chartType: 'bar', // bar, pie, gauge, radar
            chartColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            customIcon: '',
            customLabel: '',
            // Custom Scoring Scale Display Options
            showScalingLevel: true,
            showScalingLabel: true,
            showScalingImage: true,
            showScalingText: true,
            showScalingColors: true,
            showScalingRange: false,
            // Scoring Scale Representation Options
            imageDisplayStyle: 'icon', // icon, medium, large, banner
            textDisplayPosition: 'below', // above, below, inline, separate
            levelIndicatorStyle: 'badge', // badge, highlight, border, background
            scaleProgressStyle: 'none', // none, linear, circular, dots, steps
            // Advanced Scoring Scale Options
            showAllScaleLevels: false,
            highlightCurrentLevel: true,
            showScaleComparison: false,
            showImprovementSuggestions: true
          };
        }
      });
      
      setTemplate(newTemplate);
    } catch (error) {
      console.error('Error loading quiz packets:', error);
    }
  };

  const handleQuizChange = (quizId) => {
    setSelectedQuiz(quizId);
    if (quizId) {
      loadTemplate(quizId);
      loadQuizPackets(quizId);
    } else {
      setAvailablePackets([]);
    }
  };

    const loadTemplate = async (quizId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/pdf-templates/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔄 Loading template for quiz:', quizId, data);
        
        // The API returns { template: {...} }, so we need to extract the template
        if (data.template) {
          setTemplate(data.template);
          setHasUnsavedChanges(false); // Reset unsaved changes flag when loading
          console.log('✅ Template loaded successfully');
        } else {
          console.log('ℹ️ No template found in response, keeping current template');
        }
      } else {
        console.log('ℹ️ No saved template found for quiz:', quizId);
      }
    } catch (error) {
      console.error('❌ Error loading template:', error);
    }
  };

  const saveTemplate = async () => {
    if (!selectedQuiz) {
      alert('Please select a quiz first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/pdf-templates/${selectedQuiz}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        // Save to version history
        const newVersion = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          template: { ...template },
          version: currentVersion + 1
        };
        setTemplateHistory(prev => [newVersion, ...prev.slice(0, 9)]); // Keep last 10 versions
        setCurrentVersion(prev => prev + 1);
        setHasUnsavedChanges(false); // Reset unsaved changes flag after successful save
        
        alert('Template saved successfully!');
      } else {
        alert('Error saving template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplateVersion = () => {
    if (!selectedQuiz) {
      alert('Please select a quiz first');
      return;
    }
    
    const newVersion = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      template: { ...template },
      version: currentVersion + 1,
      name: `Version ${currentVersion + 1} - ${new Date().toLocaleString()}`
    };
    
    setTemplateHistory(prev => [newVersion, ...prev.slice(0, 9)]);
    setCurrentVersion(prev => prev + 1);
    
    // Save to localStorage for persistence
    localStorage.setItem(`template-history-${selectedQuiz}`, JSON.stringify([newVersion, ...templateHistory.slice(0, 9)]));
    
    alert('Template version saved!');
  };

  const restoreTemplateVersion = (version) => {
    if (confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
      setTemplate(version.template);
      alert('Template restored successfully!');
    }
  };

  const applyPreset = (presetType) => {
    const presets = {
      professional: {
        header: { ...template.header, backgroundColor: '#1e40af', textColor: '#ffffff' },
        colors: { ...template.colors, primary: '#1e40af', secondary: '#475569' },
        typography: { ...template.typography, primaryFont: 'Helvetica', secondaryFont: 'Arial' }
      },
      creative: {
        header: { ...template.header, backgroundColor: '#7c3aed', textColor: '#ffffff' },
        colors: { ...template.colors, primary: '#7c3aed', secondary: '#ec4899' },
        typography: { ...template.typography, primaryFont: 'Georgia', secondaryFont: 'Verdana' }
      },
      minimal: {
        header: { ...template.header, backgroundColor: '#8fafc', textColor: '#1f2937' },
        colors: { ...template.colors, primary: '#6b7280', secondary: '#9ca3af' },
        typography: { ...template.typography, primaryFont: 'Inter', secondaryFont: 'System' }
      },
      academic: {
        header: { ...template.header, backgroundColor: '#059669', textColor: '#ffffff' },
        colors: { ...template.colors, primary: '#059669', secondary: '#047857' },
        typography: { ...template.typography, primaryFont: 'Times New Roman', secondaryFont: 'Georgia' }
      }
    };

    if (confirm(`Apply ${presetType} preset? This will update your current template.`)) {
      setTemplate(prev => ({ ...prev, ...presets[presetType] }));
      alert(`${presetType.charAt(0).toUpperCase() + presetType.slice(1)} preset applied successfully!`);
    }
  };

  const validateTemplate = () => {
    const issues = [];
    
    // Check for required fields
    if (!template.header.title.trim()) {
      issues.push('Header title is required');
    }
    
    // Check for valid colors
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(template.header.backgroundColor)) {
      issues.push('Header background color must be a valid hex color');
    }
    
    // Check for valid font sizes
    const sizeRegex = /^\d+px$/;
    if (!sizeRegex.test(template.typography.headingFontSize)) {
      issues.push('Heading font size must be in pixels (e.g., 24px)');
    }
    
    // Check for reasonable values
    if (parseInt(template.page.margin) > 50) {
      issues.push('Page margin seems too large (max 50mm recommended)');
    }
    
    if (issues.length === 0) {
      alert('✅ Template validation passed! All settings look good.');
    } else {
      alert(`⚠️ Template validation found ${issues.length} issue(s):\n\n${issues.join('\n')}`);
    }
  };

  const compareTemplates = () => {
    const storedTemplate = localStorage.getItem('last-imported-template');
    if (!storedTemplate) {
      alert('No template to compare with. Please import a template first.');
      return;
    }
    
    try {
      const importedTemplate = JSON.parse(storedTemplate);
      const differences = [];
      
      // Compare key sections
      Object.keys(template).forEach(key => {
        if (typeof template[key] === 'object' && template[key] !== null) {
          Object.keys(template[key]).forEach(subKey => {
            if (template[key][subKey] !== importedTemplate[key]?.[subKey]) {
              differences.push(`${key}.${subKey}: "${template[key][subKey]}" → "${importedTemplate[key]?.[subKey]}"`);
            }
          });
        } else if (template[key] !== importedTemplate[key]) {
          differences.push(`${key}: "${template[key]}" → "${importedTemplate[key]}"`);
        }
      });
      
      if (differences.length === 0) {
        alert('✅ Templates are identical!');
      } else {
        alert(`🔄 Found ${differences.length} differences:\n\n${differences.slice(0, 10).join('\n')}${differences.length > 10 ? '\n...and more' : ''}`);
      }
    } catch (error) {
      alert('Error comparing templates. Please try importing again.');
    }
  };

  const updateTemplate = (path, value) => {
    const newTemplate = { ...template };
    const keys = path.split('.');
    let current = newTemplate;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setTemplate(newTemplate);
    setHasUnsavedChanges(true);
  };

  // Packet-specific configuration functions
  const updatePacketConfig = (packetId, path, value) => {
    const newTemplate = { ...template };
    if (!newTemplate.packetConfigs[packetId]) {
      return;
    }
    
    const keys = path.split('.');
    let current = newTemplate.packetConfigs[packetId];
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setTemplate(newTemplate);
    setHasUnsavedChanges(true);
  };

  const movePacket = (packetId, direction) => {
    console.log('🔄 movePacket called:', { packetId, direction });
    
    // Use the same sorting logic as the display - include all packets that have configs
    const sortedPackets = availablePackets
      .filter(packet => template.packetConfigs?.[packet.id])
      .sort((a, b) => (template.packetConfigs[a.id]?.order || 0) - (template.packetConfigs[b.id]?.order || 0));
    
    console.log('📋 Current sorted packets:', sortedPackets.map(p => ({ id: p.id, name: p.name, order: template.packetConfigs[p.id]?.order })));
    
    const currentIndex = sortedPackets.findIndex(packet => packet.id === packetId);
    console.log('📍 Current index:', currentIndex);
    
    if (direction === 'up' && currentIndex > 0) {
      const newTemplate = { ...template };
      const currentPacket = sortedPackets[currentIndex];
      const previousPacket = sortedPackets[currentIndex - 1];
      
      console.log('⬆️ Moving up:', { 
        current: { id: currentPacket.id, order: newTemplate.packetConfigs[currentPacket.id].order },
        previous: { id: previousPacket.id, order: newTemplate.packetConfigs[previousPacket.id].order }
      });
      
      // Swap the order values
      const temp = newTemplate.packetConfigs[currentPacket.id].order;
      newTemplate.packetConfigs[currentPacket.id].order = newTemplate.packetConfigs[previousPacket.id].order;
      newTemplate.packetConfigs[previousPacket.id].order = temp;
      
      console.log('✅ After swap:', { 
        current: { id: currentPacket.id, order: newTemplate.packetConfigs[currentPacket.id].order },
        previous: { id: previousPacket.id, order: newTemplate.packetConfigs[previousPacket.id].order }
      });
      
      setTemplate(newTemplate);
      setHasUnsavedChanges(true);
      console.log('🔄 Template updated and marked as unsaved');
    } else if (direction === 'down' && currentIndex < sortedPackets.length - 1) {
      const newTemplate = { ...template };
      const currentPacket = sortedPackets[currentIndex];
      const nextPacket = sortedPackets[currentIndex + 1];
      
      console.log('⬇️ Moving down:', { 
        current: { id: currentPacket.id, order: newTemplate.packetConfigs[currentPacket.id].order },
        next: { id: nextPacket.id, order: newTemplate.packetConfigs[nextPacket.id].order }
      });
      
      // Swap the order values
      const temp = newTemplate.packetConfigs[currentPacket.id].order;
      newTemplate.packetConfigs[currentPacket.id].order = newTemplate.packetConfigs[nextPacket.id].order;
      newTemplate.packetConfigs[nextPacket.id].order = temp;
      
      console.log('✅ After swap:', { 
        current: { id: currentPacket.id, order: newTemplate.packetConfigs[currentPacket.id].order },
        next: { id: nextPacket.id, order: newTemplate.packetConfigs[nextPacket.id].order }
      });
      
      setTemplate(newTemplate);
      setHasUnsavedChanges(true);
      console.log('🔄 Template updated and marked as unsaved');
    } else {
      console.log('❌ Move not possible:', { direction, currentIndex, totalPackets: sortedPackets.length });
    }
  };

  const togglePacketVisibility = (packetId) => {
    const newTemplate = { ...template };
    if (newTemplate.packetConfigs[packetId]) {
      newTemplate.packetConfigs[packetId].enabled = !newTemplate.packetConfigs[packetId].enabled;
      setTemplate(newTemplate);
      setHasUnsavedChanges(true);
    }
  };

  const resetPacketOrder = () => {
    if (confirm('Are you sure you want to reset the packet order to default?')) {
      const newTemplate = { ...template };
      availablePackets.forEach((packet, index) => {
        if (newTemplate.packetConfigs[packet.id]) {
          newTemplate.packetConfigs[packet.id].order = index + 1;
          newTemplate.packetConfigs[packet.id].enabled = true;
        }
      });
      setTemplate(newTemplate);
      alert('Packet order reset to default!');
    }
  };

  // Section ordering functions
  const moveSection = (currentIndex, direction) => {
    const sections = ['userInfo', 'overallScore', 'charts', 'sectionAnalysis', 'performanceInsights', 'recommendations', 'footer'];
    const enabledSections = sections.filter(section => template[section]?.enabled !== false);
    
    if (direction === 'up' && currentIndex > 0) {
      const newTemplate = { ...template };
      const temp = newTemplate[enabledSections[currentIndex]].order;
      newTemplate[enabledSections[currentIndex]].order = newTemplate[enabledSections[currentIndex - 1]].order;
      newTemplate[enabledSections[currentIndex - 1]].order = temp;
      setTemplate(newTemplate);
    } else if (direction === 'down' && currentIndex < enabledSections.length - 1) {
      const newTemplate = { ...template };
      const temp = newTemplate[enabledSections[currentIndex]].order;
      newTemplate[enabledSections[currentIndex]].order = newTemplate[enabledSections[currentIndex + 1]].order;
      newTemplate[enabledSections[currentIndex + 1]].order = temp;
      setTemplate(newTemplate);
    }
  };

  const toggleSectionVisibility = (section) => {
    const newTemplate = { ...template };
    if (newTemplate[section]) {
      newTemplate[section].enabled = !newTemplate[section].enabled;
      setTemplate(newTemplate);
    }
  };

  const resetSectionOrder = () => {
    if (confirm('Are you sure you want to reset the section order to default?')) {
      const newTemplate = { ...template };
      const sections = ['userInfo', 'overallScore', 'charts', 'sectionAnalysis', 'performanceInsights', 'recommendations', 'footer'];
      sections.forEach((section, index) => {
        if (newTemplate[section]) {
          newTemplate[section].order = index + 1;
          newTemplate[section].enabled = true;
        }
      });
      setTemplate(newTemplate);
      alert('Section order reset to default!');
    }
  };

  const renderGeneralSettings = () => (
    <Stack spacing={3}>
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'visible' }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><SettingsIcon /></Avatar>}
          title="Page Settings"
          subheader="Configure page layout and appearance"
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="page-size-label">Page Size</InputLabel>
                <Select
                  labelId="page-size-label"
                  value={template.page.size}
                  label="Page Size"
                  onChange={(e) => updateTemplate('page.size', e.target.value)}
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="A3">A3</MenuItem>
                  <MenuItem value="Letter">Letter</MenuItem>
                  <MenuItem value="Legal">Legal</MenuItem>
                  <MenuItem value="Tabloid">Tabloid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="orientation-label">Orientation</InputLabel>
                <Select
                  labelId="orientation-label"
                  value={template.page.orientation}
                  label="Orientation"
                  onChange={(e) => updateTemplate('page.orientation', e.target.value)}
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Landscape</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Margin"
                value={template.page.margin}
                onChange={(e) => updateTemplate('page.margin', e.target.value)}
                placeholder="20mm"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Background Color
                </Typography>
                <TextField
                  type="color"
                  value={template.page.backgroundColor}
                  onChange={(e) => updateTemplate('page.backgroundColor', e.target.value)}
                  sx={{ '& input': { height: 56, cursor: 'pointer' } }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={template.page.showPageNumbers}
                    onChange={(e) => updateTemplate('page.showPageNumbers', e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Page Numbers"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={template.page.showWatermark}
                    onChange={(e) => updateTemplate('page.showWatermark', e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Watermark"
              />
            </Grid>
            {template.page.showWatermark && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Watermark Text"
                    value={template.page.watermarkText}
                    onChange={(e) => updateTemplate('page.watermarkText', e.target.value)}
                    placeholder="Assessment Report"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Watermark Opacity: {template.page.watermarkOpacity}
                    </Typography>
                    <Slider
                      value={parseFloat(template.page.watermarkOpacity) || 0.1}
                      onChange={(e, value) => updateTemplate('page.watermarkOpacity', value.toString())}
                      min={0}
                      max={1}
                      step={0.1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: 'success.main' }}><ArticleIcon /></Avatar>}
          title="Typography"
          subheader="Configure fonts and text styling"
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="primary-font-label">Primary Font</InputLabel>
                <Select
                  labelId="primary-font-label"
                  value={template.typography.primaryFont}
                  label="Primary Font"
                  onChange={(e) => updateTemplate('typography.primaryFont', e.target.value)}
                >
                  <MenuItem value="Helvetica">Helvetica</MenuItem>
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="secondary-font-label">Secondary Font</InputLabel>
                <Select
                  labelId="secondary-font-label"
                  value={template.typography.secondaryFont}
                  label="Secondary Font"
                  onChange={(e) => updateTemplate('typography.secondaryFont', e.target.value)}
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Helvetica">Helvetica</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Heading Font Size"
                value={template.typography.headingFontSize}
                onChange={(e) => updateTemplate('typography.headingFontSize', e.target.value)}
                placeholder="24px"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subheading Font Size"
                value={template.typography.subheadingFontSize}
                onChange={(e) => updateTemplate('typography.subheadingFontSize', e.target.value)}
                placeholder="18px"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Body Font Size"
                value={template.typography.bodyFontSize}
                onChange={(e) => updateTemplate('typography.bodyFontSize', e.target.value)}
                placeholder="14px"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Caption Font Size"
                value={template.typography.captionFontSize}
                onChange={(e) => updateTemplate('typography.captionFontSize', e.target.value)}
                placeholder="12px"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Line Height"
                value={template.typography.lineHeight}
                onChange={(e) => updateTemplate('typography.lineHeight', e.target.value)}
                placeholder="1.5"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Letter Spacing"
                value={template.typography.letterSpacing}
                onChange={(e) => updateTemplate('typography.letterSpacing', e.target.value)}
                placeholder="0.5px"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderHeaderSettings = () => (
    <Stack spacing={3}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><ArticleIcon /></Avatar>}
          title="Header Configuration"
          subheader="Customize your PDF report header"
          action={
            <FormControlLabel
              control={
                <Switch
                  checked={template.header.enabled}
                  onChange={(e) => updateTemplate('header.enabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Header"
            />
          }
          sx={{ pb: 1 }}
        />
        
        {template.header.enabled && (
          <CardContent>
            <Grid container spacing={3}>
              {/* Content Settings */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                  📝 Content Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Header Title"
                  value={template.header.title}
                  onChange={(e) => updateTemplate('header.title', e.target.value)}
                  placeholder="Enter header title..."
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Header Subtitle"
                  value={template.header.subtitle}
                  onChange={(e) => updateTemplate('header.subtitle', e.target.value)}
                  placeholder="Enter header subtitle..."
                  variant="outlined"
                />
              </Grid>

              {/* Logo Settings */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'secondary.main' }}>
                  🖼️ Logo Settings
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={template.header.showLogo}
                      onChange={(e) => updateTemplate('header.showLogo', e.target.checked)}
                      color="secondary"
                    />
                  }
                  label="Show Logo"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Logo Position</InputLabel>
                  <Select
                    value={template.header.logoPosition}
                    label="Logo Position"
                    onChange={(e) => updateTemplate('header.logoPosition', e.target.value)}
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Color Settings */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'info.main' }}>
                  🎨 Color Settings
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Background Color
                  </Typography>
                  <TextField
                    type="color"
                    value={template.header.backgroundColor}
                    onChange={(e) => updateTemplate('header.backgroundColor', e.target.value)}
                    sx={{ '& input': { height: 56, cursor: 'pointer' } }}
                    fullWidth
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Text Color
                  </Typography>
                  <TextField
                    type="color"
                    value={template.header.textColor}
                    onChange={(e) => updateTemplate('header.textColor', e.target.value)}
                    sx={{ '& input': { height: 56, cursor: 'pointer' } }}
                    fullWidth
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Border Color
                  </Typography>
                  <TextField
                    type="color"
                    value={template.header.borderColor}
                    onChange={(e) => updateTemplate('header.borderColor', e.target.value)}
                    sx={{ '& input': { height: 56, cursor: 'pointer' } }}
                    fullWidth
                  />
                </Box>
              </Grid>

              {/* Typography Settings */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'warning.main' }}>
                  ✍️ Typography Settings
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Font Size"
                  value={template.header.fontSize}
                  onChange={(e) => updateTemplate('header.fontSize', e.target.value)}
                  placeholder="24px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Font Weight</InputLabel>
                  <Select
                    value={template.header.fontWeight}
                    label="Font Weight"
                    onChange={(e) => updateTemplate('header.fontWeight', e.target.value)}
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="bold">Bold</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="light">Light</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Text Alignment</InputLabel>
                  <Select
                    value={template.header.textAlign}
                    label="Text Alignment"
                    onChange={(e) => updateTemplate('header.textAlign', e.target.value)}
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Layout Settings */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
                  📐 Layout Settings
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Padding"
                  value={template.header.padding}
                  onChange={(e) => updateTemplate('header.padding', e.target.value)}
                  placeholder="20px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Margin"
                  value={template.header.margin}
                  onChange={(e) => updateTemplate('header.margin', e.target.value)}
                  placeholder="0px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Border Radius"
                  value={template.header.borderRadius}
                  onChange={(e) => updateTemplate('header.borderRadius', e.target.value)}
                  placeholder="8px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Border Width"
                  value={template.header.borderWidth}
                  onChange={(e) => updateTemplate('header.borderWidth', e.target.value)}
                  placeholder="0px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Shadow"
                  value={template.header.shadow}
                  onChange={(e) => updateTemplate('header.shadow', e.target.value)}
                  placeholder="0 4px 6px rgba(0,0,0,0.1)"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Stack>
  );

  const renderChartsSettings = () => (
    <Stack spacing={3}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><BarChartIcon /></Avatar>}
          title="Charts Configuration"
          subheader="Customize charts and data visualization"
          action={
            <FormControlLabel
              control={
                <Switch
                  checked={template.charts.enabled}
                  onChange={(e) => updateTemplate('charts.enabled', e.target.checked)}
                  color="warning"
                />
              }
              label="Enable Charts"
            />
          }
          sx={{ pb: 1 }}
        />
        
        {template.charts.enabled && (
          <CardContent>
            <Grid container spacing={3}>
              {/* Layout Settings */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'warning.main' }}>
                  📊 Layout Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Layout Type</InputLabel>
                  <Select
                    value={template.charts.layout}
                    label="Layout Type"
                    onChange={(e) => updateTemplate('charts.layout', e.target.value)}
                  >
                    <MenuItem value="grid">Grid Layout</MenuItem>
                    <MenuItem value="horizontal">Horizontal Layout</MenuItem>
                    <MenuItem value="vertical">Vertical Layout</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Grid Columns"
                  type="number"
                  inputProps={{ min: 1, max: 4 }}
                  value={template.charts.gridColumns}
                  onChange={(e) => updateTemplate('charts.gridColumns', parseInt(e.target.value))}
                  variant="outlined"
                />
              </Grid>

              {/* Chart Dimensions */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'info.main' }}>
                  📏 Chart Dimensions
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Chart Height"
                  value={template.charts.chartHeight}
                  onChange={(e) => updateTemplate('charts.chartHeight', e.target.value)}
                  placeholder="300px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Chart Width"
                  value={template.charts.chartWidth}
                  onChange={(e) => updateTemplate('charts.chartWidth', e.target.value)}
                  placeholder="100%"
                  variant="outlined"
                />
              </Grid>

              {/* Typography Settings */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'secondary.main' }}>
                  ✍️ Typography Settings
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Font Size"
                  value={template.charts.fontSize}
                  onChange={(e) => updateTemplate('charts.fontSize', e.target.value)}
                  placeholder="14px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Font Weight</InputLabel>
                  <Select
                    value={template.charts.fontWeight}
                    label="Font Weight"
                    onChange={(e) => updateTemplate('charts.fontWeight', e.target.value)}
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="bold">Bold</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="light">Light</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Text Alignment</InputLabel>
                  <Select
                    value={template.charts.textAlign}
                    label="Text Alignment"
                    onChange={(e) => updateTemplate('charts.textAlign', e.target.value)}
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Spacing & Layout */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
                  📐 Spacing & Layout
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Padding"
                  value={template.charts.padding}
                  onChange={(e) => updateTemplate('charts.padding', e.target.value)}
                  placeholder="20px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Margin"
                  value={template.charts.margin}
                  onChange={(e) => updateTemplate('charts.margin', e.target.value)}
                  placeholder="16px 0px"
                  variant="outlined"
                />
              </Grid>

              {/* Border & Effects */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'error.main' }}>
                  🎨 Border & Effects
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Border Radius"
                  value={template.charts.borderRadius}
                  onChange={(e) => updateTemplate('charts.borderRadius', e.target.value)}
                  placeholder="8px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Border Width"
                  value={template.charts.borderWidth}
                  onChange={(e) => updateTemplate('charts.borderWidth', e.target.value)}
                  placeholder="1px"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Shadow"
                  value={template.charts.shadow}
                  onChange={(e) => updateTemplate('charts.shadow', e.target.value)}
                  placeholder="0 2px 4px rgba(0,0,0,0.05)"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Stack>
  );

  const renderPacketSettings = () => {
    if (!selectedQuiz || availablePackets.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="h2" sx={{ mb: 2 }}>📦</Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>No Packets Available</Typography>
          <Typography variant="body2" color="text.disabled">
            {!selectedQuiz ? 'Select a quiz to configure packet settings' : 'This quiz has no packets assigned'}
          </Typography>
        </Box>
      );
    }

    const sortedPackets = availablePackets
      .filter(packet => template.packetConfigs?.[packet.id])
      .sort((a, b) => (template.packetConfigs[a.id]?.order || 0) - (template.packetConfigs[b.id]?.order || 0));

    return (
      <Stack spacing={3}>
        {/* Global Packet Settings */}
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'info.main' }}><InventoryIcon /></Avatar>}
            title="Global Packet Settings"
            subheader="Settings that apply to all packets"
            sx={{ pb: 1 }}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={template.packets.showIndividualScores}
                      onChange={(e) => updateTemplate('packets.showIndividualScores', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show Individual Scores"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={template.packets.showQuestionDetails}
                      onChange={(e) => updateTemplate('packets.showQuestionDetails', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show Question Details"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={template.packets.showTimeSpent}
                      onChange={(e) => updateTemplate('packets.showTimeSpent', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show Time Spent"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={template.packets.alternateRowColors}
                      onChange={(e) => updateTemplate('packets.alternateRowColors', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Alternate Row Colors"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Individual Packet Configurations */}
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><ReorderIcon /></Avatar>}
            title="Individual Packet Configurations"
            subheader={`Configure each of the ${availablePackets.length} packets individually`}
            action={
              <Button
                variant="outlined"
                size="small"
                onClick={resetPacketOrder}
                startIcon={<RestartAltIcon />}
              >
                Reset Order
              </Button>
            }
            sx={{ pb: 1 }}
          />
          <CardContent>
            <Stack spacing={2}>
              {sortedPackets.map((packet, index) => (
                <Accordion key={packet.id} elevation={2}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          width: 32, 
                          height: 32,
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {packet.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {packet.description || 'No description'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={template.packetConfigs[packet.id]?.enabled ? 'Enabled' : 'Disabled'}
                          color={template.packetConfigs[packet.id]?.enabled ? 'success' : 'error'}
                          size="small"
                        />
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            movePacket(packet.id, 'up');
                          }}
                          disabled={index === 0}
                          size="small"
                        >
                          <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            movePacket(packet.id, 'down');
                          }}
                          disabled={index === sortedPackets.length - 1}
                          size="small"
                        >
                          <ArrowDownwardIcon />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePacketVisibility(packet.id);
                          }}
                          size="small"
                        >
                          {template.packetConfigs[packet.id]?.enabled ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* Display Settings */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Display Settings
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Custom Title"
                          value={template.packetConfigs[packet.id]?.title || ''}
                          onChange={(e) => updatePacketConfig(packet.id, 'title', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Custom Label"
                          value={template.packetConfigs[packet.id]?.customLabel || ''}
                          onChange={(e) => updatePacketConfig(packet.id, 'customLabel', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showHeader || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showHeader', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Header"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showScoreBreakdown || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showScoreBreakdown', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Score Breakdown"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showQuestionList || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showQuestionList', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Question List"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showRecommendations || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showRecommendations', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Recommendations"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          📊 Custom Scoring Scale Display
                        </Typography>
                      </Grid>

                      {/* Scoring Scale Display Options */}
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showScalingLevel || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showScalingLevel', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Performance Level"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showScalingLabel || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showScalingLabel', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Level Label"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showScalingImage || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showScalingImage', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Custom Images"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showScalingText || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showScalingText', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Large Text"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showScalingColors || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showScalingColors', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Use Scale Colors"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showScalingRange || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showScalingRange', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Score Range"
                        />
                      </Grid>

                      {/* Scoring Scale Representation Options */}
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Image Display Style</InputLabel>
                          <Select
                            value={template.packetConfigs[packet.id]?.imageDisplayStyle || 'icon'}
                            label="Image Display Style"
                            onChange={(e) => updatePacketConfig(packet.id, 'imageDisplayStyle', e.target.value)}
                          >
                            <MenuItem value="icon">Small Icon (32x32)</MenuItem>
                            <MenuItem value="medium">Medium Size (64x64)</MenuItem>
                            <MenuItem value="large">Large Size (100x100)</MenuItem>
                            <MenuItem value="banner">Banner Style (Full Width)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Text Display Position</InputLabel>
                          <Select
                            value={template.packetConfigs[packet.id]?.textDisplayPosition || 'below'}
                            label="Text Display Position"
                            onChange={(e) => updatePacketConfig(packet.id, 'textDisplayPosition', e.target.value)}
                          >
                            <MenuItem value="above">Above Score</MenuItem>
                            <MenuItem value="below">Below Score</MenuItem>
                            <MenuItem value="inline">Inline with Score</MenuItem>
                            <MenuItem value="separate">Separate Section</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Level Indicator Style</InputLabel>
                          <Select
                            value={template.packetConfigs[packet.id]?.levelIndicatorStyle || 'badge'}
                            label="Level Indicator Style"
                            onChange={(e) => updatePacketConfig(packet.id, 'levelIndicatorStyle', e.target.value)}
                          >
                            <MenuItem value="badge">Badge</MenuItem>
                            <MenuItem value="highlight">Highlight Box</MenuItem>
                            <MenuItem value="border">Colored Border</MenuItem>
                            <MenuItem value="background">Background Color</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Scale Progress Style</InputLabel>
                          <Select
                            value={template.packetConfigs[packet.id]?.scaleProgressStyle || 'none'}
                            label="Scale Progress Style"
                            onChange={(e) => updatePacketConfig(packet.id, 'scaleProgressStyle', e.target.value)}
                          >
                            <MenuItem value="none">No Progress Bar</MenuItem>
                            <MenuItem value="linear">Linear Progress Bar</MenuItem>
                            <MenuItem value="circular">Circular Progress</MenuItem>
                            <MenuItem value="dots">Progress Dots</MenuItem>
                            <MenuItem value="steps">Step Indicator</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Advanced Scoring Scale Options */}
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 2, mt: 2 }}>
                          🎯 Advanced Scale Options
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showAllScaleLevels || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showAllScaleLevels', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Show All Scale Levels"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.highlightCurrentLevel || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'highlightCurrentLevel', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Highlight Current Level"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showScaleComparison || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showScaleComparison', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Show vs Other Levels"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.packetConfigs[packet.id]?.showImprovementSuggestions || false}
                              onChange={(e) => updatePacketConfig(packet.id, 'showImprovementSuggestions', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Show Improvement Tips"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          🎨 Styling Settings
                        </Typography>
                      </Grid>

                      {/* Color Settings */}
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Background Color
                          </Typography>
                          <TextField
                            type="color"
                            value={template.packetConfigs[packet.id]?.backgroundColor || '#ffffff'}
                            onChange={(e) => updatePacketConfig(packet.id, 'backgroundColor', e.target.value)}
                            sx={{ '& input': { height: 56, cursor: 'pointer' } }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Border Color
                          </Typography>
                          <TextField
                            type="color"
                            value={template.packetConfigs[packet.id]?.borderColor || '#e5e7eb'}
                            onChange={(e) => updatePacketConfig(packet.id, 'borderColor', e.target.value)}
                            sx={{ '& input': { height: 56, cursor: 'pointer' } }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Score Color
                          </Typography>
                          <TextField
                            type="color"
                            value={template.packetConfigs[packet.id]?.scoreColor || '#10b981'}
                            onChange={(e) => updatePacketConfig(packet.id, 'scoreColor', e.target.value)}
                            sx={{ '& input': { height: 56, cursor: 'pointer' } }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Chart Type</InputLabel>
                          <Select
                            value={template.packetConfigs[packet.id]?.chartType || 'bar'}
                            label="Chart Type"
                            onChange={(e) => updatePacketConfig(packet.id, 'chartType', e.target.value)}
                          >
                            <MenuItem value="bar">Bar Chart</MenuItem>
                            <MenuItem value="pie">Pie Chart</MenuItem>
                            <MenuItem value="gauge">Gauge Chart</MenuItem>
                            <MenuItem value="radar">Radar Chart</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Typography Settings */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Font Size"
                          value={template.packetConfigs[packet.id]?.fontSize || '14px'}
                          onChange={(e) => updatePacketConfig(packet.id, 'fontSize', e.target.value)}
                          placeholder="14px"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Font Weight</InputLabel>
                          <Select
                            value={template.packetConfigs[packet.id]?.fontWeight || 'normal'}
                            label="Font Weight"
                            onChange={(e) => updatePacketConfig(packet.id, 'fontWeight', e.target.value)}
                          >
                            <MenuItem value="normal">Normal</MenuItem>
                            <MenuItem value="bold">Bold</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="light">Light</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Layout Settings */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Padding"
                          value={template.packetConfigs[packet.id]?.padding || '20px'}
                          onChange={(e) => updatePacketConfig(packet.id, 'padding', e.target.value)}
                          placeholder="20px"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Border Radius"
                          value={template.packetConfigs[packet.id]?.borderRadius || '8px'}
                          onChange={(e) => updatePacketConfig(packet.id, 'borderRadius', e.target.value)}
                          placeholder="8px"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  };

  const renderSectionOrder = () => {
    const sections = ['userInfo', 'overallScore', 'charts', 'sectionAnalysis', 'performanceInsights', 'recommendations', 'footer'];
    const enabledSections = sections.filter(section => template[section]?.enabled !== false);
    const sortedSections = enabledSections.sort((a, b) => (template[a]?.order || 0) - (template[b]?.order || 0));

    return (
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><ReorderIcon /></Avatar>}
          title="Section Order"
          subheader="Arrange sections in your preferred order"
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Stack spacing={2}>
            {sortedSections.map((section, index) => (
              <Paper
                key={section}
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      width: 32, 
                      height: 32,
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Chip
                    label={template[section]?.enabled !== false ? 'Enabled' : 'Disabled'}
                    color={template[section]?.enabled !== false ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Move Up">
                    <IconButton
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      color="success"
                      size="small"
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Move Down">
                    <IconButton
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sortedSections.length - 1}
                      color="primary"
                      size="small"
                    >
                      <ArrowDownwardIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={template[section]?.enabled !== false ? "Hide Section" : "Show Section"}>
                    <IconButton
                      onClick={() => toggleSectionVisibility(section)}
                      color={template[section]?.enabled !== false ? 'success' : 'error'}
                      size="small"
                    >
                      {template[section]?.enabled !== false ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            ))}
          </Stack>
          
          <Divider sx={{ my: 3 }} />
          
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => resetSectionOrder()}
            startIcon={<RestartAltIcon />}
            sx={{ py: 1.5 }}
          >
            Reset to Default Order
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderStylingSettings = () => (
    <Stack spacing={3}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><PaletteIcon /></Avatar>}
          title="Color Scheme"
          subheader="Customize your template colors"
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Grid container spacing={3}>
            {Object.entries(template.colors).map(([colorName, colorValue]) => (
              <Grid item xs={12} md={6} lg={4} key={colorName}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {colorName.replace(/([A-Z])/g, ' $1')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      type="color"
                      value={colorValue}
                      onChange={(e) => updateTemplate(`colors.${colorName}`, e.target.value)}
                      sx={{ 
                        '& input': { 
                          height: 56, 
                          cursor: 'pointer',
                          borderRadius: 2
                        } 
                      }}
                      size="small"
                    />
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: colorValue,
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        boxShadow: 1
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ minWidth: 80 }}>
                      {colorValue}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          {/* Color Palette Presets */}
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'secondary.main' }}>
              🎨 Color Palette Presets
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderColor: 'transparent',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      opacity: 0.9
                    }
                  }}
                  onClick={() => {
                    updateTemplate('colors.primary', '#667eea');
                    updateTemplate('colors.secondary', '#764ba2');
                    updateTemplate('colors.accent', '#f093fb');
                  }}
                >
                  Professional Blue
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    borderColor: 'transparent',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      opacity: 0.9
                    }
                  }}
                  onClick={() => {
                    updateTemplate('colors.primary', '#f093fb');
                    updateTemplate('colors.secondary', '#f5576c');
                    updateTemplate('colors.accent', '#ffecd2');
                  }}
                >
                  Creative Pink
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    borderColor: 'transparent',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      opacity: 0.9
                    }
                  }}
                  onClick={() => {
                    updateTemplate('colors.primary', '#4facfe');
                    updateTemplate('colors.secondary', '#00f2fe');
                    updateTemplate('colors.accent', '#a8edea');
                  }}
                >
                  Ocean Blue
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderAdvancedSettings = () => (
    <Stack spacing={3}>
      {/* Quick Presets */}
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><TuneIcon /></Avatar>}
          title="Quick Presets"
          subheader="Apply predefined template styles"
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  borderColor: '#2196f3',
                  color: '#1976d2',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                    borderColor: '#1976d2'
                  }
                }}
                onClick={() => applyPreset('professional')}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    🎯 Professional
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Clean, corporate style with blue theme
                  </Typography>
                </Box>
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
                  borderColor: '#e91e63',
                  color: '#c2185b',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f8bbd9 0%, #f48fb1 100%)',
                    borderColor: '#c2185b'
                  }
                }}
                onClick={() => applyPreset('creative')}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    🎨 Creative
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vibrant colors with modern design
                  </Typography>
                </Box>
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                  borderColor: '#9e9e9e',
                  color: '#616161',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                    borderColor: '#757575'
                  }
                }}
                onClick={() => applyPreset('minimal')}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    ⚪ Minimal
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Simple, clean design with focus on content
                  </Typography>
                </Box>
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                  borderColor: '#4caf50',
                  color: '#388e3c',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
                    borderColor: '#388e3c'
                  }
                }}
                onClick={() => applyPreset('academic')}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    📚 Academic
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Formal layout suitable for research
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Export/Import */}
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: 'error.main' }}><CloudDownloadIcon /></Avatar>}
          title="Export/Import"
          subheader="Save and load template configurations"
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Stack spacing={3}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<CloudUploadIcon />}
              sx={{
                py: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                }
              }}
              onClick={() => {
                const templateData = JSON.stringify(template, null, 2);
                const blob = new Blob([templateData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pdf-template-${selectedQuiz || 'default'}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export Template
            </Button>
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Import Template File
              </Typography>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const importedTemplate = JSON.parse(event.target.result);
                        setTemplate(importedTemplate);
                        alert('Template imported successfully!');
                      } catch (error) {
                        alert('Error importing template. Please check the file format.');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                style={{ display: 'none' }}
                id="template-file-input"
              />
              <label htmlFor="template-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<CloudDownloadIcon />}
                  sx={{ py: 1.5 }}
                >
                  Choose File
                </Button>
              </label>
            </Box>
            
            {/* Template Actions */}
            <Paper elevation={1} sx={{ p: 3, backgroundColor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                🔄 Template Actions
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  onClick={() => validateTemplate()}
                  startIcon={<CheckIcon />}
                >
                  Validate
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  onClick={() => compareTemplates()}
                  startIcon={<RefreshIcon />}
                >
                  Compare
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  onClick={() => saveTemplateVersion()}
                  startIcon={<HistoryIcon />}
                >
                  Save Version
                </Button>
              </Stack>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                Validate your template, compare configurations, and save versions for backup
              </Typography>
            </Paper>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );

  const tabs = [
    { id: 'general', label: 'General', component: renderGeneralSettings, icon: <SettingsIcon /> },
    { id: 'header', label: 'Header', component: renderHeaderSettings, icon: <ArticleIcon /> },
    { id: 'charts', label: 'Charts', component: renderChartsSettings, icon: <BarChartIcon /> },
    { id: 'packets', label: 'Packets', component: renderPacketSettings, icon: <InventoryIcon /> },
    { id: 'order', label: 'Order', component: renderSectionOrder, icon: <ReorderIcon /> },
    { id: 'styling', label: 'Styling', component: renderStylingSettings, icon: <PaletteIcon /> },
    { id: 'advanced', label: 'Advanced', component: renderAdvancedSettings, icon: <TuneIcon /> },
  ];

  const renderVersionHistory = () => {
    if (!selectedQuiz) {
      return (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="h2" sx={{ mb: 2 }}>📚</Typography>
          <Typography variant="body2">Select a quiz to view version history</Typography>
        </Box>
      );
    }

    if (templateHistory.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="h2" sx={{ mb: 2 }}>🆕</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>No versions saved yet</Typography>
          <Typography variant="caption" color="text.disabled">
            Save your first version to get started
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={2}>
        {templateHistory.map((version) => (
          <Card
            key={version.id}
            elevation={2}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                elevation: 4,
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => restoreTemplateVersion(version)}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  label={`v${version.version}`}
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(version.timestamp).toLocaleTimeString()}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {new Date(version.timestamp).toLocaleDateString()}
              </Typography>
              <Button
                size="small"
                startIcon={<RestartAltIcon />}
                color="secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                Restore
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  };

  const renderTemplateStats = () => {
    if (!selectedQuiz) {
      return (
        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
          <Typography variant="body2">Select a quiz to view statistics</Typography>
        </Box>
      );
    }

    const enabledSections = Object.keys(template).filter(key => 
      template[key]?.enabled !== undefined ? template[key].enabled : true
    ).length;

    const totalSettings = Object.keys(template).reduce((acc, key) => {
      if (typeof template[key] === 'object' && template[key] !== null) {
        return acc + Object.keys(template[key]).length;
      }
      return acc + 1;
    }, 0);

    const stats = [
      { label: 'Active Sections', value: enabledSections, color: 'success.main', icon: <ViewModuleIcon /> },
      { label: 'Total Settings', value: totalSettings, color: 'primary.main', icon: <SettingsIcon /> },
      { label: 'Versions', value: templateHistory.length, color: 'secondary.main', icon: <HistoryIcon /> },
      { label: 'Page Size', value: template.page.size, color: 'warning.main', icon: <AssessmentIcon /> },
    ];

    return (
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card elevation={2} sx={{ textAlign: 'center', p: 2, borderRadius: 2 }}>
              <Avatar
                sx={{
                  bgcolor: stat.color,
                  mb: 2,
                  mx: 'auto',
                  width: 48,
                  height: 48,
                }}
              >
                {stat.icon}
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: stat.color, mb: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderPreview = () => (
    <Box sx={{ minHeight: 400 }}>
      {!selectedQuiz ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Typography variant="h1" sx={{ fontSize: '6rem', opacity: 0.2, mb: 3 }}>📄</Typography>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h1" sx={{ fontSize: '4rem', animation: 'pulse 2s infinite' }}>✨</Typography>
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
            Select a Quiz
          </Typography>
          <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
            Choose a quiz to preview your template configuration
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Your changes will appear here in real-time
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Header Preview */}
          {template.header.enabled && (
            <Paper
              elevation={4}
              sx={{
                p: 4,
                textAlign: 'center',
                color: 'white',
                backgroundColor: template.header.backgroundColor,
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': { transform: 'scale(1.02)' },
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                {template.header.title}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {template.header.subtitle}
              </Typography>
            </Paper>
          )}

          {/* User Info Preview */}
          {template.userInfo.enabled && (
            <Paper
              elevation={4}
              sx={{
                p: 4,
                backgroundColor: template.userInfo.backgroundColor,
                borderColor: template.userInfo.borderColor,
                border: 2,
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': { transform: 'scale(1.02)' },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
                User Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> John Doe
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Email:</strong> john@example.com
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Overall Score Preview */}
          {template.overallScore.enabled && (
            <Paper
              elevation={4}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: template.overallScore.backgroundColor,
                borderColor: template.overallScore.borderColor,
                border: 2,
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': { transform: 'scale(1.02)' },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
                Overall Performance
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                85%
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                Excellent Performance
              </Typography>
            </Paper>
          )}

          {/* Charts Preview */}
          {template.charts.enabled && (
            <Paper
              elevation={4}
              sx={{
                p: 4,
                backgroundColor: template.charts.backgroundColor,
                borderColor: template.charts.borderColor,
                border: 2,
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': { transform: 'scale(1.02)' },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary', textAlign: 'center' }}>
                Performance Charts
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>📊 Bar Chart</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>🎯 Gauge Chart</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'secondary.light',
                      color: 'secondary.contrastText',
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>🥧 Pie Chart</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Packet Preview */}
          {template.packets && (
            <Paper
              elevation={4}
              sx={{
                p: 4,
                backgroundColor: template.packets.backgroundColor,
                borderColor: template.packets.borderColor,
                borderWidth: template.packets.borderWidth,
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': { transform: 'scale(1.02)' },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary', textAlign: 'center' }}>
                Packet Analysis
              </Typography>
              <Stack spacing={2}>
                {[
                  { name: '📦 Depression', score: '85% - Excellent', color: 'primary.main' },
                  { name: '📦 Anxiety', score: '72% - Good', color: 'success.main' },
                  { name: '📦 Stress', score: '68% - Average', color: 'warning.main' },
                ].map((packet, index) => (
                  <Paper
                    key={index}
                    elevation={2}
                    sx={{
                      p: 2,
                      backgroundColor: index % 2 === 0 ? template.packets.rowBackgroundColor : template.packets.rowAlternateBackgroundColor,
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'scale(1.02)' },
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      <strong>{packet.name}:</strong>{' '}
                      <Typography component="span" sx={{ color: packet.color, fontWeight: 'bold' }}>
                        {packet.score}
                      </Typography>
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Individual Packet Previews */}
          {availablePackets.length > 0 && template.packetConfigs && (
            <Paper
              elevation={4}
              sx={{
                p: 4,
                backgroundColor: '#fafafa',
                border: '2px solid #e0e0e0',
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': { transform: 'scale(1.01)' },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'secondary.main', borderRadius: '50%', color: 'white' }}>
                  📦
                </Box>
                Individual Packet Configurations
              </Typography>
              
              <Stack spacing={3}>
                {availablePackets
                  .filter(packet => template.packetConfigs[packet.id]?.enabled)
                  .sort((a, b) => (template.packetConfigs[a.id]?.order || 0) - (template.packetConfigs[b.id]?.order || 0))
                  .map((packet, index) => {
                    const config = template.packetConfigs[packet.id];
                    return (
                      <Paper
                        key={packet.id}
                        elevation={3}
                        sx={{
                          p: 3,
                          backgroundColor: config.backgroundColor || '#ffffff',
                          borderColor: config.borderColor || '#e5e7eb',
                          border: `${config.borderWidth || '1px'} solid`,
                          borderRadius: config.borderRadius || '8px',
                          position: 'relative',
                          transition: 'all 0.3s',
                          '&:hover': { transform: 'scale(1.01)' },
                        }}
                      >
                        {/* Packet Order Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -10,
                            left: 20,
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Box>

                        {/* Packet Header */}
                        {config.showHeader && (
                          <Box
                            sx={{
                              p: 2,
                              mb: 2,
                              backgroundColor: config.headerBackgroundColor || '#f8fafc',
                              color: config.headerTextColor || '#374151',
                              borderRadius: 2,
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {config.title || packet.name}
                            </Typography>
                            {config.customLabel && (
                              <Typography variant="body2" color="text.secondary">
                                {config.customLabel}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Packet Content Preview */}
                        <Grid container spacing={2}>
                          {config.showScoreBreakdown && (
                            <Grid item xs={12} md={6}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f9ff', borderRadius: 2 }}>
                                <Typography variant="h4" sx={{ color: config.scoreColor || '#10b981', fontWeight: 'bold' }}>
                                  {Math.floor(Math.random() * 40) + 60}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Score
                                </Typography>
                                {config.showScalingRange && (
                                  <Typography variant="caption" display="block" color="text.disabled">
                                    Range: 80-100%
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          )}
                          
                          {config.showPerformanceLevel && (
                            <Grid item xs={12} md={6}>
                              <Box sx={{ 
                                textAlign: 'center', 
                                p: 2, 
                                backgroundColor: config.levelIndicatorStyle === 'background' ? '#f0fdf4' : '#ffffff',
                                border: config.levelIndicatorStyle === 'border' ? '2px solid #059669' : '1px solid #e5e7eb',
                                borderRadius: 2 
                              }}>
                                {config.showScalingImage && (
                                  <Box sx={{ mb: 1 }}>
                                    {config.imageDisplayStyle === 'large' && <Typography sx={{ fontSize: '2rem' }}>🎯</Typography>}
                                    {config.imageDisplayStyle === 'medium' && <Typography sx={{ fontSize: '1.5rem' }}>🎯</Typography>}
                                    {config.imageDisplayStyle === 'icon' && <Typography sx={{ fontSize: '1rem' }}>🎯</Typography>}
                                  </Box>
                                )}
                                {config.showScalingLabel && (
                                  <Typography variant="h6" sx={{ 
                                    color: config.showScalingColors ? '#059669' : 'text.primary', 
                                    fontWeight: 'bold',
                                    backgroundColor: config.levelIndicatorStyle === 'highlight' ? '#f0fdf4' : 'transparent',
                                    padding: config.levelIndicatorStyle === 'badge' ? '4px 8px' : 0,
                                    borderRadius: config.levelIndicatorStyle === 'badge' ? 1 : 0,
                                    display: config.levelIndicatorStyle === 'badge' ? 'inline-block' : 'block'
                                  }}>
                                    Good
                                  </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                  Performance Level
                                </Typography>
                                
                                {/* Progress Style Preview */}
                                {config.scaleProgressStyle !== 'none' && (
                                  <Box sx={{ mt: 1 }}>
                                    {config.scaleProgressStyle === 'linear' && (
                                      <Box sx={{ width: '100%', height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
                                        <Box sx={{ width: '75%', height: '100%', backgroundColor: '#059669', borderRadius: 2 }} />
                                      </Box>
                                    )}
                                    {config.scaleProgressStyle === 'dots' && (
                                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669' }} />
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669' }} />
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669' }} />
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#e5e7eb' }} />
                                      </Box>
                                    )}
                                    {config.scaleProgressStyle === 'steps' && (
                                      <Typography variant="caption" color="text.secondary">
                                        Step 3 of 4
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </Grid>
                          )}

                          {config.showQuestionList && (
                            <Grid item xs={12}>
                              <Box sx={{ p: 2, backgroundColor: '#fefce8', borderRadius: 2, border: '1px solid #fbbf24' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                  Sample Questions:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  • Question 1: What is the capital of France? ✓<br/>
                                  • Question 2: How many continents are there? ✗<br/>
                                  • Question 3: What is 2 + 2? ✓
                                </Typography>
                              </Box>
                            </Grid>
                          )}

                          {config.showRecommendations && (
                            <Grid item xs={12}>
                              <Box sx={{ p: 2, backgroundColor: '#eff6ff', borderRadius: 2, border: '1px solid #3b82f6' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                  💡 Recommendations:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Focus on improving knowledge in geography and basic mathematics.
                                </Typography>
                                {config.showImprovementSuggestions && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                    💡 Try practicing similar questions to reach the next level.
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          )}

                          {/* Advanced Scoring Scale Previews */}
                          {config.showAllScaleLevels && (
                            <Grid item xs={12}>
                              <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 2 }}>
                                  📊 All Performance Levels:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  <Chip label="Needs Improvement" size="small" sx={{ backgroundColor: '#fee2e2', color: '#dc2626' }} />
                                  <Chip label="Average" size="small" sx={{ backgroundColor: '#fef3c7', color: '#d97706' }} />
                                  <Chip 
                                    label="Good" 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: config.highlightCurrentLevel ? '#dcfce7' : '#f0fdf4', 
                                      color: '#059669',
                                      fontWeight: config.highlightCurrentLevel ? 'bold' : 'normal',
                                      border: config.highlightCurrentLevel ? '2px solid #059669' : 'none'
                                    }} 
                                  />
                                  <Chip label="Excellent" size="small" sx={{ backgroundColor: '#dbeafe', color: '#2563eb' }} />
                                </Box>
                              </Box>
                            </Grid>
                          )}

                          {config.showScaleComparison && (
                            <Grid item xs={12}>
                              <Box sx={{ p: 2, backgroundColor: '#fdf2f8', borderRadius: 2, border: '1px solid #ec4899' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                  📈 Comparison with Other Levels:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  You are 15 points away from "Excellent" level (95+ points).
                                </Typography>
                              </Box>
                            </Grid>
                          )}

                          {/* Large Text Display based on position */}
                          {config.showScalingText && (
                            <Grid item xs={12}>
                              <Box sx={{ 
                                p: 2, 
                                backgroundColor: '#f0f9ff', 
                                borderRadius: 2, 
                                border: '1px solid #3b82f6',
                                order: config.textDisplayPosition === 'above' ? -1 : 
                                       config.textDisplayPosition === 'separate' ? 999 : 'initial'
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                  📝 Custom Scale Text:
                                </Typography>
                                <Typography variant="body1" color="text.primary" sx={{ fontStyle: 'italic' }}>
                                  "Well done! You're showing strong understanding in this area."
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                  Position: {config.textDisplayPosition}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>

                        {/* Chart Type Preview */}
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Chart Type: {config.chartType}
                          </Typography>
                          <Box sx={{ height: 60, backgroundColor: 'white', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {config.chartType === 'bar' && <Typography>📊</Typography>}
                            {config.chartType === 'pie' && <Typography>🥧</Typography>}
                            {config.chartType === 'gauge' && <Typography>⏲️</Typography>}
                            {config.chartType === 'radar' && <Typography>🕸️</Typography>}
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
              </Stack>
            </Paper>
          )}

          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: 'info.main', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              <strong>Live Preview Active</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This is a preview of your template configuration. Actual PDF will use real data and full styling. Packet configurations show individual customizations.
            </Typography>
          </Alert>
        </Stack>
      )}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
            📄 PDF Template Configuration
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', mb: 4 }}>
            Design and customize your assessment report templates
          </Typography>
          
          {/* Search and Quick Actions */}
          <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search templates, settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                  sx: { bgcolor: 'white', borderRadius: 2 }
                }}
                sx={{ flexGrow: 1, maxWidth: 400 }}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  startIcon={<TuneIcon />}
                >
                  {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => saveTemplateVersion()}
                  startIcon={<HistoryIcon />}
                >
                  Save Version
                </Button>
              </Stack>
            </Stack>
          </Paper>
          
          {/* Quiz Selection and Actions */}
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems={{ lg: 'center' }} justifyContent="space-between">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
              <FormControl sx={{ minWidth: 280 }}>
                <InputLabel sx={{ color: 'white' }}>Select Quiz</InputLabel>
                <Select
                  value={selectedQuiz}
                  onChange={(e) => handleQuizChange(e.target.value)}
                  label="Select Quiz"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  <MenuItem value="">Choose a Quiz</MenuItem>
                  {quizzes.map(quiz => (
                    <MenuItem key={quiz.id} value={quiz.id}>{quiz.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedQuiz && (
                <Chip
                  label={`Configuring: ${quizzes.find(q => q.id === selectedQuiz)?.name}`}
                  color="info"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                />
              )}
              
              {/* Save Status Indicator */}
              {selectedQuiz && (
                <Chip
                  label={
                    isAutoSaving ? "Auto-saving..." :
                    hasUnsavedChanges ? "Unsaved changes" :
                    "All changes saved"
                  }
                  icon={
                    isAutoSaving ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> :
                    hasUnsavedChanges ? <SaveIcon /> :
                    <CheckIcon />
                  }
                  color={
                    isAutoSaving ? "info" :
                    hasUnsavedChanges ? "warning" :
                    "success"
                  }
                  variant="filled"
                  size="small"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="info"
                onClick={() => validateTemplate()}
                disabled={!selectedQuiz}
                startIcon={<CheckIcon />}
                sx={{ py: 1.5 }}
              >
                Validate
              </Button>
              <Button
                variant="contained"
                color={hasUnsavedChanges ? "warning" : "success"}
                onClick={saveTemplate}
                disabled={isLoading || !selectedQuiz}
                startIcon={
                  isLoading ? <CircularProgress size={20} color="inherit" /> :
                  isAutoSaving ? <CircularProgress size={20} color="inherit" /> :
                  hasUnsavedChanges ? <SaveIcon /> : <SaveIcon />
                }
                sx={{ py: 1.5, px: 3 }}
              >
                {isLoading ? 'Saving...' : 
                 isAutoSaving ? 'Auto-saving...' :
                 hasUnsavedChanges ? 'Save Changes' : 'Save Template'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Configuration Panel */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', height: 'fit-content' }}>
              <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Template Settings
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Customize your PDF reports
                </Typography>
              </Box>
              
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    value={tab.id}
                    label={tab.label}
                    icon={tab.icon}
                    iconPosition="start"
                    sx={{ minHeight: 64, textTransform: 'none', fontWeight: 'medium' }}
                  />
                ))}
              </Tabs>

              <Box sx={{ p: 3, maxHeight: 700, overflow: 'auto' }}>
                {searchTerm && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      🔍 Filtering settings for: <strong>"{searchTerm}"</strong>
                    </Typography>
                  </Alert>
                )}
                {tabs.find(tab => tab.id === activeTab)?.component()}
              </Box>
            </Paper>
          </Grid>

          {/* Preview and History Panel */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {/* Preview Panel */}
              <Grid item xs={12} xl={8}>
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'success.main', color: 'white', p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Live Preview
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      See your changes in real-time
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, minHeight: 400 }}>
                    {renderPreview()}
                  </Box>
                </Paper>
              </Grid>

              {/* Version History Panel */}
              <Grid item xs={12} xl={4}>
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'secondary.main', color: 'white', p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Version History
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Track your changes
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                    {renderVersionHistory()}
                  </Box>
                </Paper>
              </Grid>

              {/* Template Statistics Panel */}
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'info.main', color: 'white', p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Template Statistics
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Overview of your configuration
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    {renderTemplateStats()}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Speed Dial for Quick Actions */}
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<SaveIcon />}
            tooltipTitle="Save Template"
            onClick={saveTemplate}
          />
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Reset"
            onClick={() => resetSectionOrder()}
          />
          <SpeedDialAction
            icon={<CloudDownloadIcon />}
            tooltipTitle="Export"
            onClick={() => {
              const templateData = JSON.stringify(template, null, 2);
              const blob = new Blob([templateData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `pdf-template-${selectedQuiz || 'default'}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        </SpeedDial>
      </Container>
    </Box>
  );
};

export default PDFTemplateConfig;
