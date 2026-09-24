import React, { useState, useEffect } from 'react';
import { PanelLeftOpen, Sparkles, BookOpen } from 'lucide-react';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import ChatContainer from './components/ChatContainer';
import SourceReferenceDrawer from './components/SourceReferenceDrawer';
import DocumentManager from './components/DocumentManager';
import EvaluationDashboard from './components/EvaluationDashboard';
import SbertPipelineModal from './components/SbertPipelineModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({ totalChunks: 0, totalDocuments: 0 });

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

  // Riwayat percakapan (sinkron dengan database PostgreSQL Neon)
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Parameter RAG
  const [ragParams, setRagParams] = useState({ top_k: 4, threshold: 0.30 });

  // Drawer & Modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sbertModalOpen, setSbertModalOpen] = useState(false);
  const [activeSources, setActiveSources] = useState([]);
  const [highlightedCitationId, setHighlightedCitationId] = useState(null);

  // Fetch status pangkalan data
  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/dataset/documents');
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalChunks: data.total_chunks || 0,
          totalDocuments: data.total_documents || 0
        });
      }
    } catch (err) {
      console.warn('Backend server belum aktif:', err.message);
    }
  };

  // Fetch daftar sesi dari PostgreSQL (Neon)
  const fetchSessions = async (token = authToken) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('http://localhost:8000/api/chat/sessions', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.sessions) {
          setSessions(data.sessions);
          // Jika belum ada sesi aktif dan ada daftar sesi, pilih sesi pertama
          if (data.sessions.length > 0 && !activeSessionId) {
            handleSelectSession(data.sessions[0].id, token);
          }
        }
      }
    } catch (err) {
      console.warn('Gagal memuat sesi dari database PostgreSQL:', err.message);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSessions();
  }, []);

  // Handler Auth Berhasil
  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('zapin_user', JSON.stringify(user));
    localStorage.setItem('zapin_token', token);
    fetchSessions(token);
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

  // Handler Percakapan Baru (Kimi "Obrolan baru")
  const handleNewChat = async () => {
    setActiveTab('chat');
    setMessages([]);
    setActiveSources([]);
    setDrawerOpen(false);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

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

    // Fallback lokal jika offline
    const localId = Date.now().toString();
    setActiveSessionId(localId);
  };

  // Handler Pilih Sesi & Ambil Riwayat dari PostgreSQL
  const handleSelectSession = async (id, token = authToken) => {
    setActiveSessionId(id);
    setActiveTab('chat');

    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`http://localhost:8000/api/chat/sessions/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.session && data.session.messages) {
          setMessages(data.session.messages);
          const lastWithSources = [...data.session.messages].reverse().find(
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

    // Fallback jika memori lokal
    const selected = sessions.find((s) => s.id === id);
    if (selected) {
      setMessages(selected.messages || []);
    }
  };

  // Handler Hapus Sesi di PostgreSQL
  const handleDeleteSession = async (id) => {
    try {
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      await fetch(`http://localhost:8000/api/chat/sessions/${id}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.warn('Gagal menghapus sesi dari cloud database:', err.message);
    }

    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id);
      } else {
        setActiveSessionId(null);
        setMessages([]);
        setActiveSources([]);
        setDrawerOpen(false);
      }
    }
  };

  // Handler Kirim Pesan RAG
  const handleSendMessage = async (queryText) => {
    const userMsg = { sender: 'user', text: queryText, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    let currentSessionId = activeSessionId;

    // Jika belum ada sesi aktif, buat sesi baru di PostgreSQL terlebih dahulu
    if (!currentSessionId) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const sessRes = await fetch('http://localhost:8000/api/chat/sessions', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: queryText.slice(0, 35) + (queryText.length > 35 ? '...' : '')
          })
        });

        if (sessRes.ok) {
          const sessData = await sessRes.json();
          currentSessionId = sessData.session.id;
          setActiveSessionId(currentSessionId);
          setSessions((prev) => [sessData.session, ...prev]);
        }
      } catch (err) {
        console.warn('Gagal inisialisasi sesi otomatis:', err.message);
        currentSessionId = Date.now().toString();
        setActiveSessionId(currentSessionId);
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
          session_id: currentSessionId
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
      }

      // Perbarui judul sesi di state jika sebelumnya masih 'Obrolan Baru'
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              title: s.title === 'Obrolan Baru' ? queryText.slice(0, 35) + '...' : s.title,
              message_count: (s.message_count || 0) + 2
            };
          }
          return s;
        })
      );
    } catch (err) {
      const errorMsg = {
        sender: 'assistant',
        text: `Maaf, terjadi kendala saat menghubungkan ke sistem RAG backend (${err.message}). Pastikan server backend FastAPI berjalan di port 8000.`,
        sources: [],
        timestamp: new Date().toISOString()
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Buka Sumber Rujukan (Bar Kanan)
  const handleOpenSources = (sources, citationId) => {
    setActiveSources(sources || []);
    setHighlightedCitationId(citationId);
    setDrawerOpen(true);
  };

  return (
    <div className="app-layout">
      {/* Kimi Left Sidebar */}
      <ChatHistorySidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        stats={stats}
        onOpenSbertModal={() => setSbertModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Stage */}
      <div className="main-stage">
        {/* Minimalist Top Header Bar */}
        <div className="stage-top-bar">
          <div>
            {sidebarCollapsed && (
              <button
                className="sidebar-uncollapse-btn"
                onClick={() => setSidebarCollapsed(false)}
                title="Buka bilah samping"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}
          </div>

          <div className="top-pill-badge">
            <Sparkles size={13} color="#9ca3af" />
            <span>Sentence-BERT Dense RAG • {stats.totalChunks || 5} Chunks Tervalidasi</span>
          </div>

          <div className="top-bar-right-slot">
            {activeTab === 'chat' && activeSources && activeSources.length > 0 && (
              <button
                className={`top-source-toggle-btn ${drawerOpen ? 'active' : ''}`}
                onClick={() => setDrawerOpen(!drawerOpen)}
                title={drawerOpen ? "Tutup bar kanan rujukan" : "Buka bar kanan rujukan sumber"}
              >
                <BookOpen size={14} color={drawerOpen ? "#d4af37" : "currentColor"} />
                <span>{drawerOpen ? "Tutup Bar Rujukan" : `Bar Rujukan (${activeSources.length})`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Workspace Body with Docked Bar Kanan Support */}
        <div className="stage-workspace-body">
          <div className="stage-main-scrollable">
            {activeTab === 'chat' && (
              <ChatContainer
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onOpenSources={handleOpenSources}
                onSwitchToDocs={() => setActiveTab('documents')}
                onOpenSbertModal={() => setSbertModalOpen(true)}
                ragParams={ragParams}
                setRagParams={setRagParams}
                isRightBarOpen={drawerOpen}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentManager onRefreshStats={fetchStats} />
            )}

            {activeTab === 'evaluation' && (
              <EvaluationDashboard />
            )}
          </div>

          {/* Bar Kanan (Docked Right Side Panel) */}
          {activeTab === 'chat' && (
            <SourceReferenceDrawer
              isOpen={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              sources={activeSources}
              highlightedId={highlightedCitationId}
              onSelectCitation={(id) => setHighlightedCitationId(id)}
            />
          )}
        </div>
      </div>

      {/* SBERT Pipeline Specification Modal */}
      <SbertPipelineModal
        isOpen={sbertModalOpen}
        onClose={() => setSbertModalOpen(false)}
        ragParams={ragParams}
        setRagParams={setRagParams}
      />

      {/* Modal Autentikasi Pengguna (Login & Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
