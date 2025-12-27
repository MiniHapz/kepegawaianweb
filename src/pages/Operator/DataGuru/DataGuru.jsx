// src/pages/Operator/DataGuru/DataGuru.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaSearch, FaEye, FaTrash, FaEdit, 
  FaSort, FaSortUp, FaSortDown, FaTimes, FaExclamationTriangle 
} from 'react-icons/fa';

import Sidebar from '../Sidebar/Sidebar';
import './DataGuru.css';
import api from '../../../services/api';

export default function DataGuru() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [mapelFilter, setMapelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [user, setUser] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [guruToDelete, setGuruToDelete] = useState(null);


  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get('/user');
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchUser();
}, []);

 
  // Fetch data guru
  useEffect(() => {
  const fetchGuru = async () => {
    try {
      setLoading(true);
      const res = await api.get('/guru');
      setList(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data guru');
    } finally {
      setLoading(false);
    }
  };
  fetchGuru();
}, []);


  // Filter dan format tanggal
  const filteredData = useMemo(() => {
    let filtered = list.filter(guru => {
      const mapelNames = (guru.mapel || []).map(m => m.nama_mapel);
      const searchMatch = (guru.nama_lengkap + ' ' + guru.nip + ' ' + mapelNames.join(' '))
        .toLowerCase()
        .includes(query.toLowerCase());
      const mapelMatch = mapelFilter === 'all' || mapelNames.includes(mapelFilter);
      const statusMatch = statusFilter === 'all' || guru.status_kepegawaian === statusFilter;
      return searchMatch && mapelMatch && statusMatch;
    });

    // Sort berdasarkan tanggal pensiun
    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.tanggal_pensiun);
        const dateB = new Date(b.tanggal_pensiun);
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    return filtered;
  }, [list, query, mapelFilter, statusFilter, sortOrder]);

  // Fungsi toggle urutan sort
  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  };

  // Helper format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDeleteClick = (guru) => {
    setGuruToDelete(guru);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
  if (!guruToDelete) return;
  try {
    await api.delete(`/guru/${guruToDelete.nip}`);

    setList(prev => prev.filter(item => item.nip !== guruToDelete.nip));
    setShowDeleteModal(false);
    setGuruToDelete(null);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus guru');
  }
};


  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setGuruToDelete(null);
  };

  const handleToggleSidebar = () => setCollapsed(prev => !prev);
  const handleAdd = () => navigate('/operator/data-guru/tambah');
  const handleView = (nip) => navigate(`/operator/data-guru/view/${nip}`);
  const handleEdit = (nip) => navigate(`/operator/data-guru/edit/${nip}`);

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dg-app">
      <Sidebar collapsed={collapsed} onToggle={handleToggleSidebar} />
      {isMobile && !collapsed && <div className="dg-sidebar-overlay" onClick={() => setCollapsed(true)} />}
      <main className={`dg-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Spinner hanya di main content */}
        {loading && (
          <div className="loading-main">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && (
          <>
            <header className="dg-header">
              <div className="dg-header-left">
                <div className="dg-title-section">
                  <h1>Data Guru Sekolah</h1>
                  <div className="dg-subtitle">
                    {user?.sekolah?.nama_sekolah || 'Memuat...'}
                  </div>
                </div>
              </div>
              <div className="dg-header-actions">
                <button className="dg-add-btn" onClick={handleAdd}><FaPlus /><span>Tambah Guru</span></button>
              </div>
            </header>

            <div className="dg-content">
              {/* Filters */}
              <div className="dg-filters-section">
                <div className="dg-filters-grid">
                  <div className="dg-filter-group">
                    <label>Mapel</label>
                    <select value={mapelFilter} onChange={e => setMapelFilter(e.target.value)}>
                      <option value="all">Semua Mapel</option>
                      {[...new Set(list.flatMap(g => (g.mapel || []).map(m => m.nama_mapel)))].map(opt =>
                        <option key={opt} value={opt}>{opt}</option>
                      )}
                    </select>
                  </div>

                  <div className="dg-filter-group">
                    <label>Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="all">Semua Status</option>
                      {[...new Set(list.map(g => g.status_kepegawaian || ''))].map(opt =>
                        <option key={opt} value={opt}>{opt}</option>
                      )}
                    </select>
                  </div>

                  <div className="dg-filter-group dg-search-group">
                    <label>Cari Guru</label>
                    <div className="dg-search-wrapper">
                      <input
                        type="text"
                        placeholder="Nama atau NIP Guru"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="dg-table-section">
                <div className="dg-table-container">
                  <table className="dg-data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Guru</th>
                        <th>NIP</th>
                        <th>Mapel</th>
                        <th>Status</th>
                        <th style={{ cursor: 'pointer' }} onClick={handleSortToggle}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <span>Tgl Pensiun</span>
                            {sortOrder === 'asc' ? <FaSortUp /> :
                             sortOrder === 'desc' ? <FaSortDown /> :
                             <FaSort />}
                          </div>
                        </th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((guru, idx) => (
                        <tr key={guru.nip}>
                          <td><div className="dg-number-badge">{idx + 1}</div></td>
                          <td className="dg-name-cell">{guru.nama_lengkap}</td>
                          <td className="dg-nip-cell">{guru.nip}</td>
                          <td className="dg-mapel-cell">
                            {(guru.mapel || []).map((m, i) => (
                              <span key={i} className="dg-subject-chip">{m.nama_mapel}</span>
                            ))}
                          </td>
                          <td className="dg-status-cell">{(guru.status_kepegawaian || '').toUpperCase()}</td>

                          <td className="dg-date-cell">{formatDate(guru.tanggal_pensiun)}</td>
                          <td className="dg-actions-cell">

                            <button 
                              className="dg-action-btn dg-view-btn" 
                              aria-label="Lihat detail"
                              onClick={() => handleView(guru.nip)}
                              title="Lihat Detail"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="dg-action-btn dg-edit-btn" 
                              aria-label="Edit data"
                              onClick={() => handleEdit(guru.nip)}
                              title="Edit Data"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="dg-action-btn dg-delete-btn" 
                              aria-label="Hapus data"
                              onClick={() => handleDeleteClick(guru)}
                              title="Hapus Data"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr>
                          <td colSpan="7" className="dg-no-data-message">Tidak ada data ditemukan</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--dg-text-muted)', fontSize: '14px' }}>
                  Menampilkan {filteredData.length} dari {list.length} guru
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      {showDeleteModal && (
        <div className="dg-modal-overlay">
          <div className="dg-modal-container dg-delete-modal">
            <button className="dg-modal-close" onClick={handleDeleteCancel}>
              <FaTimes />
            </button>
            <div className="dg-modal-icon">
              <FaExclamationTriangle />
            </div>
            <div className="dg-modal-content">
              <h3>Konfirmasi Hapus Data Guru</h3>
              <p>
                Apakah Anda yakin ingin menghapus data guru <strong>{guruToDelete?.nama_lengkap}</strong>?
              </p>
              <p className="dg-modal-warning">Data yang dihapus tidak dapat dikembalikan.</p>
            </div>
            <div className="dg-modal-actions">
              <button className="dg-btn-modal-secondary" onClick={handleDeleteCancel}>Batal</button>
              <button className="dg-btn-modal-danger" onClick={handleDeleteConfirm}>Ya, Hapus Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}