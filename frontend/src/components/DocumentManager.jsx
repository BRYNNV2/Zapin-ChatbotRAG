import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, RefreshCw, Trash2, ShieldCheck, PlusCircle } from 'lucide-react';

export default function DocumentManager({ onRefreshStats }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [validatorName, setValidatorName] = useState('');
  const [category, setCategory] = useState('Ragam & Struktur Gerak Zapin');
  const [notification, setNotification] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/dataset/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Error fetching docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setNotification(null);

    const formData = new FormData();
    formData.append('file', file);
    if (validatorName.trim()) {
      formData.append('validator_name', validatorName.trim());
    }
    formData.append('category', category);

    try {
      const res = await fetch('http://localhost:8000/api/dataset/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Berhasil mengindeks "${result.file_name}": ${result.total_chunks_created} chunks semantik dibuat dan divalidasi.`
        });
        setFile(null);
        setValidatorName('');
        fetchDocuments();
      } else {
        setNotification({
          type: 'error',
          message: result.detail || 'Gagal mengunggah dan memproses dokumen.'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Koneksi ke backend gagal: ' + err.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSeedStarter = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/dataset/seed_starter', { method: 'POST' });
      const data = await res.json();
      setNotification({ type: 'success', message: data.message });
      fetchDocuments();
    } catch (err) {
      setNotification({ type: 'error', message: 'Gagal memuat starter data: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Yakin ingin mengosongkan seluruh pangkalan data pengetahuan Zapin?')) return;
    setLoading(true);
    try {
      await fetch('http://localhost:8000/api/dataset/clear', { method: 'POST' });
      setNotification({ type: 'success', message: 'Seluruh pangkalan data berhasil dikosongkan.' });
      fetchDocuments();
    } catch (err) {
      setNotification({ type: 'error', message: 'Gagal mengosongkan data: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <h2 className="view-title">Pangkalan Dokumen & Validasi Pakar</h2>
        <p className="view-subtitle">
          Kelola dokumen naskah tari Zapin (PDF, DOCX, TXT) yang telah divalidasi oleh ahli seni budaya Melayu.
        </p>
      </div>

      {notification && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '24px',
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${notification.type === 'success' ? 'var(--emerald-500)' : '#EF4444'}`,
          color: notification.type === 'success' ? 'var(--emerald-400)' : '#FCA5A5',
          fontSize: '0.875rem'
        }}>
          {notification.message}
        </div>
      )}

      {/* Form Upload Dokumen */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gold-300)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UploadCloud size={18} />
          <span>Unggah Dokumen Zapin Baru</span>
        </h3>

        <form onSubmit={handleUpload}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Pilih File Dokumen (PDF / DOCX / TXT)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(7, 11, 20, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Nama Pakar / Tim Validator Dokumen
              </label>
              <input
                type="text"
                placeholder="Contoh: Dr. Mahyudin - Pakar Budaya Zapin LAM Riau"
                value={validatorName}
                onChange={(e) => setValidatorName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(7, 11, 20, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Kategori Pengetahuan Budaya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(7, 11, 20, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Ragam & Struktur Gerak Zapin">Ragam & Struktur Gerak Zapin</option>
                <option value="Musik & Iringan Tradisi">Musik & Iringan Tradisi (Marwas/Gambus)</option>
                <option value="Sejarah & Nilai Filosofis">Sejarah, Asal Usul & Filosofi Nilai</option>
                <option value="Busana, Etika & Adat">Busana, Tata Rias & Etika Adat</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={!file || uploading}
            >
              <UploadCloud size={16} />
              <span>{uploading ? 'Memproses & Mengindeks SBERT...' : 'Unggah & Indeks ke Vector DB'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleSeedStarter}
              disabled={loading || uploading}
            >
              <PlusCircle size={16} />
              <span>Muat Starter Dataset Zapin</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ color: '#F87171', marginLeft: 'auto' }}
              onClick={handleClearAll}
              disabled={loading || uploading}
            >
              <Trash2 size={16} />
              <span>Kosongkan Data</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Dokumen Terindeks */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Dokumen Terdaftar ({documents.length})
        </h3>
        <button
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
          onClick={fetchDocuments}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin-slow' : ''} />
          <span>Segarkan</span>
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Belum ada dokumen yang terindeks. Silakan unggah file PDF/DOCX atau klik tombol <strong>"Muat Starter Dataset Zapin"</strong>.
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Dokumen</th>
              <th>Total Chunks</th>
              <th>Estimasi Hal.</th>
              <th>Pakar Validator</th>
              <th>Kategori Budaya</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#D4AF37" />
                  <span>{doc.document_name}</span>
                </td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold-300)', fontWeight: 600, fontSize: '0.75rem' }}>
                    {doc.total_chunks} chunks
                  </span>
                </td>
                <td>{doc.total_pages} Hal</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--emerald-400)', fontSize: '0.8125rem' }}>
                    <ShieldCheck size={14} />
                    <span>{doc.validator_name}</span>
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {doc.cultural_categories ? doc.cultural_categories.join(', ') : 'Umum'}
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
