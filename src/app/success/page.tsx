'use client';

import { Box, Typography, Button, Paper, Link } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetFeatureState } = useAppStore();
  const prUrl = searchParams.get('prUrl');

  const handleNewFeature = () => {
    resetFeatureState();
    router.push('/');
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom color="success.main">
            Success!
          </Typography>
          <Typography variant="body1" paragraph>
            Your feature has been successfully created and submitted.
          </Typography>

          {prUrl ? (
            <Box sx={{ mb: 3 }}>
              <Link
                href={prUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: '1.1rem' }}
              >
                View Pull Request
              </Link>
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Pull request URL not available
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleNewFeature}
            sx={{ mt: 2 }}
          >
            Create Another Feature
          </Button>
        </Paper>
      </Box>
    </MainLayout>
  );
} 