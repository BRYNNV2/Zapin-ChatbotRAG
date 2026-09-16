import React, { useState, useEffect } from 'react';
import { BarChart3, Play, Download, CheckCircle, XCircle, ArrowUpRight, Zap, BookOpen, ShieldAlert, Cpu } from 'lucide-react';

export default function EvaluationDashboard() {
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(3);
  const [benchmarkSummary, setBenchmarkSummary] = useState(null);
  const [compareQuery, setCompareQuery] = useState('Apa makna filosofis gerak Tahto dan perbedaannya dengan gerak Pecah?');
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState(null);

  const runBenchmark = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/evaluation/run_retrieval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ top_k: topK })
      });
      const data = await res.json();
      setBenchmarkSummary(data);
    } catch (err) {
      alert('Gagal menjalankan evaluasi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const runCompareGeneration = async () => {
    if (!compareQuery.trim()) return;
    setCompareLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/evaluation/run_generation_compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: compareQuery.trim() })
      });
      const data = await res.json();
      setCompareResult(data);
    } catch (err) {
      alert('Gagal membandingkan respon: ' + err.message);
    } finally {
      setCompareLoading(false);
    }
  };

  // Jalankan benchmark sekali saat pertama dibuka
  useEffect(() => {
    runBenchmark();
  }, []);

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <h2 className="view-title">Dashboard Riset & Evaluasi Skripsi</h2>
        <p className="view-subtitle">
          Uji efektivitas Dense Semantic Retrieval (Sentence-BERT) vs Sparse Retrieval (BM25) dan verifikasi keterlacakan sumber untuk Bab IV Skripsi.
        </p>
      </div>

      {/* Kontrol Eksekusi Benchmark */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nilai K (Top-K Context):</span>
            <select
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              style={{
                background: 'rgba(7, 11, 20, 0.8)',
                border: '1px solid var(--border-gold)',
                color: 'var(--gold-300)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 600
              }}
            >
              <option value="1">K = 1</option>
              <option value="3">K = 3</option>
              <option value="5">K = 5</option>
              <option value="8">K = 8</option>
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={runBenchmark}
            disabled={loading}
          >
            <Play size={16} />
            <span>{loading ? 'Menguji Vektor Semantik...' : 'Jalankan Uji Benchmark Komparasi'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <CheckCircle size={14} color="#10B981" />
          <span>Hasil otomatis diekspor ke folder <code>evaluation_results/</code></span>
        </div>
      </div>

      {/* Grid Metrik Hasil Riset */}
      {benchmarkSummary && (
        <>
          <div className="metrics-grid">
            {/* SBERT Hit Rate */}
            <div className="metric-card gold-accent">
              <div className="metric-label">
                <Zap size={14} color="#FBBF24" />
                <span>Hit Rate@{topK} (Sentence-BERT Usulan)</span>
              </div>
              <div className="metric-value gold">
                {Math.round(benchmarkSummary.sbert_metrics.hit_rate * 100)}%
              </div>
              <div className="metric-sub">
                Proporsi kueri yang menemukan konteks relevan di Top-{topK}
              </div>
            </div>

            {/* BM25 Hit Rate */}
            <div className="metric-card">
              <div className="metric-label">
                <Cpu size={14} color="#94A3B8" />
                <span>Hit Rate@{topK} (BM25 Baseline)</span>
              </div>
              <div className="metric-value">
                {Math.round(benchmarkSummary.bm25_metrics.hit_rate * 100)}%
              </div>
              <div className="metric-sub">
                Pencarian leksikal kata kunci (sparse matching)
              </div>
            </div>

            {/* SBERT MRR */}
            <div className="metric-card gold-accent">
              <div className="metric-label">
                <ArrowUpRight size={14} color="#FBBF24" />
                <span>MRR (Sentence-BERT Usulan)</span>
              </div>
              <div className="metric-value gold">
                {benchmarkSummary.sbert_metrics.mrr.toFixed(4)}
              </div>
              <div className="metric-sub">
                Mean Reciprocal Rank (posisi kemunculan rujukan utama)
              </div>
            </div>

            {/* BM25 MRR */}
            <div className="metric-card">
              <div className="metric-label">
                <ArrowUpRight size={14} color="#94A3B8" />
                <span>MRR (BM25 Baseline)</span>
              </div>
              <div className="metric-value">
                {benchmarkSummary.bm25_metrics.mrr.toFixed(4)}
              </div>
              <div className="metric-sub">
                Mean Reciprocal Rank baseline BM25
              </div>
            </div>
          </div>

          {/* Tabel Rincian Kueri Evaluasi */}
          <div style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Hasil Pengujian per Kueri Uji Ground Truth ({benchmarkSummary.detailed_query_results.length} Pertanyaan)
            </h3>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kueri Uji Budaya Zapin</th>
                  <th>Rank SBERT (Usulan)</th>
                  <th>Rank BM25 (Baseline)</th>
                  <th>Latensi SBERT</th>
                  <th>Status Temuan</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkSummary.detailed_query_results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--gold-400)' }}>{r.query_id}</td>
                    <td>{r.query}</td>
                    <td>
                      {r.sbert_hit ? (
                        <span style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>
                          Rank #{r.sbert_rank}
                        </span>
                      ) : (
                        <span style={{ color: '#F87171' }}>Miss (0)</span>
                      )}
                    </td>
                    <td>
                      {r.bm25_hit ? (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Rank #{r.bm25_rank}
                        </span>
                      ) : (
                        <span style={{ color: '#F87171' }}>Miss (0)</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {(r.sbert_time_sec * 1000).toFixed(1)} ms
                    </td>
                    <td>
                      {r.sbert_hit ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--emerald-400)', fontSize: '0.75rem', fontWeight: 600 }}>
                          <CheckCircle size={14} /> Terverifikasi
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#F87171', fontSize: '0.75rem' }}>
                          <XCircle size={14} /> Belum Cocok
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Komparasi Jawaban Langsung: Usulan RAG SBERT vs Raw LLM */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold-300)', marginBottom: '8px' }}>
          Eksperimen Komparasi Jawaban Langsung: SBERT RAG vs Raw LLM
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Uji secara empiris perbedaan antara jawaban yang didasarkan pada dokumen budaya Zapin tervalidasi dengan jawaban LLM murni (tanpa RAG) untuk menganalisis akurasi budaya dan keterlacakan sumber.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            value={compareQuery}
            onChange={(e) => setCompareQuery(e.target.value)}
            placeholder="Masukkan pertanyaan uji skripsi..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(7, 11, 20, 0.7)',
              border: '1px solid var(--border-gold)',
              color: 'var(--text-primary)',
              fontSize: '0.9375rem'
            }}
          />
          <button
            className="btn-primary"
            onClick={runCompareGeneration}
            disabled={compareLoading}
          >
            <Play size={16} />
            <span>{compareLoading ? 'Membandingkan...' : 'Bandingkan Jawaban'}</span>
          </button>
        </div>

        {compareResult && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {/* Kolom 1: Usulan SBERT RAG */}
            <div style={{
              background: 'rgba(13, 21, 39, 0.9)',
              border: '1px solid var(--border-gold)',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: '0 0 16px var(--gold-glow)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontWeight: 700, color: 'var(--gold-300)', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={16} color="#FBBF24" />
                  <span>Metode Usulan (SBERT RAG)</span>
                </span>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-400)', fontWeight: 600 }}>
                  Keterlacakan: {Math.round(compareResult.proposed_sbert_rag.traceability_rate * 100)}%
                </span>
              </div>

              <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#F1F5F9', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                {compareResult.proposed_sbert_rag.answer}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold-400)', fontWeight: 600, marginBottom: '6px' }}>
                  Sumber Rujukan Tervalidasi ({compareResult.proposed_sbert_rag.sources_count} Dokumen):
                </div>
                {compareResult.proposed_sbert_rag.sources.map((s, idx) => (
                  <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    [{s.citation_id}] {s.document_name} (Hal. {s.page_number}) - Pakar: {s.validator_name}
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom 2: Baseline Raw LLM */}
            <div style={{
              background: 'rgba(19, 30, 56, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={16} color="#94A3B8" />
                  <span>Baseline (Raw LLM Tanpa RAG)</span>
                </span>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', fontWeight: 600 }}>
                  Keterlacakan: 0% (Tanpa Sumber)
                </span>
              </div>

              <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#CBD5E1', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                {compareResult.baseline_raw_llm.answer}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <em>Catatan: Model murni menghasilkan jawaban secara parametrik tanpa mampu membuktikan sumber rujukan tertulis dari pakar budaya Zapin.</em>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
