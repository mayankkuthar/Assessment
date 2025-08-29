import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

const ProfileManager = ({ profiles, addProfile, updateProfile, deleteProfile }) => {
  const [profileName, setProfileName] = useState('');
  const [profileType, setProfileType] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');

  const handleAddProfile = async () => {
    if (profileName && profileType) {
      try {
        await addProfile({
          name: profileName,
          type: profileType
        });
        setProfileName('');
        setProfileType('');
      } catch (error) {
        console.error('Error adding profile:', error);
        alert('Failed to add profile. Please try again.');
      }
    } else {
      alert('Please fill in both name and type.');
    }
  };

  const handleDeleteProfile = async (id) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteProfile(id);
      } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Failed to delete profile. Please try again.');
      }
    }
  };

  const handleEditClick = (profile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditType(profile.type);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (editName && editType && editingProfile) {
      try {
        await updateProfile(editingProfile.id, {
          name: editName,
          type: editType
        });
        setEditDialogOpen(false);
        setEditingProfile(null);
        setEditName('');
        setEditType('');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    } else {
      alert('Please fill in both name and type.');
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingProfile(null);
    setEditName('');
    setEditType('');
  };

  const getTypeColor = (type) => {
    const colors = {
      'student': 'primary',
      'executive': 'error',
      'management': 'warning',
      'employee': 'success',
      'general': 'default'
    };
    return colors[type] || 'default';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Add Profile Form */}
      <Card sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 1, width: '100%' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Add New Profile</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', mb: 2 }}>
          <TextField
            label="Profile Name"
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            size="medium"
            variant="outlined"
            sx={{ flex: 2, minWidth: 120 }}
          />
          <FormControl size="medium" sx={{ flex: 1, minWidth: 120 }}>
            <InputLabel>Profile Type</InputLabel>
            <Select
              value={profileType}
              label="Profile Type"
              onChange={e => setProfileType(e.target.value)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="management">Management</MenuItem>
              <MenuItem value="executive">Executive</MenuItem>
              <MenuItem value="general">General</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Button
          variant="contained"
          onClick={handleAddProfile}
          sx={{
            width: { xs: '100%', sm: 180 },
            fontWeight: 700,
            fontSize: '1.08rem',
            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
            color: '#fff',
            boxShadow: 1,
            textTransform: 'uppercase',
            letterSpacing: 1,
            transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
            '&:hover': {
              background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
              transform: 'scale(1.03)',
              boxShadow: 2
            }
          }}
          disabled={!profileName || !profileType}
        >
          Add Profile
        </Button>
      </Card>

      {/* Profiles List */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Profiles ({profiles.length})</Typography>
      {profiles.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 1, width: '100%' }}>
          <Typography color="text.secondary" variant="h6">
            No profiles created yet. Add your first profile above.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2} sx={{ width: '100%' }}>
          {profiles.map((profile) => (
            <Card key={profile.id} sx={{ p: 2, borderRadius: 2, boxShadow: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 100 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{profile.name}</Typography>
                <Chip
                  label={profile.type}
                  color={getTypeColor(profile.type)}
                  size="medium"
                  sx={{ mb: 1, fontWeight: 500 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(profile.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                <IconButton size="medium" onClick={() => handleEditClick(profile)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton size="medium" onClick={() => handleDeleteProfile(profile.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="Profile Name"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Profile Type</InputLabel>
            <Select
              value={editType}
              label="Profile Type"
              onChange={e => setEditType(e.target.value)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="management">Management</MenuItem>
              <MenuItem value="executive">Executive</MenuItem>
              <MenuItem value="general">General</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileManager; 