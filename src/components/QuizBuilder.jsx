import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import './QuizBuilder.css';
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
    <div className="quiz-builder">
      <div className="quiz-builder__grid">
        {/* Left Column - Form */}
        <div className="quiz-card quiz-card--form">
          <h3 className="quiz-card__title">
            {isEditing ? 'Edit Quiz' : 'Build Quiz'}
          </h3>
          <div className="form-group">
            <label className="form-label">Quiz Name</label>
            <input
              type="text"
              className="form-input"
              value={quizName}
              onChange={e => setQuizName(e.target.value)}
              placeholder="Enter quiz name..."
            />
          </div>
          
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
            <div className="form-group">
              <label className="form-label">Select Profile</label>
              <select
                className="form-input"
                value={selectedProfile}
                onChange={e => setSelectedProfile(e.target.value)}
              >
                <option value="">-- Select --</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}{profile.type ? ` (${profile.type})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            className="btn btn--primary btn--full"
            onClick={saveQuiz}
            disabled={!quizName || (!isEditing && !selectedProfile) || quizPackets.length === 0}
            style={{ marginBottom: 'var(--space-3)' }}
          >
            <SaveIcon className="btn-icon" />
            {isEditing ? 'Update Quiz' : 'Save Quiz'}
          </button>
          
          {isEditing && (
            <button
              type="button"
              className="btn btn--outline btn--full"
              onClick={cancelEdit}
              style={{ marginBottom: 'var(--space-3)' }}
            >
              Cancel Edit
            </button>
          )}

          <button
            type="button"
            className="btn btn--outline btn--full"
            onClick={() => setShowPreview(!showPreview)}
            disabled={quizPackets.length === 0}
          >
            <PreviewIcon className="btn-icon" />
            {showPreview ? 'Hide Preview' : 'Preview Quiz'}
          </button>
        </div>

        {/* Center Column - Quiz Packets (Drag and Drop) */}
        <div className="quiz-card">
          <h3 className="quiz-card__title">Quiz Packets (Drag to Reorder)</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="quiz-packets">
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className={`droppable-area ${snapshot.isDraggingOver ? 'droppable-area--active' : ''}`}
                >
                  {quizPackets.map((packet, index) => (
                    <Draggable key={packet.id} draggableId={packet.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="draggable-packet"
                        >
                          <div>
                            <div className="draggable-packet__name">{packet.name}</div>
                            <div className="draggable-packet__questions">
                              {packet.questions?.length || 0} questions
                            </div>
                          </div>
                          <button
                            type="button"
                            className="icon-btn icon-btn--danger"
                            onClick={() => setQuizPackets(quizPackets.filter(p => p.id !== packet.id))}
                            title="Remove Packet"
                          >
                            <AddCircleOutlineIcon style={{ transform: 'rotate(45deg)', width: '18px', height: '18px' }} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Right Column - Available Packets */}
        <div className="quiz-card">
          <h3 className="quiz-card__title">Available Packets</h3>
          <div className="available-packets-list">
            {packets.map((packet) => {
              const isDisabled = !!quizPackets.find((p) => p.id === packet.id);
              return (
                <div
                  key={packet.id}
                  className={`available-packet-item ${isDisabled ? 'available-packet-item--disabled' : ''}`}
                  onClick={() => !isDisabled && addPacketToQuiz(packet)}
                >
                  <div>
                    <div className="available-packet-item__name">{packet.name}</div>
                    <div className="available-packet-item__questions">
                      {packet.questions?.length || 0} questions
                    </div>
                  </div>
                  <AddCircleOutlineIcon style={{ color: isDisabled ? 'var(--color-muted)' : 'var(--color-primary)', width: '20px', height: '20px' }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quiz Preview */}
      {showPreview && (
        <div className="section-card quiz-preview-card">
          <h3 className="section-card__title">Quiz Preview</h3>
          {allQuestions.length === 0 ? (
            <p className="form-helper">No questions to preview. Add packets first.</p>
          ) : (
            <div className="preview-question-list">
              {allQuestions.map((question, index) => (
                <div key={index} className="preview-question-item">
                  <div className="preview-question-item__header">
                    {index + 1}. {question.question_text}
                  </div>
                  <div className="preview-question-item__meta">
                    Type: {(question.question_type === 'mcq' || question.type === 'mcq') ? 'Multiple Choice' : 'True/False'} | Packet: {question.packetName}
                  </div>
                  {(question.question_type === 'mcq' || question.type === 'mcq') && question.options && (
                    <div className="preview-question-item__options">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="preview-question-item__option">
                          {String.fromCharCode(65 + optIndex)}. {typeof option === 'object' ? option.text : option}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="preview-question-item__correct">
                    Correct Answer: {question.correct_answer || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Quizzes */}
      <div className="section-card saved-quizzes-card">
        <h3 className="section-card__title">Saved Quizzes</h3>
        {savedQuizzes.length === 0 ? (
          <p className="form-helper">No quizzes saved yet. Create your first quiz above!</p>
        ) : (
          <div className="saved-quizzes-list">
            {savedQuizzes.map((quiz) => (
              <div key={quiz.id} className="saved-quiz-item">
                <div>
                  <div className="saved-quiz-item__name">{quiz.name}</div>
                  <div className="saved-quiz-item__date">
                    Created: {new Date(quiz.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="saved-quiz-item__actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => editQuiz(quiz)}
                    title="Edit Quiz"
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => deleteQuiz(quiz.id)}
                    title="Delete Quiz"
                  >
                    <AddCircleOutlineIcon style={{ transform: 'rotate(45deg)', width: '18px', height: '18px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Assignment Graph Section */}
      <QuizAssignmentGraph
        profiles={profiles}
        savedQuizzes={savedQuizzes}
        quizAssignments={quizAssignments}
        onAssignQuiz={assignQuiz}
        onRemoveAssignment={removeQuizAssignment}
        onDataChange={onDataChange}
      />
    </div>
  );
};

export default QuizBuilder; 