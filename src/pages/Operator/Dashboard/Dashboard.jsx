import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import GuruActions from './GuruActions';
import axios from 'axios';
import {
  FaUserFriends,
  FaExclamationCircle,
  FaCertificate,
  FaClock,
  FaPlus,
  FaPrint,
  FaDownload,
  FaFileUpload,
  FaFileAlt,
  FaUserPlus,
  FaCheckCircle
} from 'react-icons/fa';
import './Dashboard.css';
import api from "../../../services/api";

export default function DashboardOperator() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data dari backend
  const [summary, setSummary] = useState({
    totalGuru: { label: 'Total Guru', value: '-', meta: '' },
    mapel: { label: 'Total Mapel', value: '-', meta: '' },
    akanPensiun: { label: 'Guru Akan Pensiun (3 Tahun)', value: '-', meta: '' }
  });
  const [teachers, setTeachers] = useState([]);
  const [retirements, setRetirements] = useState([]);

  // State filter & pagination
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;
  const token = localStorage.getItem('token');

  const [user, setUser] = useState(null);

  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/operator');

      setSummary(res.data.summary);
      setTeachers(res.data.guru || []);
      setRetirements(res.data.pensiun_3_tahun || []);
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboard();
}, []);


  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get('/user');
      setUser(res.data);
    } catch (err) {
      console.error('Gagal mengambil data user:', err);
    }
  };

  fetchUser();
}, []);

  const fetchRetirement = async () => {
  try {
    const res = await api.get('/guru/akan-pensiun');
    setRetirements(res.data || []);
  } catch (err) {
    console.error('Gagal memuat data pensiun:', err);
  }
};


  const mapelOptions = useMemo(() => {
    if (!summary.mapel.meta) return ['all'];
    const allMapel = summary.mapel.meta.split(',').map(m => m.trim());
    return ['all', ...allMapel];
  }, [summary.mapel.meta]);

  const statusOptions = useMemo(() => ['all', 'PNS', 'P3K', 'P3K Paruh Waktu'], []);

  // Filter hasil
  const filtered = useMemo(() => {
    return teachers.filter(t => {
      if (selectedMapel !== 'all' && !t.mapel?.includes(selectedMapel)) return false;
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      if (query && !(`${t.nama} ${t.nip} ${t.mapel?.join(' ')}`.toLowerCase().includes(query.toLowerCase())))
        return false;
      return true;
    });
  }, [teachers, selectedMapel, selectedStatus, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const handleToggle = () => setCollapsed(s => !s);

  const handleAdd = () => navigate('/operator/data-guru/tambah');

  // 🔹 DOWNLOAD CSV
  const handleDownload = () => {
    if (filtered.length === 0) {
      alert('Tidak ada data untuk didownload');
      return;
    }

    // Ambil nama sekolah dari user yang login
    const sekolahName = user?.sekolah?.nama_sekolah || '--';

    const csv = [
      [`DATA GURU - ${sekolahName}`],
      [`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`],
      [''], // baris kosong
      ['NIP', 'Nama', 'Mapel', 'Jam Mengajar', 'Status', 'Alamat'],
      ...filtered.map(t => [
        t.nip, 
        t.nama, 
        t.mapel?.join(';') || '', 
        t.jam_mengajar_per_minggu || '0', 
        t.status, 
        t.alamat || ''
      ]),
      [''], // baris kosong
      ['Total Data', filtered.length],
      [sekolahName],
      [new Date().toLocaleString('id-ID')]
    ].map(r => r.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-guru-${sekolahName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePensiun = async (nip) => {
  try {
    await api.put(`/guru/${nip}/pensiun`);
    alert(`Guru dengan NIP ${nip} telah ditandai pensiun.`);
    setTeachers(prev => prev.filter(g => g.nip !== nip));
  } catch (err) {
    alert('Gagal memproses pensiun guru.');
    console.error(err);
  }
};


  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />

      <main className={`dashboard-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Spinner hanya di main content */}
        {loading && (
          <div className="loading-main">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && (
          <>
            <header className="dashboard-header">
              <div>
                <h1>Dashboard Operator Sekolah</h1>
                <div className="dg-subtitle">
                  {user?.sekolah?.nama_sekolah || 'Memuat...'}
                </div>
              </div>

              <div className="header-actions">
                <button className="btn-primary" onClick={handleAdd}>
                  <FaPlus className="btn-icon-left" />
                  Tambah Guru
                </button>
              </div>
            </header>

            <section className="summary-cards">
              <article className="card">
                <div className="card-icon card-icon-purple"><FaUserFriends /></div>
                <div className="card-body">
                  <div className="card-label">{summary.totalGuru.label}</div>
                  <div className="card-value">{summary.totalGuru.value}</div>
                  <div className="card-meta">{summary.totalGuru.meta}</div>
                </div>
              </article>

              <article className="card">
                <div className="card-icon card-icon-purple"><FaCertificate /></div>
                <div className="card-body">
                  <div className="card-label">{summary.mapel.label}</div>
                  <div className="card-value">{summary.mapel.value}</div>
                </div>
              </article>

              <article className="card">
                <div className="card-icon card-icon-purple"><FaClock /></div>
                <div className="card-body">
                  <div className="card-label">{summary.akanPensiun.label} (3 Tahun)</div>
                  <div className="card-value">{summary.akanPensiun.value}</div>
                  <div className="card-meta">{summary.akanPensiun.meta}</div>
                </div>
              </article>
            </section>

            <section className="filters">
              <div className="filter-row">
                <select value={selectedMapel} onChange={e => { setSelectedMapel(e.target.value); setPage(1); }}>
                  {mapelOptions.map(m => (
                    <option key={m} value={m}>{m === 'all' ? 'Semua Mata Pelajaran' : m}</option>
                  ))}
                </select>

                <select value={selectedStatus} onChange={e => { setSelectedStatus(e.target.value); setPage(1); }}>
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s === 'all' ? 'Semua Status' : s}</option>
                  ))}
                </select>

                <div className="search-wrapper">
                  <input
                    placeholder="Cari Nama / NIP Guru"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
            </section>

            <section className="table-section">
              <div className="table-header">
                <h2>Data Guru Berdasarkan Mapel</h2>
                <div className="table-actions">
                  <button className="btn-ghost" onClick={handleDownload}><FaDownload /> Download CSV</button>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Guru</th>
                      <th>Mata Pelajaran</th>
                      <th>Jam Mengajar</th>
                      <th>Status</th>
                      <th>Alamat</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.length === 0 && (
                      <tr><td colSpan="7" className="no-data">Tidak ada data</td></tr>
                    )}

                    {pageItems.map((t, idx) => (
                      <tr key={t.nip}>
                        <td>{(page - 1) * perPage + idx + 1}</td>
                        <td>
                          <div className="teacher-name">{t.nama}</div>
                          <div className="teacher-nip">NIP: {t.nip}</div>
                        </td>
                        <td>
                          <div className="badges">
                            {t.mapel?.map(m => <span key={m} className="badge">{m}</span>)}
                          </div>
                        </td>
                        <td>{t.jam_mengajar_per_minggu}</td>
                        <td>
                          <span className={`status-pill status-${t.status}`}>
                            {t.status.toUpperCase().replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>{t.alamat}</td>
                        <td className="actions-cell">
                          <GuruActions guru={t} onDelete={() => handlePensiun(t.nip)} showDelete={true} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Sebelumnya</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} className={`page-num ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Selanjutnya</button>
              </div>
            </section>

            <section className="below-panel">
              <div className="retirement-section">
                <div className="retirement-panel">
                  <div className="retirement-header">
                    <h3>Guru Akan Pensiun (3 Tahun)</h3>
                  </div>

                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Nama</th>
                          <th>NIP</th>
                          <th>Jabatan</th>
                          <th>Tanggal Pensiun</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retirements.length === 0 ? (
                          <tr><td colSpan="6" className="no-data">Tidak ada data pensiun</td></tr>
                        ) : (
                          retirements.map((r, i) => (
                            <tr key={r.id}>
                              <td>{i + 1}</td>
                              <td className="ret-name">{r.nama}</td>
                              <td className="ret-nip">{r.nip}</td>
                              <td>{r.jab || '-'}</td>
                              <td>{r.tgl ? new Date(r.tgl).toLocaleDateString('id-ID') : '-'}</td>
                              <td className="actions-cell">
                                <GuruActions guru={r} onDelete={handlePensiun} showDelete={false} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}