import React, { useState, useEffect } from 'react';
import { PanelLeftOpen, BookOpen } from 'lucide-react';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import ChatContainer from './components/ChatContainer';
import SourceReferenceDrawer from './components/SourceReferenceDrawer';
import AuthModal from './components/AuthModal';
import SettingsPage from './components/SettingsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [previousTab, setPreviousTab] = useState('chat');
  const [settingsSubTab, setSettingsSubTab] = useState('account');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Autentikasi Pengguna
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('zapin_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('zapin_token') || '';
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode === 'register' ? 'register' : 'login');
    setAuthModalOpen(true);
  };

  // Riwayat percakapan (sinkron dengan database PostgreSQL Neon)
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Parameter RAG default (berjalan di belakang layar)
  const [ragParams] = useState({ top_k: 4, threshold: 0.30 });

  // Preferensi Tampilan & Obrolan Pengguna
  const [userPrefs, setUserPrefs] = useState(() => {
    const defaults = {
      theme: 'light',
      language: 'auto',
      showCitations: true,
      enterToSend: true,
      autoOpenSources: false
    };
    try {
      const saved = localStorage.getItem('zapin_prefs');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zapin_prefs', JSON.stringify(userPrefs));
    } catch {}
  }, [userPrefs]);

  useEffect(() => {
    const applyTheme = () => {
      let resolved = userPrefs.theme;
      if (resolved === 'system') {
        resolved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
    };

    applyTheme();
    if (userPrefs.theme === 'system' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [userPrefs.theme]);

  // Drawer state (Bar Rujukan Sitasi)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSources, setActiveSources] = useState([]);
  const [highlightedCitationId, setHighlightedCitationId] = useState(null);

  // Fetch daftar sesi dari PostgreSQL (Neon)
  const fetchSessions = async (token = authToken, selectFirst = false) => {
    // Mode tamu (belum login): riwayat percakapan hanya disimpan sementara di memori React
    if (!token) {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('http://localhost:8000/api/chat/sessions', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.sessions) {
          setSessions(data.sessions);
          // Jika belum ada sesi aktif (atau baru login dari sesi tamu), pilih sesi pertama dari cloud
          if (data.sessions.length > 0 && (selectFirst || !activeSessionId || String(activeSessionId).startsWith('guest-'))) {
            handleSelectSession(data.sessions[0].id, token, data.sessions);
          }
        }
      }
    } catch (err) {
      console.warn('Gagal memuat sesi dari database PostgreSQL:', err.message);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchSessions(authToken);
    } else {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
    }
  }, []);

  // Handler Auth Berhasil
  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('zapin_user', JSON.stringify(user));
    localStorage.setItem('zapin_token', token);
    setActiveSessionId(null);
    setMessages([]);
    setActiveSources([]);
    setDrawerOpen(false);
    fetchSessions(token, true);
  };

  // Handler Logout
  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch('http://localhost:8000/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    } catch (err) {
      console.warn('Logout error:', err.message);
    }
    setCurrentUser(null);
    setAuthToken('');
    localStorage.removeItem('zapin_user');
    localStorage.removeItem('zapin_token');
    setSessions([]);
    setActiveSessionId(null);
    setMessages([]);
    setActiveSources([]);
    setDrawerOpen(false);
  };

  // Handler Percakapan Baru
  const handleNewChat = async () => {
    setActiveTab('chat');
    setMessages([]);
    setActiveSources([]);
    setDrawerOpen(false);

    // Mode tamu: langsung mulai percakapan baru di memori tanpa simpan ke database
    if (!authToken) {
      setActiveSessionId(null);
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };

      const res = await fetch('http://localhost:8000/api/chat/sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'Obrolan Baru' })
      });

      if (res.ok) {
        const data = await res.json();
        const newSession = data.session;
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        return;
      }
    } catch (err) {
      console.warn('Gagal membuat sesi di cloud database:', err.message);
    }

    setActiveSessionId(Date.now().toString());
  };

  // Handler Pilih Sesi (Memori Sementara untuk Tamu / PostgreSQL untuk Akun)
  const handleSelectSession = async (id, token = authToken, sessionList = sessions) => {
    setActiveSessionId(id);
    setActiveTab('chat');

    if (!token || String(id).startsWith('guest-')) {
      const selected = sessionList.find((s) => s.id === id);
      const localMessages = selected?.messages || [];
      setMessages(localMessages);
      const lastWithSources = [...localMessages].reverse().find(
        (m) => m.sources && m.sources.length > 0
      );
      if (lastWithSources) {
        setActiveSources(lastWithSources.sources);
      } else {
        setActiveSources([]);
        setDrawerOpen(false);
      }
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`http://localhost:8000/api/chat/sessions/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.session && data.session.messages) {
          const parsedMessages = data.session.messages.map(m => {
            let safeSources = m.sources;
            if (typeof safeSources === 'string') {
              try { safeSources = JSON.parse(safeSources); } catch { safeSources = []; }
            }
            if (!Array.isArray(safeSources)) safeSources = [];
            return { ...m, sources: safeSources };
          });
          setMessages(parsedMessages);
          const lastWithSources = [...parsedMessages].reverse().find(
            (m) => m.sources && m.sources.length > 0
          );
          if (lastWithSources) {
            setActiveSources(lastWithSources.sources);
          } else {
            setActiveSources([]);
            setDrawerOpen(false);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Gagal memuat pesan dari cloud:', err.message);
    }

    const selected = sessionList.find((s) => s.id === id);
    if (selected) {
      setMessages(selected.messages || []);
    }
  };

  // Handler Hapus Sesi (Memori Sementara untuk Tamu / PostgreSQL untuk Akun)
  const handleDeleteSession = async (id) => {
    if (authToken && !String(id).startsWith('guest-')) {
      try {
        await fetch(`http://localhost:8000/api/chat/sessions/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      } catch (err) {
        console.warn('Gagal menghapus sesi dari cloud database:', err.message);
      }
    }

    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id, authToken, updated);
      } else {
        setActiveSessionId(null);
        setMessages([]);
        setActiveSources([]);
        setDrawerOpen(false);
      }
    }
  };

  // Handler Kirim Pesan RAG (Mendukung Mode Tamu Sementara & Mode Login Cloud)
  const handleSendMessage = async (queryText) => {
    const userMsg = { sender: 'user', text: queryText, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    let currentSessionId = activeSessionId;
    const shortTitle = queryText.slice(0, 38) + (queryText.length > 38 ? '...' : '');

    // Jika sudah login dan belum ada sesi aktif, buat sesi baru di PostgreSQL
    if (authToken && !currentSessionId) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        };

        const sessRes = await fetch('http://localhost:8000/api/chat/sessions', {
          method: 'POST',
          headers,
          body: JSON.stringify({ title: shortTitle })
        });

        if (sessRes.ok) {
          const sessData = await sessRes.json();
          currentSessionId = sessData.session.id;
          setActiveSessionId(currentSessionId);
          setSessions((prev) => [sessData.session, ...prev]);
        }
      } catch (err) {
        console.warn('Gagal inisialisasi sesi otomatis:', err.message);
      }
    } else if (!authToken) {
      // Mode tamu: simpan sementara di memori state React (hilang saat halaman di-refresh)
      if (!currentSessionId) {
        currentSessionId = `guest-${Date.now()}`;
        setActiveSessionId(currentSessionId);
        const guestSession = {
          id: currentSessionId,
          title: shortTitle,
          isTemporary: true,
          message_count: updatedMessages.length,
          messages: updatedMessages
        };
        setSessions((prev) => [guestSession, ...prev]);
      } else {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  title: !s.title || s.title === 'Obrolan Baru' ? shortTitle : s.title,
                  message_count: updatedMessages.length,
                  messages: updatedMessages
                }
              : s
          )
        );
      }
    }

    try {
      const res = await fetch('http://localhost:8000/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          top_k: ragParams.top_k,
          threshold: ragParams.threshold,
          session_id:
            currentSessionId && !String(currentSessionId).startsWith('guest-')
              ? currentSessionId
              : null
        })
      });

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg = {
        sender: 'assistant',
        text: data.answer,
        sources: data.sources || [],
        highestSimilarity: data.highest_similarity || 0,
        traceabilityRate: data.source_traceability_rate || 1.0,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      if (data.sources && data.sources.length > 0) {
        setActiveSources(data.sources);
        if (userPrefs.autoOpenSources) {
          setDrawerOpen(true);
        }
      }

      if (currentSessionId) {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                title: !s.title || s.title === 'Obrolan Baru' ? shortTitle : s.title,
                message_count: finalMessages.length,
                messages: finalMessages
              };
            }
            return s;
          })
        );
      }
    } catch (err) {
      const errorMsg = {
        sender: 'assistant',
        text: `Maaf, terjadi kendala saat menghubungkan ke sistem RAG backend (${err.message}). Pastikan server backend FastAPI berjalan di port 8000.`,
        sources: [],
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);

      if (currentSessionId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  message_count: finalMessages.length,
                  messages: finalMessages
                }
              : s
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Buka Sumber Rujukan (Bar Kanan)
  const handleOpenSources = (sources, citationId) => {
    let safeList = [];
    if (Array.isArray(sources)) {
      safeList = sources;
    } else if (typeof sources === 'string') {
      try {
        const p = JSON.parse(sources);
        if (Array.isArray(p)) safeList = p;
      } catch {
        safeList = [];
      }
    }
    setActiveSources(safeList);
    setHighlightedCitationId(citationId);
    setDrawerOpen(true);
  };

  const handleSelectTab = (tab) => {
    if (tab === 'settings' && activeTab !== 'settings') {
      setPreviousTab(activeTab);
    }
    setActiveTab(tab);
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar (Tetap tampil termasuk saat membuka Pengaturan) */}
      <ChatHistorySidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        setSettingsSubTab={setSettingsSubTab}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        currentUser={currentUser}
        onOpenAuthModal={openAuthModal}
        onLogout={handleLogout}
      />

      {/* Main Content Stage */}
      <div className="main-stage">
        {activeTab === 'settings' ? (
          <SettingsPage
            onBack={() => setActiveTab(previousTab || 'chat')}
            currentUser={currentUser}
            onLogout={handleLogout}
            userPrefs={userPrefs}
            setUserPrefs={setUserPrefs}
            sidebarCollapsed={sidebarCollapsed}
            onExpandSidebar={() => setSidebarCollapsed(false)}
          />
        ) : (
          <>
            {/* Clean Top Header Bar */}
            <div className="stage-top-bar">
              <div className="top-bar-left-slot">
                {sidebarCollapsed && (
                  <>
                    <button
                      className="sidebar-uncollapse-btn"
                      onClick={() => setSidebarCollapsed(false)}
                      title="Buka bilah samping"
                    >
                      <PanelLeftOpen size={18} />
                    </button>
                    <span className="top-brand-name">ZAPIN</span>
                  </>
                )}
              </div>

              <div className="top-bar-right-slot">
                {activeTab === 'chat' && activeSources && activeSources.length > 0 && (
                  <button
                    className={`top-source-toggle-btn ${drawerOpen ? 'active' : ''}`}
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    title={drawerOpen ? "Tutup bar kanan rujukan" : "Buka bar kanan rujukan sumber"}
                  >
                    <BookOpen size={14} color={drawerOpen ? "#b45309" : "currentColor"} />
                    <span>{drawerOpen ? "Tutup Bar Rujukan" : `Bar Rujukan (${activeSources.length})`}</span>
                  </button>
                )}

                {!currentUser ? (
                  <div className="clean-header-auth-group">
                    <button
                      type="button"
                      className="btn-clean-primary"
                      onClick={() => openAuthModal('login')}
                      title="Masuk ke Akun"
                    >
                      Masuk
                    </button>
                    <button
                      type="button"
                      className="btn-clean-outline"
                      onClick={() => openAuthModal('register')}
                      title="Daftar Akun Baru"
                    >
                      Daftar gratis
                    </button>
                  </div>
                ) : (
                  <div
                    className="header-user-badge"
                    onClick={() => {
                      setSettingsSubTab('account');
                      handleSelectTab('settings');
                    }}
                    title="Buka Pengaturan Akun"
                  >
                    <div className="header-avatar-mini">
                      {currentUser.full_name
                        ? currentUser.full_name[0].toUpperCase()
                        : currentUser.username
                        ? currentUser.username[0].toUpperCase()
                        : 'U'}
                    </div>
                    <span className="header-user-name">{currentUser.full_name || currentUser.username}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Workspace Body with Docked Bar Kanan Support */}
            <div className="stage-workspace-body">
              <div className="stage-main-scrollable">
                <ChatContainer
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onOpenSources={handleOpenSources}
                  currentUser={currentUser}
                  onOpenAuthModal={openAuthModal}
                  userPrefs={userPrefs}
                />
              </div>

              {/* Bar Kanan (Docked Right Side Panel) */}
              <SourceReferenceDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sources={activeSources}
                highlightedId={highlightedCitationId}
                onSelectCitation={(id) => setHighlightedCitationId(id)}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal Autentikasi Pengguna (Login & Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}
