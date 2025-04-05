import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay = ({ message = 'Loading...', fullScreen = false }: LoadingOverlayProps) => {
  return (
    <Box
      sx={{
        position: fullScreen ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'background.paper',
          padding: 3,
          borderRadius: 1,
          boxShadow: 3,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{message}</Typography>
      </Box>
    </Box>
  );
}; 