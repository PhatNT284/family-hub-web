import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080';

type Member = {
  id: number;
  name: string;
  emoji: string;
  home: boolean;
  arrivedAt: string | null;
};

type User = {
  id: number;
  name: string;
  emoji: string;
  username: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
      fetchMembers();
    }
  }, []);

  const fetchMembers = async () => {
    const res = await fetch(`${API_URL}/api/members`);
    const data = await res.json();
    setMembers(data);
  };

  const handleLogin = async () => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data); return; }
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      fetchMembers();
    } catch {
      setError('Không kết nối được server!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    await fetch(`${API_URL}/api/members/${id}/status?isHome=${!currentStatus}`, {
      method: 'PUT',
    });
    fetchMembers();
  };

  const formatTime = (dt: string | null) => {
    if (!dt) return '';
    const d = new Date(dt);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div style={styles.loginContainer}>
        <h1 style={styles.title}>🏠 FamilyHub</h1>
        <p style={styles.subtitle}>Đăng nhập để tiếp tục</p>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Username" value={username}
          onChange={e => setUsername(e.target.value)} />
        <input style={styles.input} placeholder="Password" type="password"
          value={password} onChange={e => setPassword(e.target.value)} />
        <button style={styles.button} onClick={handleLogin}>Đăng nhập</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>🏠 FamilyHub</h1>
          <p style={styles.headerSub}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Đăng xuất</button>
      </div>

      <div style={styles.welcomeCard}>
        <span style={styles.welcomeEmoji}>{user.emoji}</span>
        <span style={styles.welcomeText}>Xin chào, {user.name}! 👋</span>
      </div>

      <h2 style={styles.sectionTitle}>📍 Thành viên</h2>
      {members.map(m => (
        <div key={m.id} style={styles.memberCard} onClick={() => toggleStatus(m.id, m.home)}>
          <span style={styles.memberEmoji}>{m.emoji}</span>
          <div>
            <p style={styles.memberName}>{m.name}</p>
            <p style={{ color: m.home ? '#4ade80' : '#f87171', fontSize: 14 }}>
              {m.home ? `✅ Đã về nhà lúc ${formatTime(m.arrivedAt)}` : '📍 Chưa về'}
            </p>
          </div>
          <span style={styles.toggleHint}>{m.home ? 'Nhấn để ra ngoài' : 'Nhấn để về nhà'}</span>
        </div>
      ))}

      <h2 style={styles.sectionTitle}>⚡ Tính năng</h2>
      <div style={styles.featureRow}>
        {[{ emoji: '📅', label: 'Lịch chung' }, { emoji: '📝', label: 'Ghi chú' }, { emoji: '🛒', label: 'Mua sắm' }].map(f => (
          <div key={f.label} style={styles.featureCard}>
            <span style={{ fontSize: 32 }}>{f.emoji}</span>
            <p style={{ color: '#fff', marginTop: 8 }}>{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  loginContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24 },
  title: { fontSize: 36, marginBottom: 8 },
  subtitle: { color: '#a0a0b0', marginBottom: 32 },
  error: { color: '#f87171', marginBottom: 16 },
  input: { width: 300, padding: 14, marginBottom: 12, borderRadius: 12, border: 'none', background: '#1a1a2e', color: '#fff', fontSize: 16 },
  button: { width: 300, padding: 14, borderRadius: 12, border: 'none', background: '#6366f1', color: '#fff', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  container: { maxWidth: 600, margin: '0 auto', padding: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0' },
  headerTitle: { fontSize: 24 },
  headerSub: { color: '#a0a0b0', fontSize: 13, marginTop: 4 },
  logoutBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' },
  welcomeCard: { display: 'flex', alignItems: 'center', background: '#1a1a2e', padding: 16, borderRadius: 16, marginBottom: 16 },
  welcomeEmoji: { fontSize: 36, marginRight: 12 },
  welcomeText: { fontSize: 18, fontWeight: 600 },
  sectionTitle: { color: '#a0a0b0', fontSize: 16, marginBottom: 8, marginTop: 16 },
  memberCard: { display: 'flex', alignItems: 'center', background: '#1a1a2e', padding: 16, borderRadius: 16, marginBottom: 8, cursor: 'pointer' },
  memberEmoji: { fontSize: 36, marginRight: 16 },
  memberName: { fontSize: 18, fontWeight: 'bold' },
  toggleHint: { marginLeft: 'auto', fontSize: 11, color: '#666', textAlign: 'center', maxWidth: 60 },
  featureRow: { display: 'flex', gap: 12, marginTop: 8, marginBottom: 40 },
  featureCard: { flex: 1, background: '#1a1a2e', padding: 20, borderRadius: 16, textAlign: 'center', cursor: 'pointer' },
};

export default App;