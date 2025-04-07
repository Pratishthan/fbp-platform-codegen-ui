'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import EntityForm from '@/components/EntityForm'; // Import the form component

export default function StandaloneEntityStepPage() {
  const router = useRouter();
  const params = useParams();

  // Extract entityId from URL parameters. It will be 'new' for adding.
  const entityIdParam = params.entityId as string; // e.g., 'some-uuid' or 'new'

  // Determine if we are adding a new entity or editing an existing one
  const entityId = entityIdParam === 'new' ? null : entityIdParam;

  // Function to handle closing the form (navigate back to the list)
  const handleClose = () => {
    router.push('/create/standalone-entities');
  };

  return (
    <div className="container mx-auto p-4">
      {/* Render the EntityForm, passing the entityId and onClose handler */}
      <EntityForm entityId={entityId} onClose={handleClose} />
    </div>
  );
}
