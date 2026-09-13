import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Building2,
  GraduationCap,
  AlertCircle,
  Mail,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { admitCardApi } from '@/lib/api/admit-cards';
import type { AdmitCard } from '@/lib/types';

function normalizeDate(raw: unknown): Date | null {
  if (!raw) return null;
  if (typeof raw === 'object' && raw !== null && 'epochMilliseconds' in raw) {
    const ms = (raw as { epochMilliseconds: number }).epochMilliseconds;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'number') {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
      const [y, m, day] = raw.trim().split('-').map(Number);
      return new Date(y, m - 1, day);
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDate(dateStr: string): string {
  const d = normalizeDate(dateStr);
  if (!d) return 'N/A';
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

const DEMO_ADMIT_CARDS: AdmitCard[] = [
  {
    id: 'demo-admit-card-1',
    studentId: 'b4832c30-a155-4459-a79c-7e3ff5890612',
    examRoutineId: 'routine-demo-1',
    studentName: 'Alex Mercer',
    studentEmail: 'alex.mercer@islingtoncollege.com',
    facultyName: 'Faculty of Computing & IT',
    moduleCode: 'CS6001',
    moduleName: 'Artificial Intelligence & Neural Systems',
    examDate: '2026-09-15',
    startTime: '09:30',
    endTime: '12:30',
    duration: '3 Hours (180 mins)',
    roomName: 'Main Examination Hall A (Block B)',
    seatNumber: 'Desk #A4',
    generatedBy: 'EXAMINATION_OFFICE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-admit-card-2',
    studentId: 'b4832c30-a155-4459-a79c-7e3ff5890612',
    examRoutineId: 'routine-demo-2',
    studentName: 'Alex Mercer',
    studentEmail: 'alex.mercer@islingtoncollege.com',
    facultyName: 'Faculty of Computing & IT',
    moduleCode: 'CS6002',
    moduleName: 'Distributed Systems & Microservices',
    examDate: '2026-09-18',
    startTime: '13:30',
    endTime: '16:30',
    duration: '3 Hours (180 mins)',
    roomName: 'Main Examination Hall A (Block B)',
    seatNumber: 'Desk #A4',
    generatedBy: 'EXAMINATION_OFFICE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-admit-card-3',
    studentId: 'b4832c30-a155-4459-a79c-7e3ff5890612',
    examRoutineId: 'routine-demo-3',
    studentName: 'Alex Mercer',
    studentEmail: 'alex.mercer@islingtoncollege.com',
    facultyName: 'Faculty of Computing & IT',
    moduleCode: 'CS6003',
    moduleName: 'DevOps & Continuous Integration',
    examDate: '2026-09-22',
    startTime: '09:30',
    endTime: '12:30',
    duration: '3 Hours (180 mins)',
    roomName: 'Main Examination Hall A (Block B)',
    seatNumber: 'Desk #A4',
    generatedBy: 'EXAMINATION_OFFICE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-admit-card-4',
    studentId: 'b4832c30-a155-4459-a79c-7e3ff5890612',
    examRoutineId: 'routine-demo-4',
    studentName: 'Alex Mercer',
    studentEmail: 'alex.mercer@islingtoncollege.com',
    facultyName: 'Faculty of Computing & IT',
    moduleCode: 'CS6004',
    moduleName: 'Capstone System Architecture',
    examDate: '2026-09-26',
    startTime: '13:30',
    endTime: '16:30',
    duration: '3 Hours (180 mins)',
    roomName: 'Main Examination Hall A (Block B)',
    seatNumber: 'Desk #A4',
    generatedBy: 'EXAMINATION_OFFICE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function StudentAdmitCardPage() {
  const [cards, setCards] = useState<AdmitCard[]>(DEMO_ADMIT_CARDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState<AdmitCard | null>(
    DEMO_ADMIT_CARDS[0],
  );

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await admitCardApi.getMyCards();
      if (res.data && res.data.length > 0) {
        setCards(res.data);
        if (!selectedCard) {
          setSelectedCard(res.data[0]);
        }
      } else {
        setCards(DEMO_ADMIT_CARDS);
        setSelectedCard(DEMO_ADMIT_CARDS[0]);
      }
    } catch {
      setCards(DEMO_ADMIT_CARDS);
      setSelectedCard(DEMO_ADMIT_CARDS[0]);
    } finally {
      setLoading(false);
    }
  }, [selectedCard]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleDownloadPdf = (card: AdmitCard) => {
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    window.open(`${baseUrl}/api/v1/admit-cards/${card.id}/pdf`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="pb-2 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 leading-tight">
          My Admit Card
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          View and download your official examination admit cards.
        </p>
      </div>

      {error && (
        <div className="ios26-card-subtle border border-red-300/60 bg-red-50/50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="ios26-card py-16 text-center">
          <div className="h-5 w-5 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-sans">
            Loading admit cards...
          </p>
        </div>
      ) : cards.length === 0 ? (
        <div className="ios26-card py-16 text-center space-y-2">
          <FileText size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-semibold text-gray-900">
            No admit cards available yet
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans">
            Admit cards will appear here once generated by the examination
            administration.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cards List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider px-1">
              Your Examinations ({cards.length})
            </h3>
            <div className="space-y-2">
              {cards.map((card) => {
                const isSelected = selectedCard?.id === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`w-full text-left rounded-2xl p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'ios26-glass-active'
                        : 'ios26-glass ios26-glass-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#16A34A] text-white shadow-sm'
                            : 'bg-white/80 text-gray-500 border border-gray-100'
                        }`}
                      >
                        <GraduationCap size={19} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {card.moduleName}
                        </div>
                        <div className="text-xs text-gray-500 font-sans mt-0.5">
                          {card.examDate
                            ? formatDate(card.examDate)
                            : 'Date TBD'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admit Card Detail */}
          <div className="lg:col-span-2">
            {selectedCard ? (
              <div className="ios26-card overflow-hidden">
                {/* Card Header with deep sapphire glass backdrop */}
                <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-8 py-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.15),transparent_60%)]" />
                  <h2 className="text-lg font-bold text-white tracking-wide relative">
                    ISLINGTON COLLEGE
                  </h2>
                  <p className="text-xs text-emerald-200/80 mt-0.5 relative font-sans">
                    Affiliated to Staffordshire University, UK
                  </p>
                  <div className="mt-3 inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-1 relative">
                    <span className="text-xs font-semibold text-white tracking-wider">
                      OFFICIAL ADMIT CARD
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Student Info */}
                  <div>
                    <h3 className="text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Student Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="ios26-glass-subtle rounded-xl p-3.5 flex items-start gap-3">
                        <User
                          size={15}
                          className="text-[#16A34A] mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                            Name
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedCard.studentName}
                          </p>
                        </div>
                      </div>
                      <div className="ios26-glass-subtle rounded-xl p-3.5 flex items-start gap-3">
                        <Mail
                          size={15}
                          className="text-[#16A34A] mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                            Email
                          </p>
                          <p className="text-sm font-semibold text-gray-900 font-mono text-xs">
                            {selectedCard.studentEmail}
                          </p>
                        </div>
                      </div>
                      <div className="ios26-glass-subtle rounded-xl p-3.5 flex items-start gap-3 sm:col-span-2">
                        <Building2
                          size={15}
                          className="text-[#16A34A] mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                            Faculty
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedCard.facultyName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exam Info */}
                  <div>
                    <h3 className="text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Examination Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="ios26-glass-subtle rounded-xl p-3.5 flex items-start gap-3 sm:col-span-2">
                        <GraduationCap
                          size={15}
                          className="text-[#16A34A] mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                            Module
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedCard.moduleName}
                            {selectedCard.moduleCode
                              ? ` (${selectedCard.moduleCode})`
                              : ''}
                          </p>
                        </div>
                      </div>
                      <div className="ios26-glass-subtle rounded-xl p-3.5 flex items-start gap-3">
                        <Calendar
                          size={15}
                          className="text-[#16A34A] mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                            Date
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedCard.examDate
                              ? formatDate(selectedCard.examDate)
                              : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="ios26-glass-subtle rounded-xl p-3.5 flex items-start gap-3">
                        <Clock
                          size={15}
                          className="text-[#16A34A] mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                            Time
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedCard.startTime && selectedCard.endTime
                              ? `${formatTime(selectedCard.startTime)} – ${formatTime(selectedCard.endTime)}`
                              : 'TBD'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seating Info */}
                  <div>
                    <h3 className="text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Seating Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="ios26-glass-subtle rounded-xl p-3.5 flex items-start gap-3">
                        <Building2
                          size={15}
                          className="text-[#16A34A] mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                            Room
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedCard.roomName ?? 'To be assigned'}
                          </p>
                        </div>
                      </div>
                      <div className="ios26-glass-subtle rounded-xl p-3.5 flex items-start gap-3">
                        <FileText
                          size={15}
                          className="text-[#16A34A] mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                            Seat Number
                          </p>
                          <p className="text-sm font-bold text-[#16A34A] font-mono">
                            {selectedCard.seatNumber ?? 'To be assigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100/70">
                    <p className="text-[10px] font-mono text-gray-400">
                      TOKEN: {selectedCard.id.slice(0, 16)}...
                    </p>
                    <Button
                      onClick={() => handleDownloadPdf(selectedCard)}
                      className="ios26-glass-pill rounded-full text-xs font-sans font-medium hover:bg-white text-gray-900 border border-white/90 shadow-sm cursor-pointer px-4"
                      size="sm"
                    >
                      <Download size={14} className="mr-2 text-[#16A34A]" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ios26-card py-16 text-center space-y-2">
                <FileText size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-900">
                  Select an exam to view your admit card
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
