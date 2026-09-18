import { STATUS_COLORS, URGENCY_COLORS } from '@/lib/status-colors';
import { MapPin, Clock, User, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

// Mock — replaced by useRequest(id) when API is wired
const MOCK_REQUEST = {
  id: '1',
  description: 'Need food supplies for 3 days — family of 4, my wife is diabetic and requires low-sugar meals. We are located in the flood-affected area.',
  location: 'Sector 7, Nagpur',
  status: 'IN_PROGRESS',
  urgency: 'HIGH',
  category: 'Food & Nutrition',
  aiSummary: 'Urgent food supply request for a family with specific medical dietary needs. Requires immediate volunteer response.',
  confidence: 0.87,
  createdAt: '2 hours ago',
  volunteer: { name: 'Rahul M.', phone: '+91 98765 XXXXX', rating: 4.8 },
  timeline: [
    { status: 'REQUESTED', label: 'Request submitted', time: '2 hrs ago', done: true },
    { status: 'AI_ANALYZED', label: 'AI analyzed & classified', time: '2 hrs ago', done: true },
    { status: 'MATCHING', label: 'Matching volunteers', time: '1 hr 50m ago', done: true },
    { status: 'ASSIGNED', label: 'Volunteer assigned', time: '1 hr 45m ago', done: true },
    { status: 'ACCEPTED', label: 'Volunteer accepted', time: '1 hr 40m ago', done: true },
    { status: 'IN_PROGRESS', label: 'Help in progress', time: '30m ago', done: true },
    { status: 'COMPLETED', label: 'Completed', time: null, done: false },
  ],
};

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const req = MOCK_REQUEST; // TODO: replace with useRequest(params.id)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[var(--color-muted)] text-xs" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              REQ-{req.id.padStart(5, '0')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${URGENCY_COLORS[req.urgency]}`}>
              {req.urgency}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status]}`}>
              {req.status.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Request Detail
          </h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-inter)' }}>Description</h2>
            <p className="text-[var(--color-text)] text-sm leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>{req.description}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-inter)' }}>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.location}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {req.createdAt}</span>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-[var(--color-card)] p-5 space-y-3" style={{
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
            border: '1px solid rgba(124, 58, 237, 0.3)'
          }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary-ai)]" style={{ fontFamily: 'var(--font-orbitron)' }}>AI Analysis</h2>
            <p className="text-[var(--color-muted)] text-sm" style={{ fontFamily: 'var(--font-inter)' }}>{req.aiSummary}</p>
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-inter)' }}>
              Confidence:
              <span style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--color-secondary-ai)' }}>
                {Math.round(req.confidence * 100)}%
              </span>
              <span className="bg-[var(--color-border)] text-[var(--color-text)] px-2 py-0.5 rounded-full text-xs">{req.category}</span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-inter)' }}>Timeline</h2>
            <div className="space-y-3">
              {req.timeline.map((step, i) => (
                <div key={step.status} className="flex items-center gap-3">
                  {step.done
                    ? <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                    : <Circle className="w-4 h-4 text-[var(--color-border)] shrink-0" />}
                  <div className="flex-1">
                    <span className={`text-sm ${step.done ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}
                      style={{ fontFamily: 'var(--font-inter)' }}>
                      {step.label}
                    </span>
                  </div>
                  {step.time && (
                    <span className="text-xs text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                      {step.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Volunteer card */}
        {req.volunteer && (
          <div className="bg-[var(--color-card)] p-5 h-fit" style={{
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
            border: '1px solid var(--color-border)'
          }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>Assigned Volunteer</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <div className="text-[var(--color-text)] font-semibold text-sm" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  {req.volunteer.name}
                </div>
                <div className="text-xs text-amber-400" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                  ★ {req.volunteer.rating}
                </div>
              </div>
            </div>
            <div className="text-xs text-[var(--color-muted)] bg-[var(--color-surface)] rounded-lg px-3 py-2" style={{ fontFamily: 'var(--font-inter)' }}>
              {req.volunteer.phone}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
