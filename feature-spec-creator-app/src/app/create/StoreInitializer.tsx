'use client';

import { useEffect, useRef } from 'react';
import { useAppStore, Microservice } from '@/lib/store'; // Import type and store

interface StoreInitializerProps {
  domainTypes: string[];
  microservices: Microservice[]; // Add microservices prop
}

function StoreInitializer({ domainTypes, microservices }: StoreInitializerProps) {
  // Use a ref to ensure initialization only happens once
  const initialized = useRef(false);
  const setDomainTypes = useAppStore((state) => state.setDomainTypes);
  const setAvailableMicroservices = useAppStore((state) => state.setAvailableMicroservices); // Get microservice setter

  useEffect(() => {
    if (!initialized.current) {
      setDomainTypes(domainTypes);
      setAvailableMicroservices(microservices); // Set microservices in store
      initialized.current = true;
    }
    // Only run once on mount, dependencies ensure correct closure values if needed
  }, [domainTypes, microservices, setDomainTypes, setAvailableMicroservices]);

  return null; // This component doesn't render anything
}

export default StoreInitializer;
