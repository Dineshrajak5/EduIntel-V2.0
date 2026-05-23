'use client';

import { useState, useEffect, useCallback } from 'react';
import { Institution } from '@/types/institution';

export function useInstitution(id: string) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    try {
      // Try individual key first
      const individual = localStorage.getItem(`eduintel_institution_${id}`);
      if (individual) {
        setInstitution(JSON.parse(individual));
        setIsLoaded(true);
        return;
      }
      // Fall back to master list
      const raw = localStorage.getItem('eduintel_institutions');
      if (raw) {
        const list: Institution[] = JSON.parse(raw);
        const found = list.find(i => i.id === id);
        if (found) setInstitution(found);
      }
    } catch (e) {
      console.error('Failed to load institution', e);
    }
    setIsLoaded(true);
  }, [id]);

  const update = useCallback((updated: Institution) => {
    setInstitution(updated);
    localStorage.setItem(`eduintel_institution_${id}`, JSON.stringify(updated));
    // Also sync master list
    try {
      const raw = localStorage.getItem('eduintel_institutions');
      if (raw) {
        const list: Institution[] = JSON.parse(raw);
        const next = list.map(i => i.id === id ? updated : i);
        localStorage.setItem('eduintel_institutions', JSON.stringify(next));
      }
    } catch (e) {
      console.error('Failed to sync master list', e);
    }
  }, [id]);

  return { institution, isLoaded, update, setInstitution };
}
