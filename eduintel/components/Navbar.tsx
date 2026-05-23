'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 hover:text-indigo-600 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg tracking-tight">EduIntel</span>
          <span className="text-xs text-slate-400 font-normal hidden sm:inline">Institutional Intelligence</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              pathname === '/' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              pathname === '/settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            Settings
          </Link>
        </nav>

        {/* CTA */}
        <Link href="/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Research
          </Button>
        </Link>
      </div>
    </header>
  );
}
