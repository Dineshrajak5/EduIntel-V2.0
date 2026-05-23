import { Institution, AppSettings } from '@/types/institution';

const KEYS = {
  INSTITUTIONS: 'eduintel_institutions',
  INSTITUTION: (id: string) => `eduintel_institution_${id}`,
  SETTINGS: 'eduintel_settings',
};

export const storage = {
  getInstitutions(): Institution[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KEYS.INSTITUTIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getInstitution(id: string): Institution | null {
    if (typeof window === 'undefined') return null;
    try {
      const individual = localStorage.getItem(KEYS.INSTITUTION(id));
      if (individual) return JSON.parse(individual);
      const list = this.getInstitutions();
      return list.find(i => i.id === id) ?? null;
    } catch {
      return null;
    }
  },

  saveInstitution(inst: Institution): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.INSTITUTION(inst.id), JSON.stringify(inst));
    const list = this.getInstitutions();
    const idx = list.findIndex(i => i.id === inst.id);
    if (idx >= 0) list[idx] = inst; else list.unshift(inst);
    localStorage.setItem(KEYS.INSTITUTIONS, JSON.stringify(list));
  },

  deleteInstitution(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.INSTITUTION(id));
    const list = this.getInstitutions().filter(i => i.id !== id);
    localStorage.setItem(KEYS.INSTITUTIONS, JSON.stringify(list));
  },

  getSettings(): AppSettings {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveSettings(settings: AppSettings): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportAll(): string {
    if (typeof window === 'undefined') return '{}';
    const institutions = this.getInstitutions();
    const settings = this.getSettings();
    return JSON.stringify({ institutions, settings, exportedAt: new Date().toISOString() }, null, 2);
  },

  importAll(json: string): void {
    const data = JSON.parse(json);
    if (data.institutions) {
      localStorage.setItem(KEYS.INSTITUTIONS, JSON.stringify(data.institutions));
      (data.institutions as Institution[]).forEach((inst: Institution) => {
        localStorage.setItem(KEYS.INSTITUTION(inst.id), JSON.stringify(inst));
      });
    }
    if (data.settings) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
    }
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage).filter(k => k.startsWith('eduintel_'));
    keys.forEach(k => localStorage.removeItem(k));
  },
};
