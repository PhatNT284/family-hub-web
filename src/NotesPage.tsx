import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080/api/notes';

type Note = {
  id: number;
  title: string;
  content: string;
  color: string;
  authorName: string;
  authorEmoji: string;
  createdAt: string;
  pinned: boolean;
};

type User = {
  id: number;
  name: string;
  emoji: string;
  username: string;
};

const COLORS = [
  { value: '#fff9c4', label: '🟡 Vàng' },
  { value: '#c8e6c9', label: '🟢 Xanh lá' },
  { value: '#bbdefb', label: '🔵 Xanh dương' },
  { value: '#f8bbd0', label: '🩷 Hồng' },
  { value: '#e1bee7', label: '🟣 Tím' },
];

export default function NotesPage({ user }: { user: User }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '', color: '#fff9c4' });

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setNotes(data);
  };

  const handleAdd = async () => {
    if (!form.title && !form.content) return;
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        authorName: user.name,
        authorEmoji: user.emoji,
      }),
    });
    setShowForm(false);
    setForm({ title: '', content: '', color: '#fff9c4' });
    fetchNotes();
  };

  const handleUpdate = async () => {
    if (!editNote) return;
    await fetch(`${API_URL}/${editNote.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setEditNote(null);
    setForm({ title: '', content: '', color: '#fff9c4' });
    fetchNotes();
  };

  const handlePin = async (id: number) => {
    await fetch(`${API_URL}/${id}/pin`, { method: 'PUT' });
    fetchNotes();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchNotes();
  };

  const openEdit = (note: Note) => {
    setEditNote(note);
    setForm({ title: note.title, content: note.content, color: note.color });
  };

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={s.container}>
      {/* Nút thêm */}
      <button style={s.addBtn} onClick={() => setShowForm(true)}>
        + Ghi chú mới
      </button>

      {/* Danh sách ghi chú */}
      {notes.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: 48 }}>📝</p>
          <p style={{ marginTop: 12, color: '#8e8e93' }}>Chưa có ghi chú nào</p>
        </div>
      ) : (
        <div style={s.grid}>
          {notes.map(note => (
            <div key={note.id} style={{ ...s.noteCard, background: note.color }}>
              {/* Header card */}
              <div style={s.cardHeader}>
                <span style={s.pinBtn} onClick={() => handlePin(note.id)}>
                  {note.pinned ? '📌' : '📍'}
                </span>
                <span style={s.deleteBtn} onClick={() => handleDelete(note.id)}>🗑</span>
              </div>

              {/* Nội dung */}
              <div onClick={() => openEdit(note)} style={{ cursor: 'pointer' }}>
                {note.title && <p style={s.noteTitle}>{note.title}</p>}
                {note.content && <p style={s.noteContent}>{note.content}</p>}
              </div>

              {/* Footer */}
              <div style={s.cardFooter}>
                <span style={s.author}>{note.authorEmoji} {note.authorName}</span>
                <span style={s.date}>{formatDate(note.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form thêm/sửa */}
      {(showForm || editNote) && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, background: form.color }}>
            <h3 style={s.modalTitle}>
              {editNote ? '✏️ Sửa ghi chú' : '📝 Ghi chú mới'}
            </h3>

            {/* Chọn màu */}
            <div style={s.colorRow}>
              {COLORS.map(c => (
                <div key={c.value} onClick={() => setForm(f => ({ ...f, color: c.value }))}
                  style={{
                    ...s.colorDot,
                    background: c.value,
                    border: form.color === c.value ? '3px solid #007aff' : '2px solid rgba(0,0,0,0.1)',
                  }} />
              ))}
            </div>

            <input style={s.input} placeholder="Tiêu đề" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

            <textarea style={s.textarea} placeholder="Nội dung ghi chú..." value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5} />

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button style={s.cancelBtn} onClick={() => { setShowForm(false); setEditNote(null); }}>
                Huỷ
              </button>
              <button style={s.submitBtn} onClick={editNote ? handleUpdate : handleAdd}>
                {editNote ? 'Lưu' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  container: { padding: '0 0 40px' },
  addBtn: {
    width: '100%', padding: 16, borderRadius: 14, border: 'none',
    background: '#007aff', color: '#fff', fontSize: 16,
    fontWeight: '600', cursor: 'pointer', marginBottom: 20,
    boxShadow: '0 4px 14px rgba(0,122,255,0.25)',
  },
  empty: { textAlign: 'center', padding: 60 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  noteCard: {
    borderRadius: 16, padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between' },
  pinBtn: { cursor: 'pointer', fontSize: 18 },
  deleteBtn: { cursor: 'pointer', fontSize: 18 },
  noteTitle: { fontSize: 16, fontWeight: '700', color: '#1c1c1e', marginBottom: 4 },
  noteContent: { fontSize: 14, color: '#3a3a3c', lineHeight: 1.5 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  author: { fontSize: 12, color: '#636366', fontWeight: '600' },
  date: { fontSize: 11, color: '#8e8e93' },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    borderRadius: 20, padding: 24,
    width: '90%', maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1c1c1e' },
  colorRow: { display: 'flex', gap: 10, marginBottom: 16 },
  colorDot: { width: 28, height: 28, borderRadius: '50%', cursor: 'pointer' },
  input: {
    width: '100%', padding: 14, marginBottom: 12,
    borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)',
    background: 'rgba(255,255,255,0.7)', color: '#1c1c1e',
    fontSize: 15, outline: 'none',
  },
  textarea: {
    width: '100%', padding: 14, marginBottom: 12,
    borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)',
    background: 'rgba(255,255,255,0.7)', color: '#1c1c1e',
    fontSize: 15, outline: 'none', resize: 'none',
    fontFamily: 'inherit',
  },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.1)',
    background: 'rgba(255,255,255,0.5)',
    color: '#1c1c1e', cursor: 'pointer', fontWeight: '600',
  },
  submitBtn: {
    flex: 1, padding: 14, borderRadius: 12, border: 'none',
    background: '#007aff', color: '#fff',
    cursor: 'pointer', fontWeight: '600', fontSize: 15,
  },
};