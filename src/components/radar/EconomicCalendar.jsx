import { useState, useEffect } from 'react';
import { getCached, setCache } from '../../utils/cache';

const FINNHUB_TOKEN = import.meta.env.VITE_FINNHUB_KEY;

async function fetchEconomicCalendar() {
  const cacheKey = 'tr_econ_cal';
  const cached = getCached(cacheKey);
  if (cached) return cached.data;

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/calendar/economic?from=${today}&to=${nextWeek}&token=${FINNHUB_TOKEN}`
    );
    if (!res.ok) return [];
    const data = await res.json();

    const events = (data.economicCalendar || [])
      .filter(e => e.country === 'US' && e.impact >= 2)
      .sort((a, b) => new Date(a.time || a.date) - new Date(b.time || b.date))
      .map(e => ({
        date: e.time || e.date || '',
        event: e.event || '',
        impact: e.impact === 3 ? 'HIGH' : 'MEDIUM',
        previous: e.prev,
        estimate: e.estimate,
        actual: e.actual,
        unit: e.unit || '',
      }));

    setCache(cacheKey, events, 21600000); // 6 hours
    return events;
  } catch {
    return [];
  }
}

function groupByDay(events) {
  const groups = {};
  events.forEach(e => {
    const day = (e.date || '').split(' ')[0] || e.date;
    if (!groups[day]) groups[day] = [];
    groups[day].push(e);
  });
  return groups;
}

export default function EconomicCalendar() {
  const [open, setOpen] = useState(true);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchEconomicCalendar().then(setEvents).finally(() => setLoading(false));
  }, []);

  const grouped = groupByDay(events);
  const days = Object.keys(grouped).sort();

  const formatDay = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr || !dateStr.includes(' ')) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">ECONOMIC CALENDAR</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-6 w-full" />)}
            </div>
          ) : events.length === 0 ? (
            <p className="text-[#666] text-sm">No upcoming economic events</p>
          ) : (
            <div className="space-y-3">
              {days.map(day => (
                <div key={day}>
                  <div className="text-xs font-bold text-[#d0d0dd] mb-1 border-b border-white/5 pb-1">
                    {formatDay(day)}
                  </div>
                  {grouped[day].map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 py-1">
                      <span className={`text-xs mt-0.5 ${ev.impact === 'HIGH' ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`}>
                        {ev.impact === 'HIGH' ? '🔴' : '🟡'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#d0d0dd] leading-snug">{ev.event}</div>
                        <div className="flex gap-3 text-[10px] text-[#666] mt-0.5">
                          {formatTime(ev.date) && <span>{formatTime(ev.date)}</span>}
                          {ev.previous != null && <span>Prev: {ev.previous}{ev.unit}</span>}
                          {ev.estimate != null && <span>Est: {ev.estimate}{ev.unit}</span>}
                          {ev.actual != null && (
                            <span className={ev.actual > (ev.estimate || 0) ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                              Act: {ev.actual}{ev.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export fetch for use in SendToClaude
export { fetchEconomicCalendar };
