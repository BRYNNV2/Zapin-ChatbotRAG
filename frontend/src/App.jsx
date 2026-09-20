import React, { useState, useEffect } from 'react';
import { PanelLeftOpen, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import ChatContainer from './components/ChatContainer';
import SourceReferenceDrawer from './components/SourceReferenceDrawer';
import DocumentManager from './components/DocumentManager';
import EvaluationDashboard from './components/EvaluationDashboard';
import SbertPipelineModal from './components/SbertPipelineModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({ totalChunks: 0, totalDocuments: 0 });

  // Riwayat percakapan (persisten di localStorage)
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('zapin_chat_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  useEffect(() => {
    fetchStats();
  }, []);

  // Simpan sesi ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zapin_chat_sessions', JSON.stringify(sessions));
    } catch (err) {
      console.error('Error saving sessions:', err);
    }
  }, [sessions]);

  // Handler Percakapan Baru (Kimi "Obrolan baru")
  const handleNewChat = () => {
    setActiveTab('chat');
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: 'Obrolan Baru',
      createdAt: new Date().toISOString(),
      messages: []
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setMessages([]);
    setActiveSources([]);
    setDrawerOpen(false);
  };

  // Handler Pilih Sesi
  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    const selected = sessions.find((s) => s.id === id);
    if (selected) {
      const msgs = selected.messages || [];
      setMessages(msgs);
      const lastWithSources = [...msgs].reverse().find(m => m.sources && m.sources.length > 0);
      if (lastWithSources) {
        setActiveSources(lastWithSources.sources);
      } else {
        setActiveSources([]);
        setDrawerOpen(false);
      }
    }
  };

  // Handler Hapus Sesi
  const handleDeleteSession = (id) => {
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
    if (!currentSessionId) {
      currentSessionId = Date.now().toString();
      const newSession = {
        id: currentSessionId,
        title: queryText.slice(0, 30) + (queryText.length > 30 ? '...' : ''),
        createdAt: new Date().toISOString(),
        messages: updatedMessages
      };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(currentSessionId);
    }

    try {
      const res = await fetch('http://localhost:8000/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          top_k: ragParams.top_k,
          threshold: ragParams.threshold
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

      // Perbarui judul sesi jika masih default
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              title: s.title === 'Obrolan Baru' ? queryText.slice(0, 30) + '...' : s.title,
              messages: finalMessages
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
      />

      {/* Main Content Stage */}
      <div className="main-stage">
        {/* Floating Top Bar */}
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
            <Sparkles size={13} color="#60a5fa" />
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
    </div>
  );
}
