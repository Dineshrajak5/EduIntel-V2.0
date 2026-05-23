import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'EduIntel — Institutional Intelligence Platform',
  description: 'Institutional Intelligence Platform for Indian Higher Education',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-400">
          EduIntel — Institutional Intelligence Platform for Indian Higher Education
        </footer>
      </body>
    </html>
  );
}
