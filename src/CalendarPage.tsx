import React, { useEffect, useState } from 'react';
import * as lunarCalendar from 'vietnamese-lunar-calendar';

const API_URL = 'http://localhost:8080/api/events';

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  color: string;
  type: string;
  memberTags: string;
  recurring: boolean;
  recurringType: string;
};

const TYPE_OPTIONS = [
  { value: 'birthday', label: '🎂 Sinh nhật', color: '#a855f7' },
  { value: 'meeting', label: '👨‍👩‍👧‍👦 Họp gia đình', color: '#3b82f6' },
  { value: 'medical', label: '🏥 Khám bệnh', color: '#ef4444' },
  { value: 'study', label: '📚 Học tập', color: '#f59e0b' },
  { value: 'other', label: '📌 Khác', color: '#6b7280' },
];

const MEMBERS = [
  { id: '1', name: 'Ba' },
  { id: '2', name: 'Mẹ' },
  { id: '3', name: 'Bạn' },
];

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function CalendarPage() {


const getLunarDate = (day: number) => {
  try {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const result = solarToLunar(day, month, year);
    return `${result.lunarDay}`;
  } catch {
    return '';
  }
};

const solarToLunar = (solarDay: number, solarMonth: number, solarYear: number) => {
  const jd = Math.floor((solarDay - 32075 + Math.floor(1461 * (solarYear + 4800 + Math.floor((solarMonth - 14) / 12)) / 4) + Math.floor(367 * (solarMonth - 2 - Math.floor((solarMonth - 14) / 12) * 12) / 12) - Math.floor(3 * Math.floor((solarYear + 4900 + Math.floor((solarMonth - 14) / 12)) / 100) / 4)));
  const l = jd - 1721425;
  const n = Math.floor((l - Math.floor(l / 29.53059)) / 29.53059 + 0.5);
  const lunarDay = l - Math.floor(29.53059 * n + 0.5) + 1;
  return { lunarDay: lunarDay > 0 ? lunarDay : lunarDay + 30 };
};

  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', date: '',
    type: 'other', recurring: false, recurringType: 'yearly',
    memberTags: [] as string[],
  });

  useEffect(() => { fetchEvents(); }, [currentDate]);

  const fetchEvents = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const res = await fetch(`${API_URL}/month?year=${year}&month=${month}`);
    const data = await res.json();
    setEvents(data);
  };

  const handleAddEvent = async () => {
    if (!form.title || !form.date) return;
    const typeInfo = TYPE_OPTIONS.find(t => t.value === form.type);
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        color: typeInfo?.color || '#6b7280',
        memberTags: form.memberTags.join(','),
      }),
    });
    setShowForm(false);
    setForm({ title: '', description: '', date: '', type: 'other', recurring: false, recurringType: 'yearly', memberTags: [] });
    fetchEvents();
  };

  const handleDeleteEvent = async (id: number) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const toggleMember = (id: string) => {
    setForm(f => ({
      ...f,
      memberTags: f.memberTags.includes(id)
        ? f.memberTags.filter(m => m !== id)
        : [...f.memberTags, id],
    }));
  };

  // Tạo các ngày trong tháng
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${d}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDate
    ? events.filter(e => e.date === selectedDate)
    : [];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  return (
    <div style={s.container}>
      {/* Header lịch */}
      <div style={s.calHeader}>
        <button style={s.navBtn} onClick={prevMonth}>‹</button>
        <h2 style={s.monthTitle}>
          Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}
        </h2>
        <button style={s.navBtn} onClick={nextMonth}>›</button>
      </div>

      {/* Ngày trong tuần */}
      <div style={s.weekRow}>
        {DAYS.map(d => <div key={d} style={s.weekDay}>{d}</div>)}
      </div>

      {/* Grid lịch */}
      <div style={s.grid}>
        {getDaysInMonth().map((day, i) => {
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const dateStr = day ? `${year}-${month}-${String(day).padStart(2, '0')}` : '';
          const dayEvents = day ? getEventsForDay(day) : [];
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;

          return (
            <div key={i} style={{
              ...s.dayCell,
              ...(isToday ? s.today : {}),
              ...(isSelected ? s.selected : {}),
              ...(day ? {} : { background: 'transparent', border: 'none' }),
            }}
              onClick={() => day && setSelectedDate(dateStr)}
            >
              {day && (
  <>
    <span style={{
      fontSize: 13,
      fontWeight: isToday ? 'bold' : 'normal',
      color: isToday ? '#fff' : '#1c1c1e',
    }}>{day}</span>
    <span style={{
      fontSize: 10,
      color: isToday ? 'rgba(255,255,255,0.8)' : '#8e8e93',
      lineHeight: 1,
    }}>{getLunarDate(day)}</span>
    <div style={s.dotRow}>
      {dayEvents.slice(0, 3).map(e => (
        <div key={e.id} style={{ ...s.dot, background: e.color }} />
      ))}xxw
    </div>
</>
            )}
            </div>
          );
        })}
      </div>

      {/* Sự kiện của ngày được chọn */}
      {selectedDate && (
        <div style={s.eventList}>
          <div style={s.eventListHeader}>
            <span style={s.eventListTitle}>📅 {selectedDate}</span>
            <button style={s.addBtn} onClick={() => { setForm(f => ({ ...f, date: selectedDate })); setShowForm(true); }}>
              + Thêm
            </button>
          </div>
          {selectedEvents.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>Không có sự kiện</p>
          ) : (
            selectedEvents.map(e => {
              const typeInfo = TYPE_OPTIONS.find(t => t.value === e.type);
              return (
                <div key={e.id} style={{ ...s.eventCard, borderLeft: `4px solid ${e.color}` }}>
                  <div style={{ flex: 1 }}>
                    <p style={s.eventTitle}>{typeInfo?.label.split(' ')[0]} {e.title}</p>
                    {e.description && <p style={s.eventDesc}>{e.description}</p>}
                    {e.recurring && <p style={s.eventRecurring}>🔄 Lặp lại {e.recurringType === 'yearly' ? 'hàng năm' : e.recurringType === 'monthly' ? 'hàng tháng' : 'hàng tuần'}</p>}
                  </div>
                  <button style={s.deleteBtn} onClick={() => handleDeleteEvent(e.id)}>🗑</button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Form thêm sự kiện */}
      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>✨ Thêm sự kiện</h3>

            <input style={s.input} placeholder="Tên sự kiện *" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

            <input style={s.input} placeholder="Mô tả (tuỳ chọn)" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            <input style={s.input} type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />

            <select style={s.input} value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <p style={s.label}>👥 Tag thành viên</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {MEMBERS.map(m => (
                <button key={m.id} style={{
                  ...s.memberTag,
                  background: form.memberTags.includes(m.id) ? '#6366f1' : '#1f2937',
                }} onClick={() => toggleMember(m.id)}>{m.name}</button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <input type="checkbox" checked={form.recurring}
                onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))} />
              <span style={{ color: '#d1d5db' }}>Sự kiện lặp lại</span>
            </div>

            {form.recurring && (
              <select style={s.input} value={form.recurringType}
                onChange={e => setForm(f => ({ ...f, recurringType: e.target.value }))}>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
                <option value="yearly">Hàng năm</option>
              </select>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button style={s.cancelBtn} onClick={() => setShowForm(false)}>Huỷ</button>
              <button style={s.submitBtn} onClick={handleAddEvent}>Thêm sự kiện</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  container: { padding: '0 0 40px' },
  calHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  navBtn: {
    background: '#e5e5ea', border: 'none', color: '#1c1c1e',
    fontSize: 20, width: 36, height: 36,
    borderRadius: 10, cursor: 'pointer', fontWeight: 'bold',
  },
  monthTitle: { fontSize: 18, fontWeight: 700, color: '#1c1c1e' },
  weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 },
  weekDay: {
    textAlign: 'center', color: '#8e8e93',
    fontSize: 12, padding: '6px 0', fontWeight: 600,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 },
  dayCell: {
    background: '#ffffff', borderRadius: 12,
    padding: '8px 4px', minHeight: 52, cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.04)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 4,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  today: {
    background: '#007aff',
    border: '2px solid #007aff',
  },
  selected: {
    background: '#e8f0fe',
    border: '2px solid #007aff',
  },
  dotRow: { display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: '50%' },
  eventList: {
    marginTop: 20, background: '#ffffff',
    borderRadius: 18, padding: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  eventListHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  eventListTitle: { color: '#1c1c1e', fontWeight: 700, fontSize: 16 },
  addBtn: {
    background: '#007aff', border: 'none', color: '#fff',
    padding: '8px 16px', borderRadius: 10,
    cursor: 'pointer', fontWeight: '600', fontSize: 14,
  },
  eventCard: {
    background: '#f2f2f7', borderRadius: 12,
    padding: '12px 16px', marginBottom: 8,
    display: 'flex', alignItems: 'center',
  },
  eventTitle: { fontWeight: '600', marginBottom: 4, color: '#1c1c1e' },
  eventDesc: { color: '#8e8e93', fontSize: 13 },
  eventRecurring: { color: '#007aff', fontSize: 12, marginTop: 4 },
  deleteBtn: {
    background: 'transparent', border: 'none',
    cursor: 'pointer', fontSize: 18, marginLeft: 8,
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#ffffff', borderRadius: 20,
    padding: 24, width: '90%', maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1c1c1e' },
  input: {
    width: '100%', padding: 14, marginBottom: 12,
    borderRadius: 12, border: '1px solid #e5e5ea',
    background: '#f2f2f7', color: '#1c1c1e', fontSize: 15,
    outline: 'none',
  },
  label: { color: '#8e8e93', fontSize: 13, marginBottom: 8 },
  memberTag: {
    padding: '8px 16px', borderRadius: 10,
    border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: 14,
  },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    border: '1px solid #e5e5ea', background: '#f2f2f7',
    color: '#1c1c1e', cursor: 'pointer', fontWeight: '600',
  },
  submitBtn: {
    flex: 1, padding: 14, borderRadius: 12, border: 'none',
    background: '#007aff', color: '#fff',
    cursor: 'pointer', fontWeight: '600', fontSize: 15,
  },
};