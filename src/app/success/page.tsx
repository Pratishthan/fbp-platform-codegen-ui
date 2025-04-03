'use client';

import { Box, Typography, Button, Paper, Link } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prUrl = searchParams.get('prUrl');

  const handleNewFeature = () => {
    router.push('/');
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Feature Created Successfully!
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your feature has been created and a pull request has been opened.
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
            <Typography color="error" sx={{ mb: 3 }}>
              Pull request URL not available
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleNewFeature}
          >
            Create Another Feature
          </Button>
        </Paper>
      </Box>
    </MainLayout>
  );
} 