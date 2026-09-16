import React, { useState, useEffect } from 'react';
import CulturalThemeHeader from './components/CulturalThemeHeader';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import ChatContainer from './components/ChatContainer';
import SourceReferenceDrawer from './components/SourceReferenceDrawer';
import DocumentManager from './components/DocumentManager';
import EvaluationDashboard from './components/EvaluationDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [stats, setStats] = useState({ totalChunks: 0, totalDocuments: 0 });
  const [suggestions, setSuggestions] = useState([]);
  
  // Riwayat percakapan
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

  // Parameter RAG yang dapat dikonfigurasi peneliti
  const [ragParams, setRagParams] = useState({ top_k: 4, threshold: 0.30 });

  // Drawer referensi sumber
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSources, setActiveSources] = useState([]);
  const [highlightedCitationId, setHighlightedCitationId] = useState(null);

  // Muat status pangkalan data & saran pertanyaan awal
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
      console.warn('Backend server belum aktif atau tidak dapat diakses:', err.message);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/chat/suggestions');
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.warn('Gagal memuat saran kueri:', err.message);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSuggestions();
  }, []);

  // Simpan sesi ke localStorage jika berubah
  useEffect(() => {
    try {
      localStorage.setItem('zapin_chat_sessions', JSON.stringify(sessions));
    } catch (err) {
      console.error('Error saving sessions:', err);
    }
  }, [sessions]);

  // Handler Percakapan Baru
  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: 'Percakapan Baru',
      createdAt: new Date().toISOString(),
      messages: []
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setMessages([]);
  };

  // Handler Pilih Sesi
  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    const selected = sessions.find((s) => s.id === id);
    if (selected) {
      setMessages(selected.messages || []);
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
        title: queryText.slice(0, 32) + (queryText.length > 32 ? '...' : ''),
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

      // Perbarui sesi
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              title: s.title === 'Percakapan Baru' ? queryText.slice(0, 32) + '...' : s.title,
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

  // Handler Buka Sumber Kutipan
  const handleOpenSources = (sources, citationId) => {
    setActiveSources(sources || []);
    setHighlightedCitationId(citationId);
    setDrawerOpen(true);
  };

  return (
    <div className="app-container">
      <CulturalThemeHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
      />

      <div className="main-workspace">
        {activeTab === 'chat' && (
          <>
            <ChatHistorySidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
            />

            <ChatContainer
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              suggestions={suggestions}
              onOpenSources={handleOpenSources}
              ragParams={ragParams}
              setRagParams={setRagParams}
            />
          </>
        )}

        {activeTab === 'documents' && (
          <DocumentManager onRefreshStats={fetchStats} />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationDashboard />
        )}
      </div>

      <SourceReferenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sources={activeSources}
        highlightedId={highlightedCitationId}
      />
    </div>
  );
}
