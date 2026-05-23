'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage } from '@/lib/storage';
import { AppSettings, INDIAN_STATES } from '@/types/institution';
import { Save, Eye, EyeOff, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({});
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  const set = (field: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    storage.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const json = storage.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduintel_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        storage.importAll(ev.target?.result as string);
        alert('Data imported successfully! Refresh the page to see changes.');
      } catch (err) {
        alert('Import failed: Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    storage.clearAll();
    setConfirmClear(false);
    alert('All data cleared. Redirecting...');
    window.location.href = '/';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure EduIntel preferences and manage your data.</p>
      </div>

      <div className="space-y-6">
        {/* API Key */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Anthropic API Key</h2>
          <p className="text-sm text-slate-500 mb-4">
            Required for AI-powered data extraction during crawls. Your key is stored locally and never sent to our servers.
          </p>
          <div className="space-y-3">
            <div>
              <Label>API Key</Label>
              <div className="relative mt-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={settings.anthropicApiKey || ''}
                  onChange={e => set('anthropicApiKey', e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {settings.anthropicApiKey && (
              <p className="text-xs text-emerald-600">✓ API key configured</p>
            )}
          </div>
        </div>

        {/* Defaults */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Default Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Default State</Label>
              <Select value={settings.defaultState || ''} onValueChange={v => set('defaultState', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select state..." /></SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>PDF Page Size</Label>
              <Select value={settings.pdfPageSize || 'A4'} onValueChange={v => set('pdfPageSize', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save button */}
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>

        {/* Data Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Data Management</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div>
                <p className="font-medium text-sm text-slate-900">Export All Data</p>
                <p className="text-xs text-slate-500">Download all institution data as a JSON backup</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1.5" />
                Export JSON
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div>
                <p className="font-medium text-sm text-slate-900">Import Data</p>
                <p className="text-xs text-slate-500">Restore from a previously exported JSON backup</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1.5" />
                Import JSON
              </Button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/30">
              <div>
                <p className="font-medium text-sm text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Clear All Data
                </p>
                <p className="text-xs text-red-500">Permanently delete all institutions and settings</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                {confirmClear ? 'Click Again to Confirm' : 'Clear All'}
              </Button>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>EduIntel v1.0.0</p>
          <p>Institutional Intelligence Platform for Indian Higher Education</p>
          <p>Data stored locally in your browser — no server required.</p>
        </div>
      </div>
    </div>
  );
}
