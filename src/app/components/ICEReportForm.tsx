import { AlertTriangle, X, MapPin, Clock, FileText, Users, UserCheck } from 'lucide-react';
import { useState } from 'react';
import type { ICEReport } from '../models/ICEReport.ts';

export type { ICEReport };

type ICEReportFormProps = {
  onClose: () => void;
  onSubmit: (report: ICEReport) => void;
};

type FormErrors = Partial<Record<keyof ICEReport | 'time', string>>;

const DESCRIPTION_MAX = 500;

// UX: Chunking (Miller's Law) — fields are grouped into three clear sections
const inputClass =
  'w-full px-3 py-2.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500';

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="mt-1 text-xs font-medium" style={{ color: '#dc2626' }}>
      {msg}
    </p>
  );
}

function SectionHeading({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 mb-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <Icon size={15} style={{ color: 'var(--primary)' }} />
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--foreground-muted)' }}>
        {label}
      </span>
    </div>
  );
}

export function ICEReportForm({ onClose, onSubmit }: ICEReportFormProps) {
  const [formData, setFormData] = useState({
    location: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    vehicleDescription: '',
    numberOfOfficers: '',
    isAnonymous: true,
    contactInfo: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});
  const [showSafetyTips, setShowSafetyTips] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const validate = (data: typeof formData): FormErrors => {
    const e: FormErrors = {};
    if (!data.location.trim()) e.location = 'Location is required — be as specific as possible.';
    if (!data.date) e.date = 'Date is required.';
    if (!data.time) e.time = 'Time is required.';
    if (!data.description.trim()) {
      e.description = 'Description is required.';
    } else if (data.description.trim().length < 15) {
      e.description = 'Please provide more detail (at least 15 characters).';
    }
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = { location: true, date: true, time: true, description: true };
    setTouched(allTouched);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const report: ICEReport = {
      id: Date.now().toString(),
      ...formData,
      timestamp: new Date(),
    };
    onSubmit(report);
    onClose();
  };

  const inputStyle = {
    backgroundColor: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#dc2626',
  };

  const labelStyle = { color: 'var(--foreground-muted)' };

  return (
    // UX: User Control and Freedom — Escape key handled in App.tsx; backdrop click also closes
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ice-report-title"
    >
      <div
        className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 sticky top-0 z-10"
          style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 id="ice-report-title" className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              Report ICE Activity
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-opacity hover:opacity-70"
            aria-label="Close dialog"
          >
            <X size={20} style={{ color: 'var(--foreground-muted)' }} />
          </button>
        </div>

        {/* UX: Recognition over Recall — safety reminders stay visible until dismissed */}
        {showSafetyTips && (
          <div
            className="mx-4 mt-4 border-l-4 border-yellow-500 p-4 rounded-xl"
            style={{ backgroundColor: 'var(--gold-light)' }}
            role="note"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
                  ⚠️ Safety First:
                </p>
                <ul className="text-xs space-y-1" style={{ color: 'var(--foreground-muted)' }}>
                  <li>• Report only what you directly witnessed</li>
                  <li>• Do not approach officers or interfere with operations</li>
                  <li>• Your report will be shared with the community</li>
                  <li>• Anonymous reports help keep everyone safe</li>
                </ul>
              </div>
              <button
                onClick={() => setShowSafetyTips(false)}
                className="hover:opacity-70 transition-opacity ml-3 flex-shrink-0"
                style={{ color: 'var(--gold)' }}
                aria-label="Dismiss safety tips"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>

          {/* ── Section 1: Where & When ── */}
          <fieldset>
            <SectionHeading icon={MapPin} label="Where & When" />
            <div className="space-y-4">
              <div>
                <label htmlFor="ice-location" className="block text-sm font-medium mb-1" style={labelStyle}>
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="ice-location"
                  type="text"
                  required
                  aria-required="true"
                  aria-describedby={errors.location && touched.location ? 'ice-location-error' : undefined}
                  aria-invalid={!!(errors.location && touched.location)}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  onBlur={() => handleBlur('location')}
                  placeholder="e.g., Corner of Main St and 5th Ave, near City Hall"
                  className={inputClass}
                  style={errors.location && touched.location ? errorInputStyle : inputStyle}
                />
                <FieldError msg={touched.location ? errors.location : undefined} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ice-date" className="block text-sm font-medium mb-1" style={labelStyle}>
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ice-date"
                    type="date"
                    required
                    aria-required="true"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    onBlur={() => handleBlur('date')}
                    className={inputClass}
                    style={errors.date && touched.date ? errorInputStyle : inputStyle}
                  />
                  <FieldError msg={touched.date ? errors.date : undefined} />
                </div>
                <div>
                  <label htmlFor="ice-time" className="block text-sm font-medium mb-1" style={labelStyle}>
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ice-time"
                    type="time"
                    required
                    aria-required="true"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    onBlur={() => handleBlur('time')}
                    className={inputClass}
                    style={errors.time && touched.time ? errorInputStyle : inputStyle}
                  />
                  <FieldError msg={touched.time ? errors.time : undefined} />
                </div>
              </div>
            </div>
          </fieldset>

          {/* ── Section 2: What Happened ── */}
          <fieldset>
            <SectionHeading icon={FileText} label="What Happened" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label htmlFor="ice-description" className="block text-sm font-medium" style={labelStyle}>
                    Description <span className="text-red-500">*</span>
                  </label>
                  {/* UX: Error Prevention — character counter */}
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: formData.description.length > DESCRIPTION_MAX * 0.9 ? '#dc2626' : 'var(--foreground-muted)' }}
                    aria-live="polite"
                  >
                    {formData.description.length}/{DESCRIPTION_MAX}
                  </span>
                </div>
                <textarea
                  id="ice-description"
                  required
                  aria-required="true"
                  aria-describedby={errors.description && touched.description ? 'ice-desc-error' : undefined}
                  aria-invalid={!!(errors.description && touched.description)}
                  value={formData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= DESCRIPTION_MAX) {
                      setFormData({ ...formData, description: e.target.value });
                    }
                  }}
                  onBlur={() => handleBlur('description')}
                  rows={4}
                  placeholder="Describe what you observed: officer activity, checkpoints, vehicles, etc."
                  className={inputClass}
                  style={errors.description && touched.description ? errorInputStyle : inputStyle}
                />
                <FieldError msg={touched.description ? errors.description : undefined} />
              </div>

              <div>
                <label htmlFor="ice-vehicle" className="block text-sm font-medium mb-1" style={labelStyle}>
                  Vehicle Description <span className="text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="ice-vehicle"
                  type="text"
                  value={formData.vehicleDescription}
                  onChange={(e) => setFormData({ ...formData, vehicleDescription: e.target.value })}
                  placeholder="e.g., White van, unmarked sedan, black SUV"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="ice-officers" className="block text-sm font-medium mb-1" style={labelStyle}>
                  Number of Officers <span className="text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="ice-officers"
                  type="text"
                  value={formData.numberOfOfficers}
                  onChange={(e) => setFormData({ ...formData, numberOfOfficers: e.target.value })}
                  placeholder="e.g., 2–3 officers"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
          </fieldset>

          {/* ── Section 3: About You ── */}
          <fieldset>
            <SectionHeading icon={Users} label="About You" />
            <div className="space-y-3">
             

              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="w-4 h-4 rounded accent-red-600"
                  />
                  <div>
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      Submit anonymously
                    </span>
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ backgroundColor: '#10b98120', color: '#10b981' }}
                    >
                      Recommended
                    </span>
                  </div>
                </label>

                {!formData.isAnonymous && (
                  <div className="mt-3">
                    <label htmlFor="ice-contact" className="flex items-center gap-1.5 text-sm font-medium mb-1" style={labelStyle}>
                      <UserCheck size={14} />
                      Contact Information
                    </label>
                    <input
                      id="ice-contact"
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                      placeholder="Phone or email (optional)"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* UX: Fitts's Law — buttons are full-width and tall for easy tapping */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-80"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--surface-raised)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#dc2626' }}
            >
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
