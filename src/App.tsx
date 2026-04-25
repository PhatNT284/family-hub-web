import React, { useEffect, useState } from 'react';
import CalendarPage from './CalendarPage';
import NotesPage from './NotesPage';

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
  const [activePage, setActivePage] = useState('home');

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
    <div style={styles.appWrapper}>
      {/* Main content */}
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>🏠 FamilyHub</h1>
            <p style={styles.headerSub}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Đăng xuất</button>
        </div>

        {/* Page content */}
        {activePage === 'home' && (
          <>
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
          </>
        )}

        {activePage === 'calendar' && <CalendarPage />}

        {activePage === 'notes' && <NotesPage user={user} />}

        {activePage === 'shopping' && (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            <p style={{ fontSize: 48 }}>🛒</p>
            <p style={{ marginTop: 12 }}>Mua sắm — Sắp ra mắt!</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        {[
          { id: 'home', emoji: '🏠', label: 'Trang chủ' },
          { id: 'calendar', emoji: '📅', label: 'Lịch' },
          { id: 'notes', emoji: '📝', label: 'Ghi chú' },
          { id: 'shopping', emoji: '🛒', label: 'Mua sắm' },
        ].map(tab => (
          <button key={tab.id} style={{
            ...styles.navTab,
            color: activePage === tab.id ? '#6366f1' : '#6b7280',
          }} onClick={() => setActivePage(tab.id)}>
            <span style={{ fontSize: 22 }}>{tab.emoji}</span>
            <span style={{ fontSize: 11, marginTop: 2 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  appWrapper: {
    maxWidth: 640, margin: '0 auto',
    minHeight: '100vh', position: 'relative', paddingBottom: 90,
    background: '#f2f2f7',
  },
  loginContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', padding: 24,
    background: '#f2f2f7',
  },
  title: { fontSize: 42, marginBottom: 8, color: '#1c1c1e', fontWeight: 700 },
  subtitle: { color: '#8e8e93', marginBottom: 32, fontSize: 16 },
  error: {
    color: '#ff3b30', marginBottom: 16,
    background: '#fff0ef', padding: '10px 20px',
    borderRadius: 10, fontSize: 14,
  },
  input: {
    width: 320, padding: 16, marginBottom: 12,
    borderRadius: 14, border: '1px solid #e5e5ea',
    background: '#ffffff', color: '#1c1c1e', fontSize: 16,
    outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  button: {
    width: 320, padding: 16, borderRadius: 14, border: 'none',
    background: '#007aff', color: '#fff',
    fontSize: 16, fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0,122,255,0.35)',
  },
  container: { padding: '0 16px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '52px 0 16px',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: 700, color: '#1c1c1e', letterSpacing: -0.5 },
  headerSub: { color: '#8e8e93', fontSize: 13, marginTop: 4 },
  logoutBtn: {
    background: '#fff0ef', color: '#ff3b30',
    border: 'none', padding: '8px 16px',
    borderRadius: 10, cursor: 'pointer',
    fontWeight: '600', fontSize: 13,
  },
  welcomeCard: {
    display: 'flex', alignItems: 'center',
    background: 'linear-gradient(135deg, #007aff, #5856d6)',
    padding: '20px 24px', borderRadius: 20, marginBottom: 24,
    boxShadow: '0 8px 24px rgba(0,122,255,0.25)',
  },
  welcomeEmoji: { fontSize: 44, marginRight: 16 },
  welcomeText: { fontSize: 20, fontWeight: 600, color: '#fff' },
  sectionTitle: {
    color: '#8e8e93', fontSize: 13, fontWeight: 600,
    marginBottom: 10, marginTop: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  memberCard: {
    display: 'flex', alignItems: 'center',
    background: '#ffffff', padding: '16px 20px',
    borderRadius: 16, marginBottom: 10, cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.04)',
  },
  memberEmoji: { fontSize: 38, marginRight: 16 },
  memberName: { fontSize: 17, fontWeight: '600', marginBottom: 4, color: '#1c1c1e' },
  toggleHint: {
    marginLeft: 'auto', fontSize: 11,
    color: '#c7c7cc', textAlign: 'center', maxWidth: 65,
  },
  bottomNav: {
    position: 'fixed', bottom: 0,
    left: '50%', transform: 'translateX(-50%)',
    width: '100%', maxWidth: 640,
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(0,0,0,0.08)',
    display: 'flex', justifyContent: 'space-around',
    padding: '10px 0 20px', zIndex: 100,
  },
  navTab: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: '4px 20px',
  },
};

export default App;