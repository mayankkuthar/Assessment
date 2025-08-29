import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SettingsIcon from '@mui/icons-material/Settings';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

const PacketManager = ({ packets, addPacket, updatePacket, deletePacket, addQuestion, updateQuestion, deleteQuestion }) => {
  const [packetName, setPacketName] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MCQ');
  const [options, setOptions] = useState([
    { text: '', marks: 1 }
  ]);
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editQuestionType, setEditQuestionType] = useState('MCQ');
  const [editOptions, setEditOptions] = useState([
    { text: '', marks: 1 }
  ]);

  // Scoring Scale System State
  const [scoringScaleDialog, setScoringScaleDialog] = useState(false);
  const [scoringScale, setScoringScale] = useState([
    { min: 1, max: 3, label: "Needs Improvement", color: "#ff6b6b", image: "📚" },
    { min: 4, max: 6, label: "Average", color: "#ffd93d", image: "📊" },
    { min: 7, max: 9, label: "Good", color: "#6bcf7f", image: "🎯" },
    { min: 10, max: 12, label: "Excellent", color: "#4ecdc4", image: "🏆" }
  ]);
  const [enableScoringScale, setEnableScoringScale] = useState(() => {
    // Try to get from localStorage, default to false
    const saved = localStorage.getItem('enableScoringScale');
    return saved ? JSON.parse(saved) : false;
  });

  // Handle question type change
  const handleQuestionTypeChange = (newType) => {
    setQuestionType(newType);
    if (newType === 'MCQ') {
      setOptions([{ text: '', marks: 1 }]);
    } else {
      setOptions([
        { text: 'True', marks: 3 },
        { text: 'False', marks: 2 }
      ]);
    }
  };

  // Handle edit question type change
  const handleEditQuestionTypeChange = (newType) => {
    setEditQuestionType(newType);
    if (newType === 'MCQ') {
      setEditOptions([{ text: '', marks: 1 }]);
    } else {
      setEditOptions([
        { text: 'True', marks: 3 },
        { text: 'False', marks: 2 }
      ]);
    }
  };

  // Add new option for MCQ
  const addOption = () => {
    setOptions([...options, { text: '', marks: 1 }]);
  };

  // Add new option for edit MCQ
  const addEditOption = () => {
    setEditOptions([...editOptions, { text: '', marks: 1 }]);
  };

  // Remove option for MCQ
  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  // Remove option for edit MCQ
  const removeEditOption = (index) => {
    if (editOptions.length > 1) {
      const newOptions = editOptions.filter((_, i) => i !== index);
      setEditOptions(newOptions);
    }
  };

  // Update option text
  const updateOptionText = (index, text) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  // Update edit option text
  const updateEditOptionText = (index, text) => {
    const newOptions = [...editOptions];
    newOptions[index].text = text;
    setEditOptions(newOptions);
  };

  // Update option marks
  const updateOptionMarks = (index, marks) => {
    const newOptions = [...options];
    newOptions[index].marks = parseInt(marks) || 1;
    setOptions(newOptions);
  };

  // Update edit option marks
  const updateEditOptionMarks = (index, marks) => {
    const newOptions = [...editOptions];
    newOptions[index].marks = parseInt(marks) || 1;
    setEditOptions(newOptions);
  };

  // Scoring Scale System Functions
  const openScoringScaleDialog = () => {
    console.log('Opening scoring scale dialog...');
    console.log('Selected packet:', selectedPacket);
    console.log('Current packet marks:', currentPacketMarks);
    
    if (selectedPacket && currentPacketMarks) {
      // Auto-generate ranges based on packet min/max marks
      const minMarks = currentPacketMarks.minMarks;
      const maxMarks = currentPacketMarks.maxMarks;
      const range = maxMarks - minMarks;
      
      console.log('Min marks:', minMarks, 'Max marks:', maxMarks, 'Range:', range);
      
      const newScale = [
        { min: minMarks, max: Math.floor(minMarks + range * 0.25), label: "Needs Improvement", color: "#ff6b6b", image: "📚" },
        { min: Math.floor(minMarks + range * 0.25) + 1, max: Math.floor(minMarks + range * 0.5), label: "Average", color: "#ffd93d", image: "📊" },
        { min: Math.floor(minMarks + range * 0.5) + 1, max: Math.floor(minMarks + range * 0.75), label: "Good", color: "#6bcf7f", image: "🎯" },
        { min: Math.floor(minMarks + range * 0.75) + 1, max: maxMarks, label: "Excellent", color: "#4ecdc4", image: "🏆" }
      ];
      
      console.log('New scale:', newScale);
      setScoringScale(newScale);
    }
    setScoringScaleDialog(true);
  };

  const closeScoringScaleDialog = () => {
    setScoringScaleDialog(false);
  };

  const updateScoringScaleRange = (index, field, value) => {
    const newScale = [...scoringScale];
    newScale[index][field] = field === 'min' || field === 'max' ? parseInt(value) || 0 : value;
    setScoringScale(newScale);
  };

  const getScoreLevel = (score) => {
    if (!enableScoringScale || !scoringScale.length) return null;
    
    const level = scoringScale.find(range => score >= range.min && score <= range.max);
    return level || null;
  };

  const saveScoringScale = () => {
    // Validate ranges
    let isValid = true;
    for (let i = 0; i < scoringScale.length; i++) {
      if (scoringScale[i].min > scoringScale[i].max) {
        isValid = false;
        break;
      }
      if (i > 0 && scoringScale[i].min !== scoringScale[i-1].max + 1) {
        isValid = false;
        break;
      }
    }
    
    if (isValid) {
      setEnableScoringScale(true);
      closeScoringScaleDialog();
    } else {
      alert('Please fix the scoring ranges. Each range should connect properly.');
    }
  };

  // Set correct answer
  const setCorrectAnswerOption = (optionText) => {
    // This function is no longer needed as correct answer is not tracked per question
  };

  // Set edit correct answer
  const setEditCorrectAnswerOption = (optionText) => {
    // This function is no longer needed as correct answer is not tracked per question
  };

  // Calculate min and max marks for a packet
  const calculatePacketMarks = (packetId) => {
    const packet = packets.find(p => p.id === packetId);
    if (!packet || !packet.questions || packet.questions.length === 0) {
      return { minMarks: 0, maxMarks: 0, totalQuestions: 0 };
    }

    let totalMinMarks = 0;
    let totalMaxMarks = 0;
    let totalQuestions = packet.questions.length;

    packet.questions.forEach(question => {
      if (question.options && Array.isArray(question.options)) {
        // For questions with options, calculate based on individual option marks
        if (typeof question.options[0] === 'object') {
          // New format with individual option marks
          const optionMarks = question.options.map(opt => opt.marks || 1);
          const questionMin = Math.min(...optionMarks); // Worst possible answer
          const questionMax = Math.max(...optionMarks); // Best possible answer
          totalMinMarks += questionMin;
          totalMaxMarks += questionMax;
        } else {
          // Old format - use question marks (fallback)
          totalMinMarks += question.marks || 1;
          totalMaxMarks += question.marks || 1;
        }
      } else {
        // Fallback for questions without options
        totalMinMarks += question.marks || 1;
        totalMaxMarks += question.marks || 1;
      }
    });

    return {
      minMarks: totalMinMarks, // Total marks if student chooses worst answer for every question
      maxMarks: totalMaxMarks, // Total marks if student chooses best answer for every question
      totalQuestions
    };
  };

  // Get current packet marks info
  const currentPacketMarks = selectedPacket ? calculatePacketMarks(selectedPacket) : { minMarks: 0, maxMarks: 0, totalQuestions: 0 };

  // Recalculate marks when options change during editing
  useEffect(() => {
    if (editingQuestionId && selectedPacket) {
      // Force re-render to update marks calculation when editing
      setSelectedPacket(selectedPacket);
    }
  }, [editOptions, editingQuestionId, selectedPacket]);

  // Save enableScoringScale to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('enableScoringScale', JSON.stringify(enableScoringScale));
  }, [enableScoringScale]);

  const handleAddPacket = async () => {
    if (packetName) {
      try {
        await addPacket({ name: packetName, description: '' });
        setPacketName('');
      } catch (error) {
        console.error('Error adding packet:', error);
        alert('Failed to add packet. Please try again.');
      }
    }
  };

  const handleDeletePacket = async (id) => {
    if (window.confirm('Are you sure you want to delete this packet?')) {
      try {
        await deletePacket(id);
        if (selectedPacket === id) setSelectedPacket(null);
      } catch (error) {
        console.error('Error deleting packet:', error);
        alert('Failed to delete packet. Please try again.');
      }
    }
  };

  const handleAddQuestion = async () => {
    if (!questionText || !selectedPacket) return;
    
    try {
      const questionData = {
        packet_id: selectedPacket,
        question_text: questionText,
        question_type: questionType === 'MCQ' ? 'mcq' : 'true_false',
        options: options,
        marks: options.reduce((sum, opt) => sum + opt.marks, 0) // Total marks for the question
      };
      
      await addQuestion(questionData);
      setQuestionText('');
      setOptions([{ text: '', marks: 1 }]);
      
      // Force re-render to update marks calculation
      setSelectedPacket(selectedPacket);
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question. Please try again.');
    }
  };

  const handleDeleteQuestion = async (qid) => {
    try {
      await deleteQuestion(qid);
      
      // Force re-render to update marks calculation
      setSelectedPacket(selectedPacket);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    }
  };

  const startEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setEditQuestionText(q.question_text || q.text);
    setEditQuestionType(q.question_type === 'mcq' ? 'MCQ' : 'TrueFalse');
    
    if (q.question_type === 'mcq' && q.options) {
      // Convert options to new format if they're in old format
      if (Array.isArray(q.options) && typeof q.options[0] === 'string') {
        setEditOptions(q.options.map((opt, idx) => ({
          text: opt,
          marks: q.marks || 1
        })));
      } else {
        setEditOptions(q.options || [{ text: '', marks: 1 }]);
      }
    } else {
      setEditOptions([
        { text: 'True', marks: 3 },
        { text: 'False', marks: 2 }
      ]);
    }
  };

  const saveEditQuestion = async (qid) => {
    try {
      const updates = {
        question_text: editQuestionText,
        question_type: editQuestionType === 'MCQ' ? 'mcq' : 'true_false',
        options: editOptions,
        marks: editOptions.reduce((sum, opt) => sum + opt.marks, 0) // Total marks for the question
      };
      
      await updateQuestion(qid, updates);
      setEditingQuestionId(null);
      setEditQuestionText('');
      setEditOptions([{ text: '', marks: 1 }]);
      
      // Force re-render to update marks calculation
      setSelectedPacket(selectedPacket);
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question. Please try again.');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={4} sx={{ width: '100%', margin: 0 }}>
        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, height: 'fit-content', position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>New Packet</Typography>
              <TextField
                label="Packet Name"
                value={packetName}
                onChange={e => setPacketName(e.target.value)}
                size="medium"
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button 
                variant="contained" 
                startIcon={<AddCircleOutlineIcon />} 
                onClick={handleAddPacket} 
                fullWidth
                sx={{ 
                  height: 48, 
                  fontWeight: 600,
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                Add Packet
              </Button>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ mt: 3, borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Packets</Typography>
              
              {/* Overall Statistics */}
              {packets.length > 0 && (
                <Box sx={{ 
                  mb: 3, 
                  p: 2, 
                  backgroundColor: 'rgba(103, 58, 183, 0.1)', 
                  borderRadius: 2,
                  border: '1px solid rgba(103, 58, 183, 0.3)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    📈 Overall Assessment Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Packets: <strong>{packets.length}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Questions: <strong>
                          {packets.reduce((total, packet) => total + (packet.questions?.length || 0), 0)}
                        </strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Min Marks: <strong>
                          {(() => {
                            const allMarks = packets.map(p => calculatePacketMarks(p.id)).filter(m => m.minMarks > 0);
                            if (allMarks.length === 0) return 0;
                            return Math.min(...allMarks.map(m => m.minMarks));
                          })()}
                        </strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Max Marks: <strong>
                          {(() => {
                            const allMarks = packets.map(p => calculatePacketMarks(p.id)).filter(m => m.maxMarks > 0);
                            if (allMarks.length === 0) return 0;
                            return Math.max(...allMarks.map(m => m.maxMarks));
                          })()}
                        </strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
              <List sx={{ p: 0 }}>
                {packets.map((packet) => (
                  <ListItem
                    key={packet.id}
                    button
                    selected={selectedPacket === packet.id}
                    onClick={() => setSelectedPacket(packet.id)}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeletePacket(packet.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{ 
                      borderRadius: 2, 
                      mb: 1,
                      '&:hover': { backgroundColor: 'rgba(67, 233, 123, 0.1)' },
                      '&.Mui-selected': { 
                        backgroundColor: 'rgba(67, 233, 123, 0.2)',
                        '&:hover': { backgroundColor: 'rgba(67, 233, 123, 0.3)' }
                      }
                    }}
                  >
                    <ListItemText 
                      primary={packet.name} 
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {packet.questions?.length || 0} questions
                          </Typography>
                          {packet.questions && packet.questions.length > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Total: {(() => {
                                const marks = calculatePacketMarks(packet.id);
                                if (marks.minMarks === marks.maxMarks) {
                                  return `${marks.minMarks} marks`;
                                } else {
                                  return `${marks.minMarks}-${marks.maxMarks} marks`;
                                }
                              })()}
                            </Typography>
                          )}
                          {packet.questions && packet.questions.length > 0 && (
                            <Box sx={{ 
                              mt: 1, 
                              p: 1, 
                              backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                              borderRadius: 1,
                              border: '1px solid rgba(76, 175, 80, 0.3)'
                            }}>
                              <Typography variant="caption" sx={{ 
                                color: 'success.main', 
                                fontWeight: 600,
                                display: 'block',
                                textAlign: 'center'
                              }}>
                                {(() => {
                                  const marks = calculatePacketMarks(packet.id);
                                  if (marks.minMarks === marks.maxMarks) {
                                    return `🎯 ${marks.minMarks} total marks`;
                                  } else {
                                    return `🎯 ${marks.minMarks}-${marks.maxMarks} total marks`;
                                  }
                                })()}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={8}>
          {selectedPacket && (
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, minHeight: 500 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Add Question to Packet</Typography>
                
                {/* Packet Marks Summary */}
                {currentPacketMarks.totalQuestions > 0 && (
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    backgroundColor: 'rgba(67, 233, 123, 0.1)', 
                    borderRadius: 2,
                    border: '1px solid rgba(67, 233, 123, 0.3)'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        📊 Packet Scoring Range
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SettingsIcon />}
                        onClick={openScoringScaleDialog}
                        sx={{ minWidth: 'auto' }}
                      >
                        Configure Scale
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Questions: <strong>{currentPacketMarks.totalQuestions}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="body2" color="text.secondary">
                          Score Range: <strong>{currentPacketMarks.minMarks} - {currentPacketMarks.maxMarks} marks</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      💡 Students can score between {currentPacketMarks.minMarks} and {currentPacketMarks.maxMarks} total marks in this packet
                    </Typography>

                    {/* Scoring Scale Display */}
                    {enableScoringScale && scoringScale.length > 0 && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                          🎯 Performance Scale:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {scoringScale.map((range, index) => (
                            <Chip
                              key={index}
                              label={`${range.image} ${range.label} (${range.min}-${range.max})`}
                              sx={{
                                backgroundColor: range.color,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    

                  </Box>
                )}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      label="Question Text"
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                      size="medium"
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Type"
                      value={questionType}
                      onChange={e => handleQuestionTypeChange(e.target.value)}
                      size="medium"
                      SelectProps={{ native: true }}
                      fullWidth
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="TrueFalse">True/False</option>
                    </TextField>
                  </Grid>
                </Grid>
                {questionType === 'MCQ' && (
                  <Grid container spacing={2} sx={{ mb: 3 }} style={{ flexDirection: 'column' }}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Options</Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={addOption}
                          sx={{ minWidth: 'auto' }}
                        >
                          Add Option
                        </Button>
                      </Box>
                    </Grid>
                    {options.map((opt, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <TextField
                            label={`Option ${idx + 1}`}
                            value={opt.text}
                            onChange={e => updateOptionText(idx, e.target.value)}
                            size="medium"
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            label="Marks"
                            type="number"
                            value={opt.marks}
                            onChange={e => updateOptionMarks(idx, e.target.value)}
                            size="medium"
                            variant="outlined"
                            InputLabelProps={{ shrink: true, min: 1, max: 100 }}
                            sx={{ width: 100 }}
                          />
                          <IconButton
                            onClick={() => removeOption(idx)}
                            disabled={options.length <= 1}
                            color="error"
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
                {questionType === 'TrueFalse' && (
                  <Grid container spacing={2} sx={{ mb: 3 }} style={{ flexDirection: 'column' }}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>True/False Options</Typography>
                    </Grid>
                    {options.map((opt, idx) => (
                      <Grid item xs={12} sm={6} key={idx} >
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <TextField
                            label={opt.text}
                            type="number"
                            value={opt.marks}
                            onChange={e => updateOptionMarks(idx, e.target.value)}
                            size="medium"
                            variant="outlined"
                            InputLabelProps={{ shrink: true, min: 1, max: 100 }}
                            sx={{ flex: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            marks for {opt.text}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
                <Button 
                  variant="contained" 
                  onClick={handleAddQuestion} 
                  startIcon={<AddCircleOutlineIcon />} 
                  sx={{ 
                    mb: 4,
                    height: 48,
                    fontWeight: 600,
                    background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Add Question
                </Button>
                <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Questions in Packet</Typography>
                <List sx={{ p: 0 }}>
                  {packets.find(p => p.id === selectedPacket)?.questions?.map((q) => (
                    <ListItem key={q.id} alignItems="flex-start" sx={{ 
                      mb: 2, 
                      borderRadius: 2, 
                      border: '1px solid rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(255,255,255,0.5)'
                    }}
                      secondaryAction={
                        <>
                          <IconButton edge="end" aria-label="edit" onClick={() => startEditQuestion(q)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(q.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      }
                    >
                      {editingQuestionId === q.id ? (
                        <Box sx={{ width: '100%' }}>
                          <TextField
                            value={editQuestionText}
                            onChange={e => setEditQuestionText(e.target.value)}
                            size="medium"
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            select
                            label="Type"
                            value={editQuestionType}
                            onChange={e => handleEditQuestionTypeChange(e.target.value)}
                            size="medium"
                            SelectProps={{ native: true }}
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                          >
                            <option value="MCQ">MCQ</option>
                            <option value="TrueFalse">True/False</option>
                          </TextField>
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Options</Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={addEditOption}
                                  sx={{ minWidth: 'auto' }}
                                >
                                  Add Option
                                </Button>
                              </Box>
                            </Grid>
                            {editOptions.map((opt, idx) => (
                              <Grid item xs={12} key={idx}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                  <TextField
                                    label={`Option ${idx + 1}`}
                                    value={opt.text}
                                    onChange={e => updateEditOptionText(idx, e.target.value)}
                                    size="medium"
                                    fullWidth
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    label="Marks"
                                    type="number"
                                    value={opt.marks}
                                    onChange={e => updateEditOptionMarks(idx, e.target.value)}
                                    size="medium"
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true, min: 1, max: 100 }}
                                    sx={{ width: 100 }}
                                  />
                                  <IconButton
                                    onClick={() => removeEditOption(idx)}
                                    disabled={editOptions.length <= 1}
                                    color="error"
                                    size="small"
                                  >
                                    <RemoveIcon />
                                  </IconButton>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                              variant="contained" 
                              size="medium" 
                              onClick={() => saveEditQuestion(q.id)}
                              sx={{ 
                                fontWeight: 600,
                                background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)'
                                }
                              }}
                            >
                              Save
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="medium" 
                              onClick={() => {
                                setEditingQuestionId(null);
                                setEditQuestionText('');
                                setEditOptions([{ text: '', marks: 1 }]);
                              }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <ListItemText
                          primary={q.question_text || q.text}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Type: {q.question_type === 'mcq' ? 'MCQ' : 'True/False'}
                              </Typography>
                              {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  Options: {q.options.map((opt, idx) => 
                                    `${opt.text} (${opt.marks} marks)`
                                  ).join(' | ')}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                Total Marks: {q.options ? q.options.reduce((sum, opt) => sum + (opt.marks || 1), 0) : (q.marks || 1)}
                              </Typography>
                            </Box>
                          }
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Scoring Scale Configuration Dialog */}
      <Dialog 
        open={scoringScaleDialog} 
        onClose={closeScoringScaleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🎯 Configure Performance Scoring Scale
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            Define performance ranges and labels for this packet
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Debug: Dialog is open, enableScoringScale = {enableScoringScale.toString()}
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={enableScoringScale}
                  onChange={(e) => {
                    console.log('Switch changed to:', e.target.checked);
                    setEnableScoringScale(e.target.checked);
                  }}
                />
              }
              label="Enable Custom Scoring Scale"
              sx={{ mb: 2 }}
            />
            
            {/* Test button to manually toggle state */}
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => {
                console.log('Button clicked, current state:', enableScoringScale);
                setEnableScoringScale(!enableScoringScale);
              }}
              sx={{ ml: 2 }}
            >
              Toggle State: {enableScoringScale ? 'ON' : 'OFF'}
            </Button>
            
            {enableScoringScale && (
              <Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Debug: Switch is enabled, rendering content...
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Current Packet Range: {currentPacketMarks?.minMarks || 0} - {currentPacketMarks?.maxMarks || 0} marks
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Debug: Scoring scale has {scoringScale.length} items
                </Typography>
                
                {scoringScale.map((range, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Level {index + 1}: {range.label}
                    </Typography>
                    
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Min Score"
                          type="number"
                          value={range.min}
                          onChange={(e) => updateScoringScaleRange(index, 'min', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Max Score"
                          type="number"
                          value={range.max}
                          onChange={(e) => updateScoringScaleRange(index, 'max', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Label"
                          value={range.label}
                          onChange={(e) => updateScoringScaleRange(index, 'label', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Color"
                          value={range.color}
                          onChange={(e) => updateScoringScaleRange(index, 'color', e.target.value)}
                          size="small"
                          fullWidth
                          inputProps={{ placeholder: '#ff6b6b' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <TextField
                          label="Image"
                          value={range.image}
                          onChange={(e) => updateScoringScaleRange(index, 'image', e.target.value)}
                          size="small"
                          fullWidth
                          inputProps={{ placeholder: '📚' }}
                        />
                      </Grid>
                    </Grid>
                    
                    {/* Range Preview */}
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Preview:
                      </Typography>
                      <Chip
                        label={`${range.image} ${range.label} (${range.min}-${range.max})`}
                        sx={{
                          backgroundColor: range.color,
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Box>
                ))}
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  💡 Make sure each range connects properly (e.g., if Level 1 ends at 5, Level 2 should start at 6)
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeScoringScaleDialog}>Cancel</Button>
          <Button 
            onClick={saveScoringScale} 
            variant="contained"
            disabled={!enableScoringScale}
          >
            Save Scale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PacketManager; 