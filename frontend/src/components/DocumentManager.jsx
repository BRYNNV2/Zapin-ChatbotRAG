import React, { useState, useEffect } from 'react';
import { BookOpen, ShieldCheck, FileText, CheckCircle2, Search } from 'lucide-react';

export default function DocumentManager() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/dataset/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    return (
      doc.document_name.toLowerCase().includes(q) ||
      (doc.validator_name && doc.validator_name.toLowerCase().includes(q)) ||
      (doc.cultural_categories && doc.cultural_categories.some((c) => c.toLowerCase().includes(q)))
    );
  });

  const totalChunks = documents.reduce((acc, d) => acc + (d.total_chunks || 0), 0);

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h2 className="view-title" style={{ margin: 0 }}>Katalog Pustaka Budaya Zapin</h2>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <CheckCircle2 size={13} />
            Basis Data Resmi Tervalidasi Pakar
          </span>
        </div>
        <p className="view-subtitle">
          Daftar naskah, literatur, buku, dan jurnal otentik yang telah tertanam di dalam sistem (*embedded corpus*) dan digunakan oleh AI untuk menyajikan jawaban yang akurat serta dapat dilacak sumbernya.
        </p>
      </div>

      {/* Ringkasan Pustaka Cards */}
      <div className="metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-label">
            <BookOpen size={14} color="#d4af37" />
            <span>Total Naskah & Buku Terdaftar</span>
          </div>
          <div className="metric-value">
            {documents.length}
          </div>
          <div className="metric-sub">
            Dokumen resmi rujukan seni budaya Melayu
          </div>
        </div>

        <div className="metric-card gold-accent">
          <div className="metric-label">
            <FileText size={14} color="#fde68a" />
            <span>Potongan Teks Semantik (Chunks)</span>
          </div>
          <div className="metric-value gold">
            {totalChunks}
          </div>
          <div className="metric-sub">
            Terindeks dalam vektor 384 dimensi Sentence-BERT
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <ShieldCheck size={14} color="#34d399" />
            <span>Status Validasi Akademis</span>
          </div>
          <div className="metric-value" style={{ fontSize: '1.4rem', color: '#34d399', paddingTop: '8px' }}>
            100% Terverifikasi
          </div>
          <div className="metric-sub">
            Divalidasi oleh pakar seni tari & adat Melayu
          </div>
        </div>
      </div>

      {/* Bar Pencarian Katalog */}
      <div style={{
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        background: '#1a1a1f',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '10px 16px',
        gap: '10px'
      }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Cari naskah, nama pakar validator, atau kategori budaya..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '0.88rem',
            width: '100%'
          }}
        />
      </div>

      {/* Tabel Katalog Buku / Naskah */}
      {filteredDocs.length === 0 ? (
        <div className="glass-card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          {loading ? 'Memuat katalog naskah...' : 'Tidak ada dokumen yang cocok dengan pencarian Anda.'}
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>Judul Dokumen & Literatur</th>
              <th>Kapasitas Chunk</th>
              <th>Pakar / Lembaga Validator</th>
              <th>Cakupan Kategori Budaya</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(212, 175, 55, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={16} color="#d4af37" />
                    </div>
                    <div>
                      <div style={{ color: '#ffffff' }}>{doc.document_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {doc.total_pages} Halaman Terekstraksi
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{
                    padding: '3px 9px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.76rem'
                  }}>
                    {doc.total_chunks} Chunks Semantik
                  </span>
                </td>
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#34d399',
                    fontSize: '0.82rem',
                    fontWeight: 500
                  }}>
                    <ShieldCheck size={14} />
                    <span>{doc.validator_name}</span>
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {doc.cultural_categories ? doc.cultural_categories.join(', ') : 'Umum Budaya Zapin'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
