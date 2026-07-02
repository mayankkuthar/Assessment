import React, { useState } from 'react';
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';

const ProfileManager = ({ profiles, addProfile, updateProfile, deleteProfile }) => {
  const [profileName, setProfileName] = useState('');
  const [profileType, setProfileType] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');

  const handleAddProfile = async (e) => {
    e.preventDefault();
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

  const handleEditSave = async (e) => {
    e.preventDefault();
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
      'general': 'outline'
    };
    return colors[type] || 'outline';
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Add Profile Form */}
      <div className="section-card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 className="section-card__header">Add New Profile</h3>
        <form onSubmit={handleAddProfile} style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label">Profile Name</label>
            <input
              type="text"
              className="form-input"
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
            <label className="form-label">Profile Type</label>
            <select
              className="form-input"
              value={profileType}
              onChange={e => setProfileType(e.target.value)}
            >
              <option value="" disabled>Select Type</option>
              <option value="student">Student</option>
              <option value="employee">Employee</option>
              <option value="management">Management</option>
              <option value="executive">Executive</option>
              <option value="general">General</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="btn btn--primary" 
            disabled={!profileName || !profileType}
            style={{ height: '42px', padding: '0 var(--space-6)' }}
          >
            <AddIcon className="btn-icon" />
            Add Profile
          </button>
        </form>
      </div>

      {/* Profiles List */}
      <h3 className="section-card__header" style={{ marginBottom: 'var(--space-4)' }}>Profiles ({profiles.length})</h3>
      
      {profiles.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No profiles created yet</p>
          <p className="empty-state__subtitle">Add your first profile above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {profiles.map((profile) => (
            <div key={profile.id} className="list-item" style={{ alignItems: 'center' }}>
              <div className="list-item__content">
                <div className="list-item__title">{profile.name}</div>
                <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className={`badge badge--${getTypeColor(profile.type)}`}>
                    {profile.type}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)' }}>
                    Created: {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button 
                  className="btn btn--outline" 
                  onClick={() => handleEditClick(profile)} 
                  style={{ padding: 'var(--space-2)', minWidth: 'auto' }}
                  title="Edit"
                >
                  <EditIcon style={{ width: '20px', height: '20px' }} />
                </button>
                <button 
                  className="btn btn--outline" 
                  onClick={() => handleDeleteProfile(profile.id)} 
                  style={{ padding: 'var(--space-2)', minWidth: 'auto', color: 'var(--color-destructive)', borderColor: 'var(--color-destructive)' }}
                  title="Delete"
                >
                  <DeleteIcon style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog (Modal) */}
      {editDialogOpen && (
        <div className="overlay overlay--visible" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, background: 'rgba(0,0,0,0.6)' }}>
          <div className="auth-card" style={{ maxWidth: '500px', margin: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Edit Profile</h2>
              <button onClick={handleEditCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-fg)' }}>
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="form-group">
                <label className="form-label">Profile Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Profile Type</label>
                <select
                  className="form-input"
                  value={editType}
                  onChange={e => setEditType(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="employee">Employee</option>
                  <option value="management">Management</option>
                  <option value="executive">Executive</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn--outline" onClick={handleEditCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={!editName || !editType}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;