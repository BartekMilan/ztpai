import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  styled,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  fontSize: '2rem',
}));

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(user?.firstName || '');

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await updateProfile({
        firstName: editedFirstName,
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getInitials = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  if (!user) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <StyledAvatar
          sx={{
            bgcolor: 'primary.main',
          }}
        >
          {user?.firstName ? getInitials(user.firstName) : '?'}
        </StyledAvatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{user?.firstName || user?.username}</Typography>
          <Typography color="textSecondary">{user?.email}</Typography>
          <Box sx={{ mt: 1 }}>
            <Chip label="Task Manager" size="small" />
          </Box>
        </Box>
        <Button
          variant="outlined"
          onClick={() => setIsEditDialogOpen(true)}
        >
          Edit Profile
        </Button>
      </Box>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={editedFirstName}
              onChange={(e) => setEditedFirstName(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;