import { Paper, Typography, Box, styled } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

const StyledPaper = styled(Paper)<{ active: number }>(({ theme, active }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
  border: `2px solid ${active ? theme.palette.primary.main : 'transparent'}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 8px rgba(0, 0, 0, 0.4)'
      : '0 4px 8px rgba(9, 30, 66, 0.25)',
  },
}));

interface TaskFilterTileProps {
  icon: SvgIconComponent;
  label: string;
  value: number;
  color: string;
  onClick: () => void;
  active: boolean;
}

const TaskFilterTile = ({ 
  icon: Icon, 
  label, 
  value, 
  color,
  onClick,
  active,
}: TaskFilterTileProps) => {
  return (
    <StyledPaper 
      onClick={onClick} 
      active={active ? 1 : 0}
      sx={{
        position: 'relative',
        '&::after': active ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: color,
          opacity: 0.1,
          borderRadius: 'inherit',
        } : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon sx={{ color, mr: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 500, color }}>
        {value}
      </Typography>
    </StyledPaper>
  );
};

export default TaskFilterTile;