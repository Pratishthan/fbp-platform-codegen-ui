import { ReactNode } from 'react';
import { AppBar, Box, Container, Toolbar, Typography, Stepper, Step, StepLabel, Alert } from '@mui/material';
import { useAppStore } from '@/store/useAppStore';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';

const drawerWidth = 240;

interface MainLayoutProps {
  children: ReactNode;
}

const steps = [
  'Initial Setup',
  'OpenAPI Editor',
  'Entity Specifications',
  'Review & Submit'
];

export default function MainLayout({ children }: MainLayoutProps) {
  const { currentStep, isLoading, loadingMessage, error, setError } = useAppStore();

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div">
              FBP Platform Codegen UI
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={currentStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
            }}
          >
            <Toolbar />
            {children}
          </Box>
        </Container>

        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} FBP Platform
            </Typography>
          </Container>
        </Box>

        {isLoading && <LoadingOverlay message={loadingMessage} fullScreen />}
      </Box>
    </ErrorBoundary>
  );
} 