import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material'
import {
  Share as ShareIcon
} from '@mui/icons-material'
import ProfileManager from './ProfileManager'
import PacketManager from './PacketManager'
import QuizBuilder from './QuizBuilder'
import UserDashboard from './UserDashboard'
import AdminDashboard from './AdminDashboard'
import AssessmentReport from './AssessmentReport'

const AppContent = ({ 
  isAdminMode, 
  tab, 
  profiles, 
  packets, 
  savedQuizzes, 
  quizAssignments,
  addProfile,
  updateProfile,
  deleteProfile,
  addPacket,
  updatePacket,
  deletePacket,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  addPacketsToQuiz,
  removePacketsFromQuiz,
  assignQuiz,
  removeQuizAssignment,
  loadData,
  getQuizPackets,
  exportQuizzes,
  importQuizzes
}) => {
  // Always render all components but conditionally show them
  return (
    <Box sx={{ mt: 2, width: '100%' }}>
      {/* Admin Mode Components */}
      <div style={{ display: isAdminMode && tab === 0 ? 'block' : 'none' }}>
        <AdminDashboard />
      </div>
      <div style={{ display: isAdminMode && tab === 1 ? 'block' : 'none' }}>
        <AdminDashboard />
      </div>
      <div style={{ display: isAdminMode && tab === 2 ? 'block' : 'none' }}>
        <ProfileManager 
          profiles={profiles} 
          addProfile={addProfile}
          updateProfile={updateProfile}
          deleteProfile={deleteProfile}
        />
      </div>
      <div style={{ display: isAdminMode && tab === 3 ? 'block' : 'none' }}>
        <PacketManager 
          packets={packets} 
          addPacket={addPacket}
          updatePacket={updatePacket}
          deletePacket={deletePacket}
          addQuestion={addQuestion}
          updateQuestion={updateQuestion}
          deleteQuestion={deleteQuestion}
        />
      </div>
      <div style={{ display: isAdminMode && tab === 4 ? 'block' : 'none' }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" onClick={exportQuizzes}>Export Quizzes</Button>
            <Button component="label" sx={{ ml: 2 }}>
              Import Quizzes
              <input type="file" accept="application/json" hidden onChange={importQuizzes} />
            </Button>
          </Box>
          <QuizBuilder
            profiles={profiles}
            packets={packets}
            savedQuizzes={savedQuizzes}
            addQuiz={addQuiz}
            updateQuiz={updateQuiz}
            deleteQuiz={deleteQuiz}
            addPacketsToQuiz={addPacketsToQuiz}
            removePacketsFromQuiz={removePacketsFromQuiz}
            assignQuiz={assignQuiz}
            removeQuizAssignment={removeQuizAssignment}
            quizAssignments={quizAssignments}
            onDataChange={loadData}
            getQuizPackets={getQuizPackets}
          />
        </Box>
      </div>
      <div style={{ display: isAdminMode && tab === 5 ? 'block' : 'none' }}>
        <AssessmentReport />
      </div>

      {/* User Mode Components */}
      <div style={{ display: !isAdminMode && tab === 0 ? 'block' : 'none' }}>
        <UserDashboard />
      </div>
      <div style={{ display: !isAdminMode && tab === 1 ? 'block' : 'none' }}>
        <ProfileManager 
          profiles={profiles} 
          addProfile={addProfile}
          updateProfile={updateProfile}
          deleteProfile={deleteProfile}
        />
      </div>
      <div style={{ display: !isAdminMode && tab === 2 ? 'block' : 'none' }}>
        <PacketManager 
          packets={packets} 
          addPacket={addPacket}
          updatePacket={updatePacket}
          deletePacket={deletePacket}
          addQuestion={addQuestion}
          updateQuestion={updateQuestion}
          deleteQuestion={deleteQuestion}
        />
      </div>
      <div style={{ display: !isAdminMode && tab === 3 ? 'block' : 'none' }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" onClick={exportQuizzes}>Export Quizzes</Button>
            <Button component="label" sx={{ ml: 2 }}>
              Import Quizzes
              <input type="file" accept="application/json" hidden onChange={importQuizzes} />
            </Button>
          </Box>
          <QuizBuilder
            profiles={profiles}
            packets={packets}
            savedQuizzes={savedQuizzes}
            addQuiz={addQuiz}
            updateQuiz={updateQuiz}
            deleteQuiz={deleteQuiz}
            addPacketsToQuiz={addPacketsToQuiz}
            removePacketsFromQuiz={removePacketsFromQuiz}
            assignQuiz={assignQuiz}
            removeQuizAssignment={removeQuizAssignment}
            quizAssignments={quizAssignments}
            onDataChange={loadData}
            getQuizPackets={getQuizPackets}
          />
        </Box>
      </div>
      <div style={{ display: !isAdminMode && tab === 4 ? 'block' : 'none' }}>
        <Box sx={{ width: '100%' }}>
          {profiles.length === 0 && <Typography>No profiles created.</Typography>}
          <Grid container spacing={3} sx={{ width: '100%' }}>
            {profiles.map(profile => (
              <Grid item xs={12} sm={6} md={4} key={profile.id} sx={{ display: 'flex' }}>
                <Card className="assigned-quiz-card" variant="outlined" sx={{ mb: 2, p: 2, background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', minHeight: 240, height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardContent sx={{ minHeight: 180, height: '100%', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-start' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>{profile.name} <Typography component="span" color="text.secondary">({profile.type})</Typography></Typography>
                    <List sx={{ alignItems: 'flex-start' }}>
                      {quizAssignments.filter(aq => aq.profile_id === profile.id).length === 0 && (
                        <ListItem><ListItemText primary="No quizzes assigned." /></ListItem>
                      )}
                      {quizAssignments.filter(aq => aq.profile_id === profile.id).map(aq => {
                        const quiz = savedQuizzes.find(q => q.id === aq.quiz_id)
                        return quiz ? (
                          <ListItem key={aq.quiz_id} alignItems="flex-start" secondaryAction={
                            <Tooltip title="Copy shareable link">
                              <IconButton
                                color="primary"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/attempt/${quiz.id}`)
                                  alert('Link copied!')
                                }}
                                edge="end"
                                sx={{ ml: 1 }}
                              >
                                <ShareIcon />
                              </IconButton>
                            </Tooltip>
                          }>
                            <ListItemText
                              primary={
                                <Typography noWrap sx={{ maxWidth: 160 }}>
                                  {quiz.name}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ) : null
                      })}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </div>
      <div style={{ display: !isAdminMode && tab === 5 ? 'block' : 'none' }}>
        <AssessmentReport />
      </div>
    </Box>
  )
}

export default AppContent 