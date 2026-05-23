'use client';
import { useState } from 'react';
import { Institution, ManagementContact, CONTACT_CATEGORY_LABELS, CONTACT_CATEGORY_COLORS } from '@/types/institution';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Copy, Flag, AlertTriangle } from 'lucide-react';
import { copyToClipboard, formatPhone } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props { institution: Institution; onUpdate?: (contacts: ManagementContact[]) => void }

function ContactCard({ contact, onFlag }: { contact: ManagementContact; onFlag: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, type: string) => {
    await copyToClipboard(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const confColor = contact.confidence === 'high'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : contact.confidence === 'medium'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-700 border-red-200';

  return (
    <Card className={cn('border', contact.flaggedForReview ? 'border-amber-300 bg-amber-50/20' : '')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 text-sm truncate">{contact.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{contact.designation}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${confColor}`}>
              {contact.confidence.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${CONTACT_CATEGORY_COLORS[contact.category]}`}>
            {CONTACT_CATEGORY_LABELS[contact.category]}
          </span>
        </div>

        {contact.qualification && (
          <p className="text-xs text-slate-400 mb-2">{contact.qualification}</p>
        )}

        <div className="space-y-1.5">
          {contact.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
              <a href={`mailto:${contact.email}`} className="text-xs text-indigo-600 hover:underline flex-1 truncate">
                {contact.email}
              </a>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-5 w-5"
                onClick={() => copy(contact.email!, 'email')}
                title="Copy email"
              >
                {copied === 'email' ? <span className="text-emerald-500 text-xs">✓</span> : <Copy className="h-2.5 w-2.5" />}
              </Button>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
              <a href={`tel:${contact.phone}`} className="text-xs text-slate-600 hover:underline flex-1">
                {formatPhone(contact.phone)}
              </a>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-5 w-5"
                onClick={() => copy(contact.phone!, 'phone')}
                title="Copy phone"
              >
                {copied === 'phone' ? <span className="text-emerald-500 text-xs">✓</span> : <Copy className="h-2.5 w-2.5" />}
              </Button>
            </div>
          )}
        </div>

        {/* Source + Flag */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400" title={`Source: ${contact.source}`}>
            {contact.source}
          </span>
          {contact.confidence === 'low' && (
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn('h-5 w-5', contact.flaggedForReview ? 'text-amber-500' : 'text-slate-300')}
              onClick={onFlag}
              title="Flag for review"
            >
              <Flag className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TabManagement({ institution, onUpdate }: Props) {
  const { management } = institution;

  const categories = [
    'sponsoring_body', 'academic_leadership', 'administration',
    'placement', 'student_affairs', 'finance', 'admissions', 'board_member'
  ] as const;

  const handleFlag = (id: string) => {
    if (!onUpdate) return;
    const updated = management.map(m =>
      m.id === id ? { ...m, flaggedForReview: !m.flaggedForReview } : m
    );
    onUpdate(updated);
  };

  if (!management.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-slate-300" />
        <p>No management contacts found.</p>
        <p className="text-sm mt-1">Run a crawl or add contacts manually via Edit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map(cat => {
        const contacts = management.filter(m => m.category === cat);
        if (!contacts.length) return null;
        return (
          <div key={cat}>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full inline-block ${CONTACT_CATEGORY_COLORS[cat].split(' ')[0].replace('bg-', 'bg-')}`} />
              {CONTACT_CATEGORY_LABELS[cat]}
              <span className="text-xs font-normal text-slate-400">({contacts.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contacts.map(c => (
                <ContactCard
                  key={c.id}
                  contact={c}
                  onFlag={() => handleFlag(c.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
