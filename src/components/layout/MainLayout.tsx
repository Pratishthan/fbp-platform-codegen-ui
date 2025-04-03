import { ReactNode } from 'react';
import { AppBar, Box, Container, Toolbar, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { useAppStore } from '@/store/useAppStore';

interface MainLayoutProps {
  children: ReactNode;
}

const steps = [
  'Initial Setup',
  'Specification Editor',
  'Review & Submit'
];

export default function MainLayout({ children }: MainLayoutProps) {
  const currentStep = useAppStore((state) => state.currentStep);

  return (
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

        {children}
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} FBP Platform
          </Typography>
        </Container>
      </Box>
    </Box>
  );
} 