import { Box, CircularProgress, Typography, keyframes, styled } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`;

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  animation: `${pulse} 2s ease-in-out infinite`,
  '& svg': {
    fontSize: '2.5rem',
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const LoadingScreen = () => {
  return (
    <LoadingContainer>
      <LogoContainer>
        <DashboardIcon />
        <Typography variant="h4" sx={{ fontWeight: 500, color: 'primary.main' }}>
          TaskFlow
        </Typography>
      </LogoContainer>
      <CircularProgress
        size={40}
        thickness={4}
        sx={{
          color: 'primary.main',
          mb: 2,
        }}
      />
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
        }}
      >
        Loading your workspace...
      </Typography>
    </LoadingContainer>
  );
};

export default LoadingScreen;