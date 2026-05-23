'use client';

import { useState, useEffect, useCallback } from 'react';
import { Institution } from '@/types/institution';

const INSTITUTIONS_KEY = 'eduintel_institutions';

export function useInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INSTITUTIONS_KEY);
      if (raw) setInstitutions(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load institutions', e);
    }
    setIsLoaded(true);
  }, []);

  const persist = useCallback((list: Institution[]) => {
    localStorage.setItem(INSTITUTIONS_KEY, JSON.stringify(list));
    setInstitutions(list);
  }, []);

  const addInstitution = useCallback((inst: Institution) => {
    setInstitutions(prev => {
      const next = [inst, ...prev];
      localStorage.setItem(INSTITUTIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateInstitution = useCallback((updated: Institution) => {
    setInstitutions(prev => {
      const next = prev.map(i => i.id === updated.id ? updated : i);
      localStorage.setItem(INSTITUTIONS_KEY, JSON.stringify(next));
      // Also update the individual key
      localStorage.setItem(`eduintel_institution_${updated.id}`, JSON.stringify(updated));
      return next;
    });
  }, []);

  const deleteInstitution = useCallback((id: string) => {
    setInstitutions(prev => {
      const next = prev.filter(i => i.id !== id);
      localStorage.setItem(INSTITUTIONS_KEY, JSON.stringify(next));
      localStorage.removeItem(`eduintel_institution_${id}`);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('eduintel_'));
    keys.forEach(k => localStorage.removeItem(k));
    setInstitutions([]);
  }, []);

  return { institutions, isLoaded, addInstitution, updateInstitution, deleteInstitution, clearAll, persist };
}
