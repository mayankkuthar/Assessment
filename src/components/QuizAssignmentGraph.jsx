import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import 'reactflow/dist/style.css';

// Lazy load React Flow to prevent white screen issues
const ReactFlowComponent = React.lazy(() => import('reactflow').then(module => ({
  default: module.default
})));

// Import React Flow components directly
import { Controls, Background, MiniMap, useNodesState, useEdgesState, ReactFlowProvider } from 'reactflow';

const QuizAssignmentGraph = ({ 
  profiles, 
  savedQuizzes, 
  quizAssignments, 
  onAssignQuiz, 
  onRemoveAssignment,
  onDataChange 
}) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'graph'
  const [reactFlowError, setReactFlowError] = useState(false);

  // Debug logging
  console.log('QuizAssignmentGraph props:', {
    profiles: profiles?.length,
    savedQuizzes: savedQuizzes?.length,
    quizAssignments: quizAssignments?.length
  });

  // Check if we have data to display
  if (!profiles || !savedQuizzes || profiles.length === 0 || savedQuizzes.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, height: '400px' }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No quizzes or profiles available for assignment
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      if (newMode === 'graph') {
        setReactFlowError(false);
      }
    }
  };

  const GraphView = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Create nodes for quizzes and profiles
    const createNodes = useMemo(() => {
      try {
        const quizNodes = (savedQuizzes || []).map((quiz, index) => ({
          id: `quiz-${quiz.id}`,
          type: 'default',
          position: { x: 50, y: 100 + index * 120 },
          data: { 
            label: quiz.name,
            quiz: quiz,
            type: 'quiz'
          },
          style: {
            background: '#e3f2fd',
            border: '2px solid #2196f3',
            borderRadius: '8px',
            padding: '10px',
            minWidth: '150px',
            textAlign: 'center',
            color: '#000',
          },
          sourcePosition: 'right',
          targetPosition: 'left',
        }));

        const profileNodes = (profiles || []).map((profile, index) => ({
          id: `profile-${profile.id}`,
          type: 'default',
          position: { x: 400, y: 100 + index * 120 },
          data: { 
            label: `${profile.name} (${profile.type})`,
            profile: profile,
            type: 'profile'
          },
          style: {
            background: '#f3e5f5',
            border: '2px solid #9c27b0',
            borderRadius: '8px',
            padding: '10px',
            minWidth: '150px',
            textAlign: 'center',
            color: '#000',
          },
          sourcePosition: 'right',
          targetPosition: 'left',
        }));

        return [...quizNodes, ...profileNodes];
      } catch (error) {
        console.error('Error creating nodes:', error);
        return [];
      }
    }, [savedQuizzes, profiles]);

    // Helper to generate a random color
    function getRandomColor(id) {
      // Use a hash of the edge id for consistent color per edge
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      const color = `hsl(${hash % 360}, 70%, 50%)`;
      return color;
    }

    // Create edges for existing assignments
    const createEdges = useMemo(() => {
      try {
        return (quizAssignments || []).map((assignment) => {
          const edgeId = `edge-${assignment.quiz_id}-${assignment.profile_id}`;
          return {
            id: edgeId,
            source: `quiz-${assignment.quiz_id}`,
            target: `profile-${assignment.profile_id}`,
            type: 'bezier',
            style: { stroke: getRandomColor(edgeId), strokeWidth: 3 },
            data: { assignment: { quiz_id: assignment.quiz_id, profile_id: assignment.profile_id } },
            animated: true,
          };
        });
      } catch (error) {
        console.error('Error creating edges:', error);
        return [];
      }
    }, [quizAssignments]);

    // Initialize nodes and edges
    React.useEffect(() => {
      try {
        console.log('Setting nodes:', createNodes);
        console.log('Setting edges:', createEdges);
        setNodes(createNodes);
        setEdges(createEdges);
      } catch (error) {
        console.error('Error initializing nodes and edges:', error);
        setReactFlowError(true);
      }
    }, [createNodes, createEdges, setNodes, setEdges]);

    // Handle new connections
    const onConnect = useCallback(async (params) => {
      try {
        const sourceId = params.source;
        const targetId = params.target;
        
        // Extract quiz and profile IDs
        const quizId = sourceId.replace('quiz-', '');
        const profileId = targetId.replace('profile-', '');
        
        // Check if connection already exists
        const existingEdge = edges.find(
          edge => edge.source === sourceId && edge.target === targetId
        );
        
        if (existingEdge) {
          alert('This quiz is already assigned to this profile!');
          return;
        }
        
        // Add the assignment
        await onAssignQuiz(profileId, quizId);
        
        // Add the new edge
        const newEdge = {
          id: `edge-${quizId}-${profileId}`,
          source: sourceId,
          target: targetId,
          type: 'bezier',
          style: { stroke: '#4caf50', strokeWidth: 3 },
          data: { assignment: { quiz_id: quizId, profile_id: profileId } },
          animated: true,
        };
        
        setEdges((eds) => [...eds, newEdge]);
        
        // Refresh data
        if (onDataChange) {
          await onDataChange();
        }
      } catch (error) {
        console.error('Error assigning quiz:', error);
        alert('Failed to assign quiz. Please try again.');
      }
    }, [edges, onAssignQuiz, onDataChange, setEdges]);

    // Handle edge removal
    const onEdgeClick = useCallback(async (event, edge) => {
      try {
        console.log('Edge clicked:', edge);
        console.log('Edge data:', edge.data);
        
        const confirmed = window.confirm('Remove this quiz assignment?');
        if (confirmed) {
          const { quiz_id, profile_id } = edge.data.assignment;
          console.log('Removing assignment:', { quiz_id, profile_id });
          
          await onRemoveAssignment(profile_id, quiz_id);
          
          // Remove the edge
          setEdges((eds) => eds.filter((e) => e.id !== edge.id));
          
          // Refresh data
          if (onDataChange) {
            await onDataChange();
          }
        }
      } catch (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove assignment. Please try again.');
      }
    }, [onRemoveAssignment, onDataChange, setEdges]);

    if (reactFlowError) {
      return (
        <Box sx={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="error">
            <Typography variant="body2">
              Graph view is temporarily unavailable. Please use the list view.
            </Typography>
          </Alert>
        </Box>
      );
    }

    return (
      <React.Suspense fallback={
        <Box sx={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Loading graph view...</Typography>
        </Box>
      }>
        <Box sx={{ height: '600px', width: '100%' }}>
          <style>
            {`
              .react-flow {
                height: 82% !important;
              }
              .react-flow__node {
                cursor: grab;
                user-select: none;
              }
              .react-flow__node:active {
                cursor: grabbing;
              }
              .react-flow__handle {
                background: #4caf50;
                border: 2px solid #fff;
                width: 12px;
                height: 12px;
                opacity: 0.8;
              }
              .react-flow__handle:hover {
                background: #45a049;
                opacity: 1;
              }
              .react-flow__handle.connecting {
                background: #ff9800;
              }
              .react-flow__connection-path {
                stroke: #4caf50;
                stroke-width: 3;
              }
              .react-flow__connection-line {
                stroke: #4caf50;
                stroke-width: 2;
              }
              .react-flow__pane {
                cursor: grab;
              }
              .react-flow__pane:active {
                cursor: grabbing;
              }
            `}
          </style>
          <ReactFlowProvider>
            <ReactFlowComponent
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              fitView
              style={{ background: '#1a1a1a' }}
              connectionMode="loose"
              snapToGrid={true}
              snapGrid={[15, 15]}
              panOnDrag={true}
              panOnScroll={false}
              zoomOnScroll={true}
              zoomOnPinch={true}
              zoomOnDoubleClick={false}
              selectNodesOnDrag={false}
              defaultEdgeOptions={{
                type: 'bezier',
                style: { stroke: '#4caf50', strokeWidth: 3 },
                animated: true,
              }}
            >
              <Background color="#333" gap={20} />
              <Controls style={{ background: '#2a2a2a', border: '1px solid #444' }} />
            </ReactFlowComponent>
          </ReactFlowProvider>
        </Box>
      </React.Suspense>
    );
  };

  const ListView = () => (
    <Box sx={{ height: '600px', overflowY: 'auto', pb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Available Quizzes ({savedQuizzes.length}):
      </Typography>
      <Box sx={{ mb: 3 }}>
        {savedQuizzes.map((quiz) => (
          <Box key={quiz.id} sx={{ 
            p: 2, 
            mb: 1, 
            bgcolor: '#e3f2fd', 
            borderRadius: 1, 
            border: '1px solid #2196f3' 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {quiz.name}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Profiles ({profiles.length}):
      </Typography>
      <Box sx={{ mb: 3 }}>
        {profiles.map((profile) => (
          <Box key={profile.id} sx={{ 
            p: 2, 
            mb: 1, 
            bgcolor: '#f3e5f5', 
            borderRadius: 1, 
            border: '1px solid #9c27b0' 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {profile.name} ({profile.type})
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Current Assignments ({quizAssignments?.length || 0}):
      </Typography>
      <Box>
        {quizAssignments?.map((assignment) => {
          const quiz = savedQuizzes.find(q => q.id === assignment.quiz_id);
          const profile = profiles.find(p => p.id === assignment.profile_id);
          return (
            <Box key={assignment.id} sx={{ 
              p: 2, 
              mb: 1, 
              bgcolor: '#e8f5e8', 
              borderRadius: 1, 
              border: '1px solid #4caf50',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2">
                <strong>{quiz?.name || 'Unknown Quiz'}</strong> → <strong>{profile?.name || 'Unknown Profile'}</strong>
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onRemoveAssignment(assignment.profile_id, assignment.quiz_id)}
              >
                Remove
              </Button>
            </Box>
          );
        })}
        {(!quizAssignments || quizAssignments.length === 0) && (
          <Typography variant="body2" color="text.secondary">
            No assignments yet
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, height: '700px' }}>
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Quiz Assignment Manager
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon sx={{ mr: 1 }} />
              List View
            </ToggleButton>
            <ToggleButton value="graph" aria-label="graph view">
              <AccountTreeIcon sx={{ mr: 1 }} />
              Graph View
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>List View:</strong> Simple overview of quizzes, profiles, and assignments.
            <br />
            <strong>Graph View:</strong> Drag from quiz (blue) to profile (purple) to assign. Click connections to remove.
          </Typography>
        </Alert>

        {viewMode === 'list' ? <ListView /> : <GraphView />}
      </CardContent>
    </Card>
  );
};

export default QuizAssignmentGraph; 