import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MenuItem from '@mui/material/MenuItem';
import QuizAssignmentGraph from './QuizAssignmentGraph';
import RichTextEditor from './RichTextEditor';

const QuizBuilder = ({ profiles, packets, savedQuizzes, addQuiz, updateQuiz, deleteQuiz, addPacketsToQuiz, removePacketsFromQuiz, assignQuiz, removeQuizAssignment, quizAssignments, onDataChange, getQuizPackets }) => {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [quizPackets, setQuizPackets] = useState([]);
  const [quizName, setQuizName] = useState('');
  const [reportHeader, setReportHeader] = useState('');
  const [reportFooter, setReportFooter] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    // Handle quiz packet reordering only
    if (result.source.droppableId === 'quiz-packets' && result.destination.droppableId === 'quiz-packets') {
      const items = Array.from(quizPackets);
      const [reordered] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reordered);
      setQuizPackets(items);
    }
  };

  const addPacketToQuiz = (packet) => {
    if (!quizPackets.find((p) => p.id === packet.id)) {
      setQuizPackets([...quizPackets, packet]);
    }
  };

  const saveQuiz = async () => {
    if (!quizName || (!isEditing && !selectedProfile) || quizPackets.length === 0) {
      alert('Quiz name, profile (for new quizzes), and at least one packet required!');
      return;
    }
    
    try {
      if (isEditing && editingQuiz) {
        // Update existing quiz
        await updateQuiz(editingQuiz.id, {
          name: quizName,
          description: '',
          time_limit: null,
          passing_score: 70,
          report_header: reportHeader,
          report_footer: reportFooter
        });

        // Get current packets for this quiz to remove them
        const currentPackets = await getQuizPackets(editingQuiz.id);
        const currentPacketIds = currentPackets.map(p => p.id);
        
        // Remove all current packets and add the new ones
        if (currentPacketIds.length > 0) {
          await removePacketsFromQuiz(editingQuiz.id, currentPacketIds);
        }
        
        if (quizPackets.length > 0) {
          await addPacketsToQuiz(editingQuiz.id, quizPackets.map(p => p.id));
        }

        alert('Quiz updated successfully!');
      } else {
        // Create new quiz
        const newQuiz = await addQuiz({
          name: quizName,
          description: '',
          time_limit: null,
          passing_score: 70,
          report_header: reportHeader,
          report_footer: reportFooter
        });

        // Add packets to the quiz
        if (quizPackets.length > 0) {
          await addPacketsToQuiz(newQuiz.id, quizPackets.map(p => p.id));
        }

        // Assign quiz to the selected profile
        await assignQuiz(selectedProfile, newQuiz.id);
        alert('Quiz saved successfully!');
      }

      // Refresh data to show updated packet information
      if (onDataChange) {
        await onDataChange();
      }

      // Reset form
      setQuizName('');
      setReportHeader('');
      setReportFooter('');
      setQuizPackets([]);
      setSelectedProfile('');
      setEditingQuiz(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    }
  };

  const editQuiz = async (quiz) => {
    try {
      setEditingQuiz(quiz);
      setQuizName(quiz.name);
      setReportHeader(quiz.report_header || '');
      setReportFooter(quiz.report_footer || '');
      setSelectedProfile(quiz.profileId || '');
      
      // Load existing packets for this quiz
      const existingPackets = await getQuizPackets(quiz.id);
      setQuizPackets(existingPackets || []);
      
      setIsEditing(true);
    } catch (error) {
      console.error('Error loading quiz for editing:', error);
      alert('Failed to load quiz for editing. Please try again.');
    }
  };

  const cancelEdit = () => {
    setQuizName('');
    setReportHeader('');
    setReportFooter('');
    setQuizPackets([]);
    setSelectedProfile('');
    setEditingQuiz(null);
    setIsEditing(false);
  };

  // Gather all questions from quizPackets
  const allQuestions = quizPackets.flatMap((packet) =>
    packet.questions?.map((q, idx) => ({
      ...q,
      packetName: packet.name,
      idx,
    })) || []
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={4} sx={{ width: '100%', margin: 0 }}>
        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, height: 'fit-content', position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                {isEditing ? 'Edit Quiz' : 'Build Quiz'}
              </Typography>
              <TextField
                label="Quiz Name"
                value={quizName}
                onChange={e => setQuizName(e.target.value)}
                size="medium"
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
              />
              <RichTextEditor
                label="Report Header"
                value={reportHeader}
                onChange={setReportHeader}
                placeholder="Enter header text that will appear before Performance Overview in the report..."
                height={150}
              />
              <RichTextEditor
                label="Report Footer"
                value={reportFooter}
                onChange={setReportFooter}
                placeholder="Enter footer text that will appear after Achievement Summary in the report..."
                height={150}
              />
              {!isEditing && (
                <TextField
                  select
                  label="Select Profile"
                  value={selectedProfile}
                  onChange={e => setSelectedProfile(e.target.value)}
                  size="medium"
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 3 }}
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {profiles.map((profile) => (
                    <MenuItem key={profile.id} value={profile.id}>
                      {profile.name} ({profile.type})
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Button
                variant="contained"
                onClick={saveQuiz}
                disabled={!quizName || (!isEditing && !selectedProfile) || quizPackets.length === 0}
                fullWidth
                sx={{ mb: 2, py: 1.5, fontWeight: 600 }}
                startIcon={<SaveIcon />}
              >
                {isEditing ? 'Update Quiz' : 'Save Quiz'}
              </Button>
              {isEditing && (
                <Button
                  variant="outlined"
                  onClick={cancelEdit}
                  fullWidth
                  sx={{ mb: 2, py: 1.5, fontWeight: 600 }}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => setShowPreview(!showPreview)}
                disabled={quizPackets.length === 0}
                fullWidth
                sx={{ py: 1.5, fontWeight: 600 }}
                startIcon={<PreviewIcon />}
              >
                {showPreview ? 'Hide Preview' : 'Preview Quiz'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, minHeight: 400 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Quiz Packets (Drag to Reorder)</Typography>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="quiz-packets">
                  {(provided) => (
                    <List {...provided.droppableProps} ref={provided.innerRef} sx={{ 
                      minHeight: 100, 
                      border: '2px dashed #ccc', 
                      borderRadius: 2, 
                      p: 2,
                      backgroundColor: 'rgba(255,255,255,0.5)'
                    }}>
                      {quizPackets.map((packet, index) => (
                        <Draggable key={packet.id} draggableId={packet.id} index={index}>
                          {(provided) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                mb: 1,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--card-shadow)',
                                '&:hover': {
                                  backgroundColor: 'var(--highlight)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text)' }}>
                                    {packet.name}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    {packet.questions?.length || 0} questions
                                  </Typography>
                                }
                              />
                              <IconButton
                                onClick={() => setQuizPackets(quizPackets.filter(p => p.id !== packet.id))}
                                size="small"
                                sx={{ color: 'error.main' }}
                              >
                                <AddCircleOutlineIcon sx={{ transform: 'rotate(45deg)' }} />
                              </IconButton>
                            </ListItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, minHeight: 400 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Available Packets</Typography>
              <List>
                {packets.map((packet) => (
                  <ListItem
                    key={packet.id}
                    button
                    onClick={() => addPacketToQuiz(packet)}
                    disabled={quizPackets.find((p) => p.id === packet.id)}
                    sx={{
                      mb: 1,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--card-shadow)',
                      '&:hover': {
                        backgroundColor: 'var(--highlight)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                      '&:disabled': {
                        opacity: 0.5,
                        backgroundColor: 'var(--card-bg)',
                        transform: 'none',
                        boxShadow: 'var(--card-shadow)',
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text)' }}>
                          {packet.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {packet.questions?.length || 0} questions
                        </Typography>
                      }
                    />
                    <AddCircleOutlineIcon sx={{ color: 'primary.main' }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {showPreview && (
        <Card variant="outlined" sx={{ mt: 4, borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Quiz Preview</Typography>
            {allQuestions.length === 0 ? (
              <Typography color="text.secondary">No questions to preview. Add packets first.</Typography>
            ) : (
              <List>
                {allQuestions.map((question, index) => (
                  <ListItem key={index} sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          {index + 1}. {question.question_text}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Type: {question.question_type === 'mcq' ? 'Multiple Choice' : 'True/False'} | Packet: {question.packetName}
                          </Typography>
                          {question.question_type === 'mcq' && question.options && (
                            <Box>
                              {question.options.map((option, optIndex) => (
                                <Typography key={optIndex} variant="body2" sx={{ ml: 2 }}>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </Typography>
                              ))}
                            </Box>
                          )}
                          <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: 'success.main' }}>
                            Correct Answer: {question.correct_answer}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      <Card variant="outlined" sx={{ mt: 4, borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Saved Quizzes</Typography>
          {savedQuizzes.length === 0 ? (
            <Typography color="text.secondary">No quizzes saved yet. Create your first quiz above!</Typography>
          ) : (
            <List className="saved-quizzes-list">
              {savedQuizzes.map((quiz) => (
                <ListItem key={quiz.id} sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text)' }}>
                        {quiz.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(quiz.created_at).toLocaleDateString()}
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      onClick={() => editQuiz(quiz)}
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteQuiz(quiz.id)}
                      size="small"
                      sx={{ color: 'error.main' }}
                    >
                      <AddCircleOutlineIcon sx={{ transform: 'rotate(45deg)' }} />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Quiz Assignment Graph Section */}
      <QuizAssignmentGraph
        profiles={profiles}
        savedQuizzes={savedQuizzes}
        quizAssignments={quizAssignments}
        onAssignQuiz={assignQuiz}
        onRemoveAssignment={removeQuizAssignment}
        onDataChange={onDataChange}
      />
    </Box>
  );
};

export default QuizBuilder; 