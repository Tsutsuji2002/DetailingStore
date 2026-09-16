import React from 'react';
import { FiClock } from 'react-icons/fi';

// ── Time Presets ──────────────────────────────────────────────────────────────

export const TIME_PRESETS = {
  morning: { label: 'Buổi sáng', start: '07:30', end: '11:00' },
  afternoon: { label: 'Buổi chiều', start: '13:00', end: '17:00' },
  custom: { label: 'Tùy chỉnh', start: null, end: null },
} as const;

export type TimePresetKey = keyof typeof TIME_PRESETS;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Combines a YYYY-MM-DD date string with an HH:mm time string into a local
 * ISO datetime string (e.g. "2025-09-01T07:30:00").
 */
function combineDateAndTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

/**
 * Computes a smart default start datetime when switching to custom mode.
 *
 * Rules:
 * - Round current time UP to the next 30-minute boundary
 *   e.g. 12:17 → 12:30, 12:30 → 13:00, 12:00 → 12:00 (exact boundary stays)
 * - If the resulting time is 17:00 or later (past business hours cutoff),
 *   jump to NEXT day at 07:30 instead.
 * - End time = start time + 3 hours (no business-hour capping).
 *
 * Returns { start: string, end: string } as "YYYY-MM-DDTHH:mm" strings
 * suitable for datetime-local inputs.
 */
function getSmartCustomDefaults(): { start: string; end: string } {
  const now = new Date();

  // Round up to the next 30-minute boundary using millisecond arithmetic
  // This correctly handles midnight overflow.
  const MS_30MIN = 30 * 60 * 1000;
  const nowMs = now.getTime();
  // How many ms past the last 30-min boundary?
  const msSinceLast = nowMs % MS_30MIN;
  // Round up: if exactly on a boundary, stay; otherwise jump to next
  const rounded = new Date(
    msSinceLast === 0 ? nowMs : nowMs + (MS_30MIN - msSinceLast)
  );
  rounded.setSeconds(0, 0);

  // If rounded time is 17:00 or later, jump to next day 07:30
  // Cutoff: hour >= 17 means past or at 17:00
  let start: Date;
  if (rounded.getHours() >= 17) {
    start = new Date(rounded);
    start.setDate(start.getDate() + 1);
    start.setHours(7, 30, 0, 0);
  } else {
    start = rounded;
  }

  // End = start + 3 hours
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

  // Format as "YYYY-MM-DDTHH:mm" for datetime-local input
  const fmt = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return { start: fmt(start), end: fmt(end) };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TimeSlotPickerProps {
  /** YYYY-MM-DD – the date for the work order */
  date: string;
  /** 'morning' | 'afternoon' | 'custom' */
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  /** ISO datetime string or empty – used when preset is 'custom' */
  customStartTime?: string;
  /** ISO datetime string or empty – used when preset is 'custom' */
  customEndTime?: string;
  onCustomTimeChange: (start: string, end: string) => void;
  /** Called for both preset and custom changes with resolved start/end times */
  onTimeChange: (startTime: string, endTime: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  date,
  selectedPreset,
  onPresetChange,
  customStartTime = '',
  customEndTime = '',
  onCustomTimeChange,
  onTimeChange,
}) => {
  const handlePresetClick = (key: string) => {
    onPresetChange(key);

    if (key === 'custom') {
      // Only set defaults if inputs are currently empty (don't overwrite user's existing values)
      if (!customStartTime && !customEndTime) {
        const { start, end } = getSmartCustomDefaults();
        onCustomTimeChange(start, end);
        onTimeChange(start, end);
      }
    } else if (date) {
      const preset = TIME_PRESETS[key as TimePresetKey];
      if (preset.start && preset.end) {
        const start = combineDateAndTime(date, preset.start);
        const end = combineDateAndTime(date, preset.end);
        onTimeChange(start, end);
      }
    }
  };

  const handleCustomStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    onCustomTimeChange(newStart, customEndTime);

    // Only emit if both are set and end > start
    if (newStart && customEndTime && customEndTime > newStart) {
      onTimeChange(newStart, customEndTime);
    }
  };

  const handleCustomEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    onCustomTimeChange(customStartTime, newEnd);

    // Only emit if both are set and end > start
    if (customStartTime && newEnd && newEnd > customStartTime) {
      onTimeChange(customStartTime, newEnd);
    }
  };

  const isCustom = selectedPreset === 'custom';
  const customEndError =
    isCustom && customStartTime && customEndTime && customEndTime <= customStartTime;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <FiClock style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Khung giờ
        </span>
      </div>

      {/* Preset button group */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        {(Object.keys(TIME_PRESETS) as TimePresetKey[]).map((key) => {
          const preset = TIME_PRESETS[key];
          const isActive = selectedPreset === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handlePresetClick(key)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: isActive ? 'none' : '1px solid var(--border-color)',
                background: isActive ? 'var(--accent-gradient)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-primary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(var(--accent-rgb, 99 102 241), 0.35)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {preset.label}
              {key !== 'custom' && preset.start && (
                <span
                  style={{
                    marginLeft: '0.35rem',
                    fontSize: '0.78rem',
                    opacity: isActive ? 0.85 : 0.55,
                  }}
                >
                  ({preset.start}–{preset.end})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom time inputs */}
      {isCustom && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '0.75rem',
            background: 'var(--bg-secondary)',
            borderRadius: 10,
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Thời gian bắt đầu
            </label>
            <input
              type="datetime-local"
              value={customStartTime}
              onChange={handleCustomStartChange}
              style={{
                padding: '0.5rem 0.65rem',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Thời gian kết thúc
            </label>
            <input
              type="datetime-local"
              value={customEndTime}
              onChange={handleCustomEndChange}
              style={{
                padding: '0.5rem 0.65rem',
                borderRadius: 8,
                border: `1px solid ${customEndError ? '#ef4444' : 'var(--border-color)'}`,
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            {customEndError && (
              <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                Thời gian kết thúc phải sau thời gian bắt đầu
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
